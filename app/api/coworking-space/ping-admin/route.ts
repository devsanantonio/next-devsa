import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST() {
  const token = process.env.STATUS_API_TOKEN;
  const botBaseUrl = process.env.DISCORD_BOT_BASE_URL || "https://devsa-discord-bot.onrender.com";

  if (!token) {
    return NextResponse.json(
      { ok: false, code: "BOT_AUTH_NOT_CONFIGURED", message: "Bot auth is not configured." },
      { status: 500 },
    );
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
