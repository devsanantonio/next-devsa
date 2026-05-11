import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { isMagenConfigured, verifySession } from "@/lib/magen";
import { resend, EMAIL_FROM, isResendConfigured } from "@/lib/resend";
import { CoworkingInquiryReceivedEmail } from "@/lib/emails/coworking-inquiry-received";
import { CoworkingInquiryOpsEmail } from "@/lib/emails/coworking-inquiry-ops";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BotResponseShape {
  ok?: boolean;
  message?: string;
  code?: string;
  activeAdmin?: { name?: string } | null;
  ping?: {
    enabled?: boolean;
    cooldownActive?: boolean;
    cooldownEndsAt?: number | null;
    cooldownSecondsRemaining?: number;
  };
}

interface BotAttempt {
  ok: boolean;
  status: number;
  data: BotResponseShape | null;
}

async function callBot({
  botBaseUrl,
  token,
  name,
  message,
}: {
  botBaseUrl: string;
  token: string;
  name: string;
  message: string;
}): Promise<BotAttempt> {
  try {
    const response = await fetch(`${botBaseUrl}/space/ping`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "website-inquiry",
        reason: "visitor_question",
        page: "/coworking-space",
        requestId: randomUUID(),
        name,
        message,
      }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as BotResponseShape | null;
    return { ok: response.ok && Boolean(data?.ok), status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export async function POST(request: Request) {
  const token = process.env.STATUS_API_TOKEN;
  const botBaseUrl = process.env.DISCORD_BOT_BASE_URL || "https://devsa-discord-bot.onrender.com";
  const opsInquiryMailbox = process.env.COWORKING_INQUIRY_OPS_EMAIL;

  // Rate limit: 3 inquiries per IP per 5 minutes
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success, resetMs } = rateLimit(ip, 3, 5 * 60 * 1000);

  if (!success) {
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED",
        message: `Too many messages. Try again in ${Math.ceil(resetMs / 1000)}s.`,
      },
      { status: 429 },
    );
  }

  // Parse + validate body
  let userName: string | undefined;
  let userMessage: string | undefined;
  let userEmail: string | null = null;
  let magenSessionId: string | undefined;

  try {
    const body = await request.json();

    if (typeof body?.name === "string" && body.name.trim()) {
      userName = sanitizeInput(body.name.trim().slice(0, 100));
    }
    if (typeof body?.message === "string" && body.message.trim()) {
      userMessage = sanitizeInput(body.message.trim().slice(0, 1000));
    }
    if (typeof body?.email === "string" && body.email.trim()) {
      const cleaned = body.email.trim().toLowerCase().slice(0, 254);
      if (EMAIL_REGEX.test(cleaned)) {
        userEmail = cleaned;
      } else {
        return NextResponse.json(
          { ok: false, code: "EMAIL_INVALID", message: "Please enter a valid email address." },
          { status: 400 },
        );
      }
    }
    if (typeof body?.magenSessionId === "string") {
      magenSessionId = body.magenSessionId;
    }
  } catch {
    // Invalid JSON
  }

  if (!userName || userName.length < 2) {
    return NextResponse.json(
      { ok: false, code: "NAME_REQUIRED", message: "Please add your name." },
      { status: 400 },
    );
  }
  if (!userMessage || userMessage.length < 5) {
    return NextResponse.json(
      { ok: false, code: "MESSAGE_REQUIRED", message: "Please include a short question." },
      { status: 400 },
    );
  }

  // Magen — only block confirmed bots; review verdicts fall through (rate-limited anyway)
  if (isMagenConfigured() && magenSessionId) {
    const result = await verifySession(magenSessionId);
    console.log("[MAGEN] Coworking inquiry verification:", {
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

  // Fire bot + email paths in parallel
  const submittedAt = new Date();

  const botPromise: Promise<BotAttempt> = token
    ? callBot({ botBaseUrl, token, name: userName, message: userMessage })
    : Promise.resolve<BotAttempt>({ ok: false, status: 0, data: null });

  const emailReceiptPromise: Promise<{ ok: boolean }> = (async () => {
    // The user receipt only fires if the user gave us an email AND Resend is configured.
    if (!userEmail || !isResendConfigured() || !resend) return { ok: false };
    try {
      // adminName is unknown here — falls back to "the team" copy. Receipt fires first;
      // we update with bot-confirmed admin name in the ops email below.
      await resend.emails.send({
        from: EMAIL_FROM,
        to: userEmail,
        ...(opsInquiryMailbox ? { replyTo: opsInquiryMailbox } : {}),
        subject: "We got your question — DEVSA Coworking",
        html: CoworkingInquiryReceivedEmail({
          name: userName,
          message: userMessage,
          adminName: null,
        }),
      });
      return { ok: true };
    } catch (error) {
      console.error("[coworking-inquiry] user receipt send failed:", error);
      return { ok: false };
    }
  })();

  const [botResult, receiptResult] = await Promise.all([botPromise, emailReceiptPromise]);

  // Ops notification — always send if we have a mailbox + Resend
  let opsNotified = false;
  if (opsInquiryMailbox && isResendConfigured() && resend) {
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: opsInquiryMailbox,
        ...(userEmail ? { replyTo: userEmail } : {}),
        subject: `New coworking inquiry from ${userName}`,
        html: CoworkingInquiryOpsEmail({
          name: userName,
          email: userEmail,
          message: userMessage,
          adminName: botResult.data?.activeAdmin?.name ?? null,
          botNotified: botResult.ok,
          submittedAt,
        }),
      });
      opsNotified = true;
    } catch (error) {
      console.error("[coworking-inquiry] ops notification send failed:", error);
    }
  }

  // Success criteria: we routed the inquiry SOMEWHERE
  const delivered = botResult.ok || receiptResult.ok || opsNotified;

  if (!delivered) {
    // Bot path failed AND email path was unavailable (no email, no Resend, no ops mailbox)
    if (botResult.status === 503 || botResult.status === 0 || botResult.data?.code === "BOT_UNAVAILABLE") {
      return NextResponse.json(
        {
          ok: false,
          code: "BOT_UNAVAILABLE",
          message: botResult.data?.message || "The bot is waking up. Try again in a moment.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        code: botResult.data?.code || "DELIVERY_FAILED",
        message:
          botResult.data?.message ||
          "We couldn't send your message. Add an email so we can reply, or message us on Discord.",
      },
      { status: botResult.status || 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    deliveredVia: {
      bot: botResult.ok,
      userReceipt: receiptResult.ok,
      ops: opsNotified,
    },
    ping: botResult.data?.ping,
  });
}
