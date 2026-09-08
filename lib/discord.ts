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

function weekOfLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Chicago',
  });
}

export async function shareWeeklyDigestToDiscord(events: DigestEvent[]): Promise<void> {
  if (!isEventsDiscordConfigured()) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.devsa.community';

  if (events.length === 0) {
    await fetch(DISCORD_EVENTS_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📅 **This week from the tech community**`,
        embeds: [
          {
            title: `Week of ${weekOfLabel()}`,
            url: `${siteUrl}/events`,
            description: `No events on the calendar this week — see what's coming up at [devsa.community/events](${siteUrl}/events)`,
            color: EMBED_COLOR,
            footer: { text: 'One calendar for every community · devsa.community/events' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    return;
  }

  const eventLines = events
    .map((event) => {
      const eventUrl = `${siteUrl}/events/${event.slug}`;
      // Discord renders <t:…:F> in each reader's own timezone, which is the
      // right call for a server with members outside San Antonio.
      const unixTs = Math.floor(new Date(event.date).getTime() / 1000);
      const typeEmoji =
        event.eventType === 'virtual' ? '💻' : event.eventType === 'hybrid' ? '🔀' : '📍';
      const locationDisplay = event.venue || event.location;

      let line = `${typeEmoji} **[${event.title}](${eventUrl})**\n`;
      line += `  <t:${unixTs}:F>`;
      if (locationDisplay) line += ` · ${locationDisplay}`;
      if (event.communityName) line += `\n  ${event.communityName}`;
      return line;
    })
    .join('\n\n');

  await fetch(DISCORD_EVENTS_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `📅 **This week from the tech community** — ${events.length} event${events.length !== 1 ? 's' : ''}`,
      embeds: [
        {
          title: `Week of ${weekOfLabel()}`,
          url: `${siteUrl}/events`,
          description: `*Find your people. Build your future.*\n\n` + eventLines,
          color: EMBED_COLOR,
          footer: { text: 'One calendar for every community · devsa.community/events' },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
}
