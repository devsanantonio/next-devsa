import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { isMagenConfigured, verifySession } from "@/lib/magen";

export async function POST(request: Request) {
  const token = process.env.STATUS_API_TOKEN;
  const botBaseUrl = process.env.DISCORD_BOT_BASE_URL || "https://devsa-discord-bot.onrender.com";

  if (!token) {
    return NextResponse.json(
      { ok: false, code: "BOT_AUTH_NOT_CONFIGURED", message: "Bot auth is not configured." },
      { status: 500 },
    );
  }

  // Rate limit: 3 pings per IP per 5 minutes
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success, remaining, resetMs } = rateLimit(ip, 3, 5 * 60 * 1000);

  if (!success) {
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED",
        message: `Too many pings. Try again in ${Math.ceil(resetMs / 1000)}s.`,
      },
      { status: 429 },
    );
  }

  // Parse and validate body
  let userName: string | undefined;
  let userMessage: string | undefined;
  let magenSessionId: string | undefined;

  try {
    const body = await request.json();

    if (typeof body?.name === "string" && body.name.trim()) {
      userName = sanitizeInput(body.name.trim().slice(0, 100));
    }
    if (typeof body?.message === "string" && body.message.trim()) {
      userMessage = sanitizeInput(body.message.trim().slice(0, 280));
    }
    if (typeof body?.magenSessionId === "string") {
      magenSessionId = body.magenSessionId;
    }
  } catch {
    // Invalid JSON
  }

  // Name and message are required
  if (!userName || userName.length < 2) {
    return NextResponse.json(
      { ok: false, code: "NAME_REQUIRED", message: "Please provide your name." },
      { status: 400 },
    );
  }

  if (!userMessage || userMessage.length < 5) {
    return NextResponse.json(
      { ok: false, code: "MESSAGE_REQUIRED", message: "Please include a message for the admin." },
      { status: 400 },
    );
  }

  // MAGEN verification — only block confirmed bots; allow "review" verdicts
  // through since the endpoint is already rate-limited (3 req / 5 min / IP)
  if (isMagenConfigured() && magenSessionId) {
    const result = await verifySession(magenSessionId);
    console.log("[MAGEN] Ping verification:", {
      session_id: magenSessionId,
      verdict: result.verdict,
      score: result.score,
      is_human: result.is_human,
    });
    if (result.success && result.verdict === "unverified") {
      return NextResponse.json(
        { ok: false, code: "VERIFICATION_FAILED", message: "Verification failed. Please try again." },
        { status: 403 },
      );
    }
  }

  try {
    const response = await fetch(`${botBaseUrl}/space/ping`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "website-toast",
        reason: "visitor_needs_access",
        page: "/coworking-space",
        requestId: randomUUID(),
        name: userName,
        message: userMessage,
      }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        data || {
          ok: false,
          code: "BOT_REQUEST_FAILED",
          message: "Unable to reach the bot ping endpoint.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "BOT_UNAVAILABLE",
        message: "The bot ping endpoint is unavailable.",
      },
      { status: 503 },
    );
  }
}
