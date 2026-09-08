/**
 * Discord — the weekly events digest, and nothing else.
 *
 * This file existed before with four webhooks in it: jobs, events, news and
 * YouTube. It went out whole when the bounty board and the digest crons were
 * removed in 63c9b61. Only the events half is back, so the jobs, news and
 * YouTube senders are deliberately not restored — nothing posts to Discord now
 * except the Monday calendar.
 *
 * Fails soft. With no webhook configured `shareWeeklyDigestToDiscord` returns
 * without doing anything rather than throwing, so the site runs locally on a
 * partial .env.local. That is also the failure mode in production if the
 * variable is missing, which is worth knowing: the cron will report success
 * having posted nothing.
 */

const DISCORD_EVENTS_WEBHOOK_URL = process.env.DISCORD_EVENTS_WEBHOOK_URL;

const TZ = 'America/Chicago';

export function isEventsDiscordConfigured(): boolean {
  return (
    !!DISCORD_EVENTS_WEBHOOK_URL &&
    DISCORD_EVENTS_WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/')
  );
}

export interface DigestEvent {
  title: string;
  slug: string;
  date: string;
  location?: string;
  venue?: string;
  communityName?: string;
  eventType?: string;
}

/** Emerald, matching the "happening" state on the calendar. */
const EMBED_COLOR = 0x10b981;

/*
 * Discord's documented ceilings. The previous version had none of these: it
 * joined every event into one description and posted it. Around 27 events that
 * exceeds 4096 characters, Discord rejects the whole message with a 400, and
 * the caller's catch swallows it — the digest simply does not arrive, and the
 * cron reports discord:false to nobody. A fortnight like Startup Week is the
 * shape of week that would have found it.
 */
const MAX_FIELD_VALUE = 1024;
const MAX_FIELDS = 25;
/** 6000 is the real ceiling; the margin covers title, footer and description. */
const MAX_EMBED_TOTAL = 5200;

const dayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const dayHeadingFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

function weekOfLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: TZ,
  });
}

/**
 * One line per event, under a heading that already says which day it is.
 *
 * The timestamp is `:t` — just "5:30 PM". It used to be `:F`, which renders as
 * "Tuesday, September 8, 2026 5:30 PM" and repeated the weekday and the year on
 * every row. Discord still localises it, so a member reading from outside
 * Central sees their own clock.
 */
function eventLine(event: DigestEvent, siteUrl: string): string {
  const unixTs = Math.floor(new Date(event.date).getTime() / 1000);
  const emoji =
    event.eventType === 'virtual' ? '💻' : event.eventType === 'hybrid' ? '🔀' : '📍';
  const where = event.venue || event.location;

  let line = `${emoji} <t:${unixTs}:t> · **[${event.title}](${siteUrl}/events/${event.slug})**`;
  const under = [where, event.communityName].filter(Boolean).join(' · ');
  if (under) line += `\n ${under}`;
  return line;
}

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

/**
 * The message body, built separately from the sending so it can be inspected
 * without posting to a live channel.
 *
 * Grouped by day, which is the same call the website's calendar makes and for
 * the same reason: people scan a calendar by when, then decide by what. Before
 * this the two surfaces disagreed — the site grouped under date headings and
 * Discord ran one flat list.
 */
export function buildWeeklyDigestPayload(events: DigestEvent[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.devsa.community';
  const base = {
    title: `Week of ${weekOfLabel()}`,
    url: `${siteUrl}/events`,
    color: EMBED_COLOR,
    footer: { text: 'One calendar for every community · devsa.community/events' },
    timestamp: new Date().toISOString(),
  };

  if (events.length === 0) {
    return {
      content: `📅 **This week from the tech community**`,
      embeds: [
        {
          ...base,
          description: `No events on the calendar this week — see what's coming up at [devsa.community/events](${siteUrl}/events)`,
        },
      ],
    };
  }

  // Group into days, preserving the caller's chronological order.
  const byDay = new Map<string, DigestEvent[]>();
  for (const event of events) {
    const key = dayKeyFmt.format(new Date(event.date));
    const bucket = byDay.get(key);
    if (bucket) bucket.push(event);
    else byDay.set(key, [event]);
  }

  const fields: DiscordEmbedField[] = [];
  let budget = MAX_EMBED_TOTAL;
  let shown = 0;

  for (const [key, dayEvents] of byDay) {
    if (fields.length >= MAX_FIELDS || budget <= 0) break;

    // Noon avoids the date sliding either way when the clocks change.
    const name = dayHeadingFmt.format(new Date(`${key}T12:00:00Z`));
    const lines: string[] = [];
    let used = 0;

    for (const event of dayEvents) {
      const line = eventLine(event, siteUrl);
      const cost = line.length + 1;
      if (used + cost > MAX_FIELD_VALUE || cost > budget) break;
      lines.push(line);
      used += cost;
      budget -= cost;
      shown += 1;
    }

    if (lines.length === 0) break;
    budget -= name.length;
    fields.push({ name, value: lines.join('\n'), inline: false });
  }

  const dropped = events.length - shown;
  const description =
    `*Find your people. Build your future.*` +
    (dropped > 0
      ? `\n\n…and ${dropped} more this week — [see the full calendar](${siteUrl}/events)`
      : '');

  return {
    content: `📅 **This week from the tech community** — ${events.length} event${events.length !== 1 ? 's' : ''}`,
    embeds: [{ ...base, description, fields }],
  };
}

export async function shareWeeklyDigestToDiscord(events: DigestEvent[]): Promise<void> {
  if (!isEventsDiscordConfigured()) return;

  const res = await fetch(DISCORD_EVENTS_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildWeeklyDigestPayload(events)),
  });

  // Discord answers a rejected embed with a 400 and a body explaining which
  // limit was hit. Unread, that arrives as a digest that silently did not
  // appear, so it is raised for the caller to log.
  if (!res.ok) {
    throw new Error(`Discord webhook ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}
