import { NextResponse } from "next/server";

interface DiscordStatusAdmin {
  id?: string;
  name?: string;
  avatarUrl?: string | null;
  discordUserId?: string;
}

interface DiscordPingState {
  enabled?: boolean;
  cooldownActive?: boolean;
  cooldownEndsAt?: number | null;
  cooldownSecondsRemaining?: number;
}

interface DiscordStatusResponse {
  guildId?: string;
  state?: string;
  updatedAt?: number;
  activeAdmin?: DiscordStatusAdmin | null;
  ping?: DiscordPingState | null;
}

const CACHE_CONTROL = "public, s-maxage=120, stale-while-revalidate=60";

function buildFallback() {
  return {
    ok: false,
    online: false,
    state: "unknown" as const,
    updatedAt: null,
    activeAdmin: null,
    ping: {
      enabled: false,
      cooldownActive: false,
      cooldownEndsAt: null,
      cooldownSecondsRemaining: 0,
    },
  };
}

function jsonWithCache(payload: ReturnType<typeof buildFallback> | {
  ok: true;
  online: boolean;
  state: "open" | "closed" | "unknown";
  updatedAt: number | null;
  activeAdmin: {
    id?: string;
    name: string;
    avatarUrl: string | null;
    discordUserId?: string;
  } | null;
  ping: {
    enabled: boolean;
    cooldownActive: boolean;
    cooldownEndsAt: number | null;
    cooldownSecondsRemaining: number;
  };
}) {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

export async function GET() {
  const token = process.env.STATUS_API_TOKEN;
  const botBaseUrl = process.env.DISCORD_BOT_BASE_URL || "https://devsa-discord-bot.onrender.com";

  if (!token) {
    return jsonWithCache(buildFallback());
  }

  try {
    const response = await fetch(`${botBaseUrl}/status`, {
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
      activeAdmin: data.activeAdmin?.name
        ? {
            id: data.activeAdmin.id,
            name: data.activeAdmin.name,
            avatarUrl: data.activeAdmin.avatarUrl ?? null,
            discordUserId: data.activeAdmin.discordUserId,
          }
        : null,
      ping: {
        enabled: Boolean(data.ping?.enabled),
        cooldownActive: Boolean(data.ping?.cooldownActive),
        cooldownEndsAt: typeof data.ping?.cooldownEndsAt === "number" ? data.ping.cooldownEndsAt : null,
        cooldownSecondsRemaining: Math.max(0, Number(data.ping?.cooldownSecondsRemaining || 0)),
      },
    });
  } catch {
    return jsonWithCache(buildFallback());
  }
}
