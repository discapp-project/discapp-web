import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const maxRequestBytes = 24 * 1024 * 1024;
const webhookPathPattern = /^\/api\/webhooks\/\d{17,20}\/[A-Za-z0-9._-]+$/;
const allowedHosts = new Set(["discord.com", "discordapp.com"]);
const allowedEmbedKeys = new Set(["author", "title", "url", "description", "color", "thumbnail", "image", "footer", "timestamp", "fields"]);
const componentsV2Flag = 1 << 15;
const allowedMessageFlags = (1 << 2) | (1 << 12) | componentsV2Flag;

type IncomingRequest = {
  webhookUrl: unknown;
  threadId: unknown;
  payload: unknown;
  files: File[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseWebhookUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 512) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname) || url.port || url.username || url.password || !webhookPathPattern.test(url.pathname)) {
      return null;
    }
    return new URL(url.pathname, `https://${url.hostname}`);
  } catch {
    return null;
  }
}

function isHttpUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function safeFilename(file: File) {
  return file.name.split(/[\\/]/).pop()?.replace(/[\r\n\0]/g, "_").slice(0, 100) || "attachment";
}

function validateEmbeds(value: unknown, fileNames: Set<string>) {
  if (value === undefined) return null;
  if (!Array.isArray(value) || value.length > 10) return "A message can contain up to 10 embeds.";

  let totalCharacters = 0;
  for (const [index, embed] of value.entries()) {
    if (!isRecord(embed) || Object.keys(embed).some((key) => !allowedEmbedKeys.has(key))) {
      return `Embed ${index + 1} contains unsupported fields.`;
    }

    const author = embed.author;
    const footer = embed.footer;
    if (author !== undefined && !isRecord(author)) return `Embed ${index + 1} has invalid author data.`;
    if (footer !== undefined && !isRecord(footer)) return `Embed ${index + 1} has invalid footer data.`;

    const textValues = [embed.title, embed.description, author && author.name, footer && footer.text];
    if (textValues.some((text) => text !== undefined && typeof text !== "string")) return `Embed ${index + 1} has invalid text.`;
    const [title, description, authorName, footerText] = textValues as (string | undefined)[];
    if ((title?.length ?? 0) > 256 || (description?.length ?? 0) > 4096 || (authorName?.length ?? 0) > 256 || (footerText?.length ?? 0) > 2048) {
      return `Embed ${index + 1} exceeds a Discord text limit.`;
    }
    totalCharacters += (title?.length ?? 0) + (description?.length ?? 0) + (authorName?.length ?? 0) + (footerText?.length ?? 0);

    if (embed.url !== undefined && !isHttpUrl(embed.url)) return `Embed ${index + 1} has an invalid URL.`;
    for (const [item, urlFields, label] of [[author, ["url", "icon_url"], "author"], [footer, ["icon_url"], "footer"]] as const) {
      if (!item) continue;
      for (const field of urlFields) {
        if (item[field] !== undefined && !isHttpUrl(item[field])) return `Embed ${index + 1} has an invalid ${label} URL.`;
      }
    }

    for (const key of ["thumbnail", "image"] as const) {
      const media = embed[key];
      if (media === undefined) continue;
      if (!isRecord(media) || typeof media.url !== "string") return `Embed ${index + 1} has invalid ${key} data.`;
      const isUploadedFile = media.url.startsWith("attachment://") && fileNames.has(media.url.slice("attachment://".length));
      if (!isHttpUrl(media.url) && !isUploadedFile) return `Embed ${index + 1} has an invalid ${key} URL.`;
    }

    if (embed.fields !== undefined) {
      if (!Array.isArray(embed.fields) || embed.fields.length > 25) return `Embed ${index + 1} can contain up to 25 fields.`;
      for (const field of embed.fields) {
        if (!isRecord(field) || typeof field.name !== "string" || typeof field.value !== "string" || field.name.length > 256 || field.value.length > 1024) {
          return `Embed ${index + 1} has an invalid field.`;
        }
        totalCharacters += field.name.length + field.value.length;
      }
    }
  }

  return totalCharacters > 6000 ? "Combined embed text must not exceed 6,000 characters." : null;
}

function validateComponents(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 40) {
    return "A Components V2 message must contain between 1 and 40 components.";
  }

  let componentCount = 0;
  const validateComponent = (component: unknown, inContainer = false): string | null => {
    if (!isRecord(component) || typeof component.type !== "number") return "A message component is invalid.";
    componentCount += 1;
    if (componentCount > 40) return "A Components V2 message can contain up to 40 components.";

    switch (component.type) {
      case 1: {
        if (Object.keys(component).some((key) => !["type", "components"].includes(key)) || !Array.isArray(component.components) || component.components.length === 0 || component.components.length > 5) {
          return "An action row must contain between 1 and 5 buttons.";
        }
        for (const button of component.components) {
          if (!isRecord(button) || Object.keys(button).some((key) => !["type", "style", "label", "url"].includes(key)) || button.type !== 2 || button.style !== 5 || typeof button.label !== "string" || !button.label.trim() || button.label.length > 80 || !isHttpUrl(button.url)) {
            return "Only valid link buttons are supported in action rows.";
          }
          componentCount += 1;
        }
        return componentCount > 40 ? "A Components V2 message can contain up to 40 components." : null;
      }
      case 9: {
        if (Object.keys(component).some((key) => !["type", "components", "accessory"].includes(key)) || !Array.isArray(component.components) || component.components.length === 0 || component.components.length > 3) {
          return "A section must contain between 1 and 3 Text Display components.";
        }
        for (const text of component.components) {
          if (!isRecord(text) || text.type !== 10 || Object.keys(text).some((key) => !["type", "content"].includes(key)) || typeof text.content !== "string" || text.content.length > 4000) {
            return "A section contains an invalid Text Display.";
          }
          componentCount += 1;
        }
        const accessory = component.accessory;
        if (!isRecord(accessory)) return "A section must have a valid button or thumbnail accessory.";
        if (accessory.type === 11) {
          if (Object.keys(accessory).some((key) => !["type", "media"].includes(key)) || !isRecord(accessory.media) || Object.keys(accessory.media).some((key) => !["url"].includes(key)) || !isHttpUrl(accessory.media.url)) {
            return "A section thumbnail has an invalid URL.";
          }
        } else if (accessory.type === 2) {
          if (Object.keys(accessory).some((key) => !["type", "style", "label", "url"].includes(key)) || accessory.style !== 5 || typeof accessory.label !== "string" || !accessory.label.trim() || accessory.label.length > 80 || !isHttpUrl(accessory.url)) {
            return "A section link button is invalid.";
          }
        } else {
          return "A section must have a valid button or thumbnail accessory.";
        }
        componentCount += 1;
        return componentCount > 40 ? "A Components V2 message can contain up to 40 components." : null;
      }
      case 10:
        return Object.keys(component).some((key) => !["type", "content"].includes(key)) || typeof component.content !== "string" || component.content.length > 4000
          ? "A Text Display must contain 4,000 characters or fewer."
          : null;
      case 12: {
        if (Object.keys(component).some((key) => !["type", "items"].includes(key)) || !Array.isArray(component.items) || component.items.length === 0 || component.items.length > 10) {
          return "A Media Gallery must contain between 1 and 10 items.";
        }
        for (const item of component.items) {
          if (!isRecord(item) || Object.keys(item).some((key) => !["media", "description", "spoiler"].includes(key)) || !isRecord(item.media) || Object.keys(item.media).some((key) => key !== "url") || !isHttpUrl(item.media.url) || (item.spoiler !== undefined && typeof item.spoiler !== "boolean") || (item.description !== undefined && (typeof item.description !== "string" || item.description.length > 1024))) {
            return "A Media Gallery contains an invalid item.";
          }
        }
        componentCount += component.items.length;
        return componentCount > 40 ? "A Components V2 message can contain up to 40 components." : null;
      }
      case 14:
        return inContainer && Object.keys(component).some((key) => !["type", "divider", "spacing"].includes(key)) ||
          (component.divider !== undefined && typeof component.divider !== "boolean") ||
          (component.spacing !== undefined && component.spacing !== 1 && component.spacing !== 2)
          ? "A Separator component is invalid."
          : null;
      case 17: {
        if (inContainer || Object.keys(component).some((key) => !["type", "accent_color", "components"].includes(key)) || !Array.isArray(component.components) || component.components.length === 0 || component.components.length > 10) {
          return "A Container must contain between 1 and 10 components.";
        }
        if (component.accent_color !== undefined && (!Number.isInteger(component.accent_color) || (component.accent_color as number) < 0 || (component.accent_color as number) > 0xffffff)) {
          return "A Container accent color is invalid.";
        }
        for (const child of component.components) {
          const error = validateComponent(child, true);
          if (error) return error;
        }
        return null;
      }
      default:
        return "The message contains an unsupported Components V2 component.";
    }
  };

  for (const component of value) {
    const error = validateComponent(component);
    if (error) return error;
  }
  return null;
}

function validatePayload(payload: unknown, files: File[]) {
  if (!isRecord(payload)) return "Message payload must be an object.";
  const allowedKeys = new Set(["content", "username", "avatar_url", "tts", "embeds", "allowed_mentions", "flags", "components", "thread_name", "applied_tags"]);
  if (Object.keys(payload).some((key) => !allowedKeys.has(key))) return "Message payload contains unsupported fields.";
  if (payload.content !== undefined && (typeof payload.content !== "string" || payload.content.length > 2000)) return "Message content must be 2,000 characters or fewer.";
  if (payload.username !== undefined && (typeof payload.username !== "string" || payload.username.length > 80)) return "Webhook username must be 80 characters or fewer.";
  if (payload.avatar_url !== undefined && !isHttpUrl(payload.avatar_url)) return "Avatar URL must use HTTP or HTTPS.";
  if (payload.tts !== undefined && typeof payload.tts !== "boolean") return "TTS must be a boolean value.";
  if (payload.flags !== undefined && (!Number.isInteger(payload.flags) || ((payload.flags as number) & ~allowedMessageFlags) !== 0)) return "Unsupported message flags.";
  if (payload.thread_name !== undefined && (typeof payload.thread_name !== "string" || payload.thread_name.length > 100)) return "Thread name must be 100 characters or fewer.";
  if (payload.applied_tags !== undefined && (!Array.isArray(payload.applied_tags) || payload.applied_tags.length > 5 || payload.applied_tags.some((tag) => typeof tag !== "string" || !/^\d{17,20}$/.test(tag)))) {
    return "Forum tags must be valid Discord IDs, with up to 5 tags.";
  }

  if (payload.allowed_mentions !== undefined) {
    const mentions = payload.allowed_mentions;
    if (!isRecord(mentions) || !Array.isArray(mentions.parse) || mentions.parse.some((item) => !["everyone", "users", "roles"].includes(String(item)))) {
      return "Mention settings are invalid.";
    }
  }

  const isComponentsV2 = typeof payload.flags === "number" && (payload.flags & componentsV2Flag) !== 0;
  if (isComponentsV2) {
    if (payload.content !== undefined || payload.embeds !== undefined) return "Components V2 messages cannot include content or embeds.";
    const componentError = validateComponents(payload.components);
    if (componentError) return componentError;
  } else if (payload.components !== undefined) {
    return "Components must use the Components V2 message flag.";
  }

  const fileNames = new Set(files.map(safeFilename));
  const embedError = validateEmbeds(payload.embeds, fileNames);
  if (embedError) return embedError;

  const hasContent = typeof payload.content === "string" && payload.content.trim().length > 0;
  const hasEmbeds = Array.isArray(payload.embeds) && payload.embeds.length > 0;
  return !isComponentsV2 && !hasContent && !hasEmbeds && files.length === 0 ? "Add message text, an embed, or an attachment before sending." : null;
}

async function parseIncomingRequest(request: Request): Promise<IncomingRequest> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const payloadText = form.get("payload");
    if (typeof payloadText !== "string") throw new Error("Invalid payload.");
    const fileParts = form.getAll("files");
    if (fileParts.some((part) => !(part instanceof File))) throw new Error("Invalid attachments.");
    return {
      webhookUrl: form.get("webhookUrl"),
      threadId: form.get("threadId"),
      payload: JSON.parse(payloadText) as unknown,
      files: fileParts as File[],
    };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 128 * 1024) throw new Error("Request is too large.");
  const parsed: unknown = JSON.parse(text);
  if (!isRecord(parsed)) throw new Error("Request body must be an object.");
  return { webhookUrl: parsed.webhookUrl, threadId: parsed.threadId, payload: parsed.payload, files: [] };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxRequestBytes) {
    return NextResponse.json({ message: "Request is too large. Keep total attachments under 24 MB." }, { status: 413 });
  }

  let body: IncomingRequest;
  try {
    body = await parseIncomingRequest(request);
  } catch (error) {
    const isTooLarge = error instanceof Error && error.message === "Request is too large.";
    return NextResponse.json({ message: isTooLarge ? error.message : "Request body is invalid." }, { status: isTooLarge ? 413 : 400 });
  }

  const webhookUrl = parseWebhookUrl(body.webhookUrl);
  if (!webhookUrl) return NextResponse.json({ message: "Enter a valid Discord webhook URL." }, { status: 400 });
  if (body.threadId !== undefined && body.threadId !== "" && (typeof body.threadId !== "string" || !/^\d{17,20}$/.test(body.threadId))) {
    return NextResponse.json({ message: "Thread ID must be a 17–20 digit Discord ID." }, { status: 400 });
  }
  if (body.files.length > 10) return NextResponse.json({ message: "Attach up to 10 files." }, { status: 413 });
  if (body.files.reduce((total, file) => total + file.size, 0) > maxRequestBytes) {
    return NextResponse.json({ message: "Keep total attachments under 24 MB." }, { status: 413 });
  }

  const payloadError = validatePayload(body.payload, body.files);
  if (payloadError) return NextResponse.json({ message: payloadError }, { status: 400 });

  webhookUrl.searchParams.set("wait", "true");
  if (isRecord(body.payload) && typeof body.payload.flags === "number" && (body.payload.flags & componentsV2Flag) !== 0) {
    webhookUrl.searchParams.set("with_components", "true");
  }
  if (typeof body.threadId === "string" && body.threadId) webhookUrl.searchParams.set("thread_id", body.threadId);

  const hasFiles = body.files.length > 0;
  let outgoingBody: BodyInit;
  let headers: HeadersInit | undefined;
  if (hasFiles) {
    const form = new FormData();
    const payload = body.payload as Record<string, unknown>;
    form.set("payload_json", JSON.stringify({
      ...payload,
      attachments: body.files.map((file, index) => ({ id: String(index), filename: safeFilename(file) })),
    }));
    body.files.forEach((file, index) => form.append(`files[${index}]`, file, safeFilename(file)));
    outgoingBody = form;
  } else {
    outgoingBody = JSON.stringify(body.payload);
    headers = { "content-type": "application/json" };
  }

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: outgoingBody,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
    if (discordResponse.ok) return NextResponse.json({ ok: true, message: "Webhook delivered." });

    let discordMessage = "Discord rejected the webhook request.";
    let retryAfter: number | undefined;
    try {
      const responseBody: unknown = await discordResponse.json();
      if (isRecord(responseBody)) {
        if (typeof responseBody.message === "string") discordMessage = responseBody.message.slice(0, 500);
        if (typeof responseBody.retry_after === "number") retryAfter = responseBody.retry_after;
      }
    } catch {
    }

    return NextResponse.json(
      { message: discordMessage, status: discordResponse.status, retryAfter },
      { status: discordResponse.status >= 400 && discordResponse.status < 600 ? discordResponse.status : 502 },
    );
  } catch {
    return NextResponse.json({ message: "Could not reach Discord. Check your connection and try again." }, { status: 502 });
  }
}
