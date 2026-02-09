import { NextResponse } from "next/server";

interface DiscordStatusResponse {
  guildId?: string;
  state?: string;
  updatedAt?: number;
}

function buildFallback() {
  return {
    ok: false,
    online: false,
    state: "unknown" as const,
    updatedAt: null,
  };
}

export async function GET() {
  const token = process.env.STATUS_API_TOKEN;

  if (!token) {
    return NextResponse.json(buildFallback());
  }

  try {
    const response = await fetch("https://devsa-discord-bot.onrender.com/status", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });

    if (!response.ok) return NextResponse.json(buildFallback());

    const data = (await response.json()) as DiscordStatusResponse;
    const rawState = (data.state || "").toLowerCase();
    const state: "open" | "closed" | "unknown" =
      rawState === "open" ? "open" : rawState === "closed" ? "closed" : "unknown";
    const online = state === "open";

    return NextResponse.json({
      ok: true,
      online,
      state,
      updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : null,
    });
  } catch {
    return NextResponse.json(buildFallback());
  }
}
