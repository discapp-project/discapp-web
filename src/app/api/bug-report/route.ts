import { NextResponse } from "next/server";
import { readLimitedBody, RequestBodyTooLargeError } from "../read-limited-body";

const maxRequestBytes = 8 * 1024;
const rateLimitWindowMs = 10 * 60 * 1000;
const maxReportsPerWindow = 3;
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const webhookPathPattern = /^\/api\/webhooks\/\d{17,20}\/[A-Za-z0-9._-]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim()
    ?? request.headers.get("host")?.trim();
  if (!origin || !requestHost) return false;

  try {
    const parsedOrigin = new URL(origin);
    return (parsedOrigin.protocol === "https:" || parsedOrigin.protocol === "http:")
      && parsedOrigin.host === requestHost;
  } catch {
    return false;
  }
}

function getWebhookUrl(value: string | undefined) {
  if (!value || value.length > 512) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:"
      || !["discord.com", "discordapp.com"].includes(url.hostname)
      || url.port
      || url.username
      || url.password
      || url.search
      || url.hash
      || !webhookPathPattern.test(url.pathname)
    ) {
      return null;
    }
    return new URL(url.pathname, `https://${url.hostname}`);
  } catch {
    return null;
  }
}

function sanitizeText(value: unknown, maxLength: number, multiline = false) {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFKC").replace(/\r\n?/g, "\n");
  const controlChars = multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  const clean = normalized.replace(controlChars, "").trim();
  return clean.length > 0 && clean.length <= maxLength ? clean : null;
}

function sanitizePage(value: unknown) {
  if (
    typeof value !== "string"
    || value.length > 512
    || !value.startsWith("/")
    || value.startsWith("//")
    || /[\u0000-\u0020\u007F?#]/.test(value)
  ) {
    return null;
  }
  return value;
}

function sanitizeDimension(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 10_000
    ? String(value)
    : null;
}

function checkRateLimit(request: Request) {
  const forwardedIp = request.headers.get("x-nf-client-connection-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const key = forwardedIp && /^[\da-fA-F:.]{3,64}$/.test(forwardedIp) ? forwardedIp : "unknown";
  const now = Date.now();

  for (const [ip, limit] of rateLimits) {
    if (limit.resetAt <= now) rateLimits.delete(ip);
  }

  const current = rateLimits.get(key);
  if (current && current.count >= maxReportsPerWindow) return false;
  if (!current && rateLimits.size >= 10_000) {
    const oldestKey = rateLimits.keys().next().value;
    if (oldestKey) rateLimits.delete(oldestKey);
  }
  rateLimits.set(key, current
    ? { ...current, count: current.count + 1 }
    : { count: 1, resetAt: now + rateLimitWindowMs });
  return true;
}

async function verifyHCaptcha(token: string) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return false;

  const params = new URLSearchParams({ response: token, secret });
  const response = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return false;

  const result: unknown = await response.json();
  return isRecord(result) && result.success === true;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ message: "Content-Type must be application/json." }, { status: 415 });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > maxRequestBytes) {
    return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  }

  let bodyText: string;
  try {
    bodyText = await readLimitedBody(request, maxRequestBytes);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ message: "Request is too large." }, { status: 413 });
    }
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const title = sanitizeText(body.title, 80);
  const details = sanitizeText(body.details, 2500, true);
  const page = sanitizePage(body.page);
  const deviceInfo = isRecord(body.deviceInfo) ? body.deviceInfo : {};
  const captchaToken = typeof body.captchaToken === "string" && body.captchaToken.length <= 4096
    ? body.captchaToken.trim()
    : "";
  if (!title || !details || details.length < 10 || !page || !captchaToken) {
    return NextResponse.json({ message: "Please provide a valid title, description, page, and CAPTCHA." }, { status: 400 });
  }

  const webhookUrl = getWebhookUrl(process.env.BUG_HOOK);
  if (!webhookUrl) {
    return NextResponse.json({ message: "Bug reporting is temporarily unavailable." }, { status: 503 });
  }

  try {
    if (!await verifyHCaptcha(captchaToken)) {
      return NextResponse.json({ message: "CAPTCHA verification failed. Please try again." }, { status: 400 });
    }

    if (!checkRateLimit(request)) {
      return NextResponse.json({ message: "Too many reports. Please try again later." }, { status: 429 });
    }

    const userAgent = sanitizeText(request.headers.get("user-agent"), 512) ?? "Not available";
    const display = (width: unknown, height: unknown) => {
      const sanitizedWidth = sanitizeDimension(width);
      const sanitizedHeight = sanitizeDimension(height);
      return sanitizedWidth && sanitizedHeight
        ? `${sanitizedWidth} × ${sanitizedHeight}`
        : "Not available";
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: `Bug report: ${title}`,
          description: details,
          fields: [
            { name: "Page", value: page },
            { name: "Browser", value: userAgent },
            {
              name: "Device details",
              value: [
                `Platform: ${sanitizeText(deviceInfo.platform, 100) ?? "Not available"}`,
                `Language: ${sanitizeText(deviceInfo.language, 64) ?? "Not available"}`,
                `Time zone: ${sanitizeText(deviceInfo.timeZone, 100) ?? "Not available"}`,
                `Screen: ${display(deviceInfo.screenWidth, deviceInfo.screenHeight)}`,
                `Viewport: ${display(deviceInfo.viewportWidth, deviceInfo.viewportHeight)}`,
                `Pixel ratio: ${typeof deviceInfo.pixelRatio === "number"
                  && Number.isFinite(deviceInfo.pixelRatio)
                  && deviceInfo.pixelRatio > 0
                  && deviceInfo.pixelRatio <= 10
                  ? deviceInfo.pixelRatio
                  : "Not available"}`,
              ].join("\n"),
            },
          ],
          color: 11335333,
        }],
        allowed_mentions: { parse: [] },
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Bug reporting is temporarily unavailable." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Bug reporting is temporarily unavailable." }, { status: 502 });
  }
}
