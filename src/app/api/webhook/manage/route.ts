import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const allowedHosts = new Set(["discord.com", "discordapp.com"]);
const webhookPathPattern = /^\/api\/webhooks\/(\d{17,20})\/[A-Za-z0-9._-]+$/;
const messagePathPattern = /^\/channels\/(?:\d{17,20}|@me)\/\d{17,20}\/(\d{17,20})$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseWebhookUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 512) return null;
  try {
    const url = new URL(value.trim());
    const match = webhookPathPattern.exec(url.pathname);
    if (
      url.protocol !== "https:"
      || !allowedHosts.has(url.hostname)
      || url.port
      || url.username
      || url.password
      || !match
    ) return null;
    return {
      url: new URL(url.pathname, `https://${url.hostname}`),
      id: match[1],
    };
  } catch {
    return null;
  }
}

function parseMessageId(value: unknown) {
  if (typeof value !== "string" || value.length > 512) return null;
  try {
    const url = new URL(value.trim());
    const match = messagePathPattern.exec(url.pathname);
    if (
      url.protocol !== "https:"
      || !allowedHosts.has(url.hostname)
      || url.port
      || url.username
      || url.password
      || !match
    ) return null;
    return match[1];
  } catch {
    return null;
  }
}

function sanitizeEmbed(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  const embed: Record<string, unknown> = {};
  for (const key of ["title", "url", "description", "timestamp"] as const) {
    if (typeof value[key] === "string") embed[key] = value[key];
  }
  if (typeof value.color === "number" && Number.isInteger(value.color)) embed.color = value.color;
  for (const key of ["author", "footer"] as const) {
    const source = value[key];
    if (!isRecord(source)) continue;
    const fields = key === "author" ? ["name", "url", "icon_url"] : ["text", "icon_url"];
    const nested: Record<string, unknown> = {};
    for (const field of fields) {
      if (typeof source[field] === "string") nested[field] = source[field];
    }
    if (Object.keys(nested).length) embed[key] = nested;
  }
  for (const key of ["thumbnail", "image"] as const) {
    const media = value[key];
    if (isRecord(media) && typeof media.url === "string") embed[key] = { url: media.url };
  }
  if (Array.isArray(value.fields)) {
    embed.fields = value.fields.flatMap((field) => {
      if (!isRecord(field) || typeof field.name !== "string" || typeof field.value !== "string") return [];
      return [{
        name: field.name,
        value: field.value,
        ...(typeof field.inline === "boolean" && { inline: field.inline }),
      }];
    });
  }
  return Object.keys(embed).length ? embed : null;
}

function sanitizeComponent(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value) || typeof value.type !== "number") return null;
  switch (value.type) {
    case 1: {
      if (!Array.isArray(value.components)) return null;
      const components = value.components.flatMap((component) => {
        const sanitized = sanitizeComponent(component);
        return sanitized ? [sanitized] : [];
      });
      return components.length ? { type: 1, components } : null;
    }
    case 2:
      return value.style === 5 && typeof value.label === "string" && typeof value.url === "string"
        ? { type: 2, style: 5, label: value.label, url: value.url }
        : null;
    case 9: {
      if (!Array.isArray(value.components) || !isRecord(value.accessory)) return null;
      const components = value.components.flatMap((component) => {
        const sanitized = sanitizeComponent(component);
        return sanitized ? [sanitized] : [];
      });
      const accessory = sanitizeComponent(value.accessory);
      return components.length && accessory ? { type: 9, components, accessory } : null;
    }
    case 10:
      return typeof value.content === "string" ? { type: 10, content: value.content } : null;
    case 11:
      return isRecord(value.media) && typeof value.media.url === "string"
        ? { type: 11, media: { url: value.media.url } }
        : null;
    case 12: {
      if (!Array.isArray(value.items)) return null;
      const items = value.items.flatMap((item) => {
        if (!isRecord(item) || !isRecord(item.media) || typeof item.media.url !== "string") return [];
        return [{
          media: { url: item.media.url },
          ...(typeof item.description === "string" && { description: item.description }),
          ...(typeof item.spoiler === "boolean" && { spoiler: item.spoiler }),
        }];
      });
      return items.length ? { type: 12, items } : null;
    }
    case 14:
      return typeof value.divider === "boolean" && (value.spacing === 1 || value.spacing === 2)
        ? { type: 14, divider: value.divider, spacing: value.spacing }
        : null;
    case 17: {
      if (!Array.isArray(value.components)) return null;
      const components = value.components.flatMap((component) => {
        const sanitized = sanitizeComponent(component);
        return sanitized ? [sanitized] : [];
      });
      return components.length
        ? { type: 17, ...(typeof value.accent_color === "number" && { accent_color: value.accent_color }), components }
        : null;
    }
    default:
      return null;
  }
}

async function discordError(response: Response) {
  let message = "Discord rejected the request.";
  try {
    const body: unknown = await response.json();
    if (isRecord(body) && typeof body.message === "string") message = body.message.slice(0, 500);
  } catch {
  }
  return NextResponse.json({ message }, { status: response.status >= 400 && response.status < 600 ? response.status : 502 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 16 * 1024) {
      return NextResponse.json({ message: "Request is too large." }, { status: 413 });
    }
    body = JSON.parse(text) as unknown;
  } catch {
    return NextResponse.json({ message: "Request body is invalid." }, { status: 400 });
  }

  if (!isRecord(body)) return NextResponse.json({ message: "Request body must be an object." }, { status: 400 });
  const webhook = parseWebhookUrl(body.webhookUrl);
  if (!webhook) return NextResponse.json({ message: "Enter a valid Discord webhook URL." }, { status: 400 });

  if (body.action === "profile") {
    try {
      const response = await fetch(webhook.url, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) return discordError(response);
      const result: unknown = await response.json();
      if (!isRecord(result) || typeof result.name !== "string") {
        return NextResponse.json({ message: "Discord returned invalid webhook profile data." }, { status: 502 });
      }
      const avatar = typeof result.avatar === "string"
        ? `https://cdn.discordapp.com/avatars/${webhook.id}/${result.avatar}.${result.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
        : "";
      return NextResponse.json({ username: result.name, avatarUrl: avatar });
    } catch {
      return NextResponse.json({ message: "Could not reach Discord to load the webhook profile." }, { status: 502 });
    }
  }

  if (body.action === "load_message") {
    const messageId = parseMessageId(body.messageUrl);
    if (!messageId) return NextResponse.json({ message: "Enter a valid Discord message link." }, { status: 400 });
    const messageUrl = new URL(`${webhook.url.pathname}/messages/${messageId}`, webhook.url.origin);
    messageUrl.searchParams.set("with_components", "true");

    try {
      const response = await fetch(messageUrl, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) return discordError(response);
      const message: unknown = await response.json();
      if (!isRecord(message)) return NextResponse.json({ message: "Discord returned invalid message data." }, { status: 502 });

      const rawFlags = typeof message.flags === "number" && Number.isInteger(message.flags) ? message.flags : 0;
      const flags = rawFlags & ((1 << 2) | (1 << 12) | (1 << 15));
      const payload: Record<string, unknown> = {};
      if (typeof message.content === "string" && message.content && (flags & (1 << 15)) === 0) {
        payload.content = message.content;
      }
      if (Array.isArray(message.embeds) && (flags & (1 << 15)) === 0) {
        const embeds = message.embeds.flatMap((embed) => {
          const sanitized = sanitizeEmbed(embed);
          return sanitized ? [sanitized] : [];
        });
        if (embeds.length) payload.embeds = embeds;
      }
      if (flags !== 0) payload.flags = flags;
      if ((flags & (1 << 15)) !== 0 && Array.isArray(message.components)) {
        const components = message.components.flatMap((component) => {
          const sanitized = sanitizeComponent(component);
          return sanitized ? [sanitized] : [];
        });
        if (components.length) payload.components = components;
      }
      if (!Object.keys(payload).length) {
        return NextResponse.json({ message: "This message has no editable content supported by the builder." }, { status: 400 });
      }
      return NextResponse.json({ payload });
    } catch {
      return NextResponse.json({ message: "Could not reach Discord to load the message." }, { status: 502 });
    }
  }

  return NextResponse.json({ message: "Unsupported webhook action." }, { status: 400 });
}
