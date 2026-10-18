import { NextRequest, NextResponse } from 'next/server';
import { promptForDay } from '@/lib/discord-prompts';

const CRON_SECRET = process.env.CRON_SECRET;
const VIBE_WEBHOOK = process.env.DISCORD_VIBE_WEBHOOK_URL;
const BUILD_WEBHOOK = process.env.DISCORD_BUILD_WEBHOOK_URL;

const dayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Chicago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const isWebhook = (url?: string): url is string =>
  !!url && url.startsWith('https://discord.com/api/webhooks/');

/**
 * The webhook body for a date, and which channel's webhook it goes to.
 *
 * The site's eyebrow idiom in Discord's markdown: a small grey label (`-#`)
 * above the prompt as a heading (`###`), so the question is the loud part.
 * Plain text, not an embed — the Monday calendar is a card, and cards read as
 * notices; a prompt should look like a line of conversation asking for a reply.
 */
function buildPayload(dayKey: string) {
  const prompt = promptForDay(dayKey);
  if (!prompt) return null;

  // Nothing in a prompt pings anyone, even a pasted @everyone. Deliberately no
  // @here either: five pings a week to everyone online is how a server gets
  // muted, and a muted server stops hearing the calendar and announcements too.
  const allowed_mentions = { parse: [] as string[] };
  const { season } = prompt;
  const label = (emoji: string, title: string, detail?: string) =>
    `-# ${season?.emoji ?? emoji} ${title}${season ? ` · ${season.label}` : detail ? ` · ${detail}` : ''}`;

  if (prompt.kind === 'build') {
    return {
      channel: 'build-and-tell' as const,
      body: {
        content: `${label('🛠️', 'BUILD-AND-TELL FRIDAY')}\n### ${prompt.text}\n-# Reply below with a screenshot, a link or a demo.`,
        allowed_mentions,
      },
    };
  }
  if (prompt.kind === 'question') {
    const { topic } = prompt;
    return {
      channel: 'vibe-chat' as const,
      body: {
        content: `${label(topic?.emoji ?? '💬', 'QUESTION OF THE DAY', topic?.name.toUpperCase())}\n### ${prompt.text}`,
        allowed_mentions,
      },
    };
  }
  return {
    channel: 'vibe-chat' as const,
    body: {
      // Discord draws the poll itself; the label is what ties it to the series.
      content: label('📊', 'POLL OF THE DAY'),
      allowed_mentions,
      poll: {
        question: { text: prompt.poll.question },
        answers: prompt.poll.answers.map((text) => ({ poll_media: { text } })),
        duration: 24,
        allow_multiselect: false,
      },
    },
  };
}

/**
 * GET — the weekday prompt for #vibe-chat or #build-and-tell. See
 * lib/discord-prompts.ts for what posts when.
 *
 * Registered in vercel.json, so it checks CRON_SECRET before anything else.
 * Fails soft like the Monday digest: with the channel's webhook unset it
 * reports `configured: false` and posts nothing.
 *
 * `?dry=1` returns the message instead of posting it, and with it
 * `?date=YYYY-MM-DD` previews any day — the way to check a season before it
 * arrives without posting to a channel people read.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dry = request.nextUrl.searchParams.get('dry') === '1';
  const asked = request.nextUrl.searchParams.get('date');
  const dayKey = dry && asked && /^\d{4}-\d{2}-\d{2}$/.test(asked) ? asked : dayKeyFmt.format(new Date());

  const payload = buildPayload(dayKey);
  if (!payload) {
    return NextResponse.json({ success: true, day: dayKey, message: 'Weekend: nothing to post' });
  }

  const webhook = payload.channel === 'build-and-tell' ? BUILD_WEBHOOK : VIBE_WEBHOOK;
  const configured = isWebhook(webhook);

  if (dry) {
    return NextResponse.json({ dryRun: true, day: dayKey, channel: payload.channel, configured, payload: payload.body });
  }
  if (!configured) {
    return NextResponse.json({ success: true, day: dayKey, channel: payload.channel, configured, discord: false });
  }

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload.body),
  });
  if (!res.ok) {
    // Discord explains a rejected message in the body; unread, it is a prompt
    // that silently did not appear.
    console.error(`Discord prompt ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  return NextResponse.json({ success: true, day: dayKey, channel: payload.channel, configured, discord: res.ok });
}
