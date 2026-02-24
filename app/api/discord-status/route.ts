import { NextResponse } from "next/server";

interface DiscordStatusResponse {
  guildId?: string;
  state?: string;
  updatedAt?: number;
}

const CACHE_CONTROL = "public, s-maxage=120, stale-while-revalidate=60";

function buildFallback() {
  return {
    ok: false,
    online: false,
    state: "unknown" as const,
    updatedAt: null,
  };
}

function jsonWithCache(payload: ReturnType<typeof buildFallback> | {
  ok: true;
  online: boolean;
  state: "open" | "closed" | "unknown";
  updatedAt: number | null;
}) {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

export async function GET() {
  const token = process.env.STATUS_API_TOKEN;

  if (!token) {
    return jsonWithCache(buildFallback());
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

    if (!response.ok) return jsonWithCache(buildFallback());

    const data = (await response.json()) as DiscordStatusResponse;
    const rawState = (data.state || "").toLowerCase();
    const state: "open" | "closed" | "unknown" =
      rawState === "open" ? "open" : rawState === "closed" ? "closed" : "unknown";
    const online = state === "open";

    return jsonWithCache({
      ok: true,
      online,
      state,
      updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : null,
    });
  } catch {
    return jsonWithCache(buildFallback());
  }
}
