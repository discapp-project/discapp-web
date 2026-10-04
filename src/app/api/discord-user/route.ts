import { NextResponse } from 'next/server';

// In-memory rate limit lock timestamp (in ms)
let rateLimitResetTime = 0;

/**
 * Validates and sanitizes a Discord Snowflake ID.
 * Discord IDs are 17 to 20 digit numeric strings.
 */
function sanitizeSnowflake(id: unknown): string | null {
  if (typeof id !== 'string') return null;
  const cleanId = id.trim();
  return /^\d{17,20}$/.test(cleanId) ? cleanId : null;
}

/**
 * Verifies the hCaptcha token server-side.
 */
async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error('Security Alert: HCAPTCHA_SECRET_KEY is missing from environment.');
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append('response', token);
    params.append('secret', secret);

    const res = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('Failed to verify hCaptcha token:', err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Basic payload size check to prevent memory allocation attacks
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 10240) { // 10KB limit
      return NextResponse.json(
        { message: 'Payload size exceeds limit.' },
        { status: 413 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { message: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const { userId, captchaToken } = body;

    // 1. Sanitize & Validate Input
    const cleanUserId = sanitizeSnowflake(userId);
    if (!cleanUserId) {
      return NextResponse.json(
        { message: 'Invalid Discord User ID format. Snowflake must be a 17-20 digit number.' },
        { status: 400 }
      );
    }

    if (!captchaToken || typeof captchaToken !== 'string') {
      return NextResponse.json(
        { message: 'CAPTCHA token is required.' },
        { status: 422 }
      );
    }

    // 2. CAPTCHA Verification
    const isCaptchaValid = await verifyHCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { message: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // 3. Check Local Rate Limit Lockout
    const now = Date.now();
    if (now < rateLimitResetTime) {
      const waitSeconds = Math.ceil((rateLimitResetTime - now) / 1000);
      return NextResponse.json(
        {
          message: `Service rate limit active. Please retry in ${waitSeconds} second(s).`,
          retryAfter: waitSeconds,
        },
        { status: 429 }
      );
    }

    // 4. Validate Server Environment Configuration
    const botToken = process.env.BOTLESS_TOKEN;
    if (!botToken) {
      console.error('Configuration Error: BOTLESS_TOKEN is missing in environment variables.');
      // Generic error message to prevent revealing internal env details
      return NextResponse.json(
        { message: 'Service temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    const formattedToken = botToken.trim().startsWith('Bot ')
      ? botToken.trim()
      : `Bot ${botToken.trim()}`;

    // 5. Query Discord API
    const discordRes = await fetch(
      `https://discord.com/api/v10/users/${cleanUserId}`,
      {
        headers: {
          Authorization: formattedToken,
        },
        cache: 'no-store',
      }
    );

    // Rate Limit Header Inspection
    const remaining = discordRes.headers.get('X-RateLimit-Remaining');
    const resetAfter = discordRes.headers.get('X-RateLimit-Reset-After');

    if (resetAfter) {
      const resetDelayMs = parseFloat(resetAfter) * 1000;
      if (remaining === '0' || discordRes.status === 429) {
        rateLimitResetTime = Date.now() + resetDelayMs;
      }
    }

    const data = await discordRes.json();

    if (!discordRes.ok) {
      const retryAfter = data.retry_after || (resetAfter ? Math.ceil(parseFloat(resetAfter)) : 5);
      
      // Generic sanitized status messages
      if (discordRes.status === 404) {
        return NextResponse.json({ message: 'Discord user not found.' }, { status: 404 });
      }

      if (discordRes.status === 429) {
        return NextResponse.json(
          { message: `Rate limit reached. Please wait ${retryAfter} seconds.`, retryAfter },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: 'Failed to retrieve requested user data from Discord API.' },
        { status: discordRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    // Mask raw stack traces / error messages
    console.error('Unhandled API Error:', error);
    return NextResponse.json(
      { message: 'An unexpected internal error occurred.' },
      { status: 500 }
    );
  }
}