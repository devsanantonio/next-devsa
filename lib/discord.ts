const DISCORD_JOBS_WEBHOOK_URL = process.env.DISCORD_JOBS_WEBHOOK_URL;
const DISCORD_EVENTS_WEBHOOK_URL = process.env.DISCORD_EVENTS_WEBHOOK_URL;
const DISCORD_NEWS_WEBHOOK_URL = process.env.DISCORD_NEWS_WEBHOOK_URL;
const DISCORD_YOUTUBE_WEBHOOK_URL = process.env.DISCORD_YOUTUBE_WEBHOOK_URL;

/**
 * Convert HTML or Markdown content into clean Discord-compatible Markdown.
 * Handles common HTML tags from the rich text editor and plain text with HTML.
 */
function formatForDiscord(text: string, maxLength = 300): string {
  let cleaned = text;

  // Convert block-level HTML to Discord Markdown
  cleaned = cleaned.replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, '**$1**\n');
  cleaned = cleaned.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  cleaned = cleaned.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  cleaned = cleaned.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  cleaned = cleaned.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  cleaned = cleaned.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  cleaned = cleaned.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  cleaned = cleaned.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
  cleaned = cleaned.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<\/p>/gi, '\n');
  cleaned = cleaned.replace(/<\/(div|ul|ol|tr)>/gi, '\n');

  // Strip all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&nbsp;/g, ' ');

  // Clean up whitespace: collapse multiple blank lines, trim lines
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  // Truncate at a word boundary if too long
  if (cleaned.length > maxLength) {
    const truncated = cleaned.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    cleaned = (lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated) + '…';
  }

  return cleaned;
}

const typeLabels: Record<string, string> = {
  w2: 'W-2 Employment',
  '1099': '1099 Contract',
  equity: 'Co-founder / Equity',
  internship: 'Internship / Apprenticeship',
  other: 'Other',
};

const locationLabels: Record<string, string> = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
};

interface DiscordJobPayload {
  title: string;
  companyName: string;
  slug: string;
  type: string;
  locationType: string;
  location?: string;
  salaryRange?: string;
  equityRange?: string;
  startupStage?: string;
  tags: string[];
  description?: string;
}

export function isDiscordConfigured(): boolean {
  return !!DISCORD_JOBS_WEBHOOK_URL && DISCORD_JOBS_WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/');
}

export function isEventsDiscordConfigured(): boolean {
  return !!DISCORD_EVENTS_WEBHOOK_URL && DISCORD_EVENTS_WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/');
}

export async function shareJobToDiscord(job: DiscordJobPayload): Promise<void> {
  if (!isDiscordConfigured()) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';
  const jobUrl = `${siteUrl}/bounties/${job.slug}`;

  const locationValue = `${locationLabels[job.locationType] || job.locationType}${job.location ? ` · ${job.location}` : ''}`;

  const fields = [
    { name: 'Type', value: typeLabels[job.type] || job.type, inline: true },
    { name: 'Location', value: locationValue, inline: true },
  ];

  if (job.salaryRange) {
    fields.push({ name: 'Compensation', value: job.salaryRange, inline: true });
  }

  if (job.equityRange) {
    fields.push({ name: 'Equity', value: job.equityRange, inline: true });
  }

  if (job.startupStage) {
    const stageLabels: Record<string, string> = {
      idea: 'Idea / Pre-product',
      mvp: 'MVP / Prototype',
      'pre-seed': 'Pre-seed',
      seed: 'Seed',
      'series-a': 'Series A+',
      revenue: 'Revenue / Bootstrapped',
    };
    fields.push({ name: 'Stage', value: stageLabels[job.startupStage] || job.startupStage, inline: true });
  }

  if (job.tags.length > 0) {
    fields.push({ name: 'Tags', value: job.tags.slice(0, 6).join(', '), inline: false });
  }

  const desc = job.description ? formatForDiscord(job.description, 200) : undefined;

  await fetch(DISCORD_JOBS_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🛠️ **New bounty on DEVSA**`,
      embeds: [
        {
          title: `${job.title} · ${job.companyName}`,
          url: jobUrl,
          ...(desc ? { description: desc } : {}),
          color: 0xef426f,
          fields,
          footer: { text: 'DEVSA Bounties · devsa.community/bounties' },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
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

export async function shareWeeklyDigestToDiscord(events: DigestEvent[]): Promise<void> {
  if (!isEventsDiscordConfigured()) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';

  if (events.length === 0) {
    await fetch(DISCORD_EVENTS_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `� **This Week in from the tech community**`,
        embeds: [
          {
            title: `Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/Chicago' })}`,
            url: `${siteUrl}/events`,
            description: `No events this week — browse what's coming up at [devsa.community/events](https://www.devsa.community/events)`,
            color: 0x10b981,
            footer: { text: 'One calendar for every community · https://www.devsa.community/events' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    return;
  }

  const eventLines = events.map(event => {
    const eventUrl = `${siteUrl}/events/${event.slug}`;
    const eventDate = new Date(event.date);
    const unixTs = Math.floor(eventDate.getTime() / 1000);
    const typeEmoji = event.eventType === 'virtual' ? '💻' : event.eventType === 'hybrid' ? '🔀' : '📍';
    const locationDisplay = event.venue || event.location;

    let line = `${typeEmoji} **[${event.title}](${eventUrl})**\n`;
    line += `  <t:${unixTs}:F>`;
    if (locationDisplay) line += ` · ${locationDisplay}`;
    if (event.communityName) line += `\n  ${event.communityName}`;
    return line;
  }).join('\n\n');

  await fetch(DISCORD_EVENTS_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `📅 **This week from the tech community** — ${events.length} event${events.length !== 1 ? 's' : ''}`,
      embeds: [
        {
          title: `Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/Chicago' })}`,
          url: `${siteUrl}/events`,
          description: `*Find your people. Build your future.*\n\n` + eventLines,
          color: 0x10b981,
          footer: { text: 'One calendar for every community · https://www.devsa.community/events' },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
}

// ========================================
// News / Blog Feed
// ========================================

export function isNewsDiscordConfigured(): boolean {
  return !!DISCORD_NEWS_WEBHOOK_URL && DISCORD_NEWS_WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/');
}

export interface DiscordNewsArticle {
  title: string;
  url: string;
  source: string;
  summary: string;
  imageUrl?: string;
}

const sourceColors: Record<string, number> = {
  GitHub: 0x24292f,
  Vercel: 0x000000,
  OpenAI: 0x10a37f,
  Anthropic: 0xd4a27f,
  Cloudflare: 0xf38020,
  NVIDIA: 0x76b900,
  AWS: 0xff9900,
  'Google Developers': 0x4285f4,
  Microsoft: 0x0078d4,
  Cursor: 0x14120b,
};

export async function shareNewsToDiscord(article: DiscordNewsArticle): Promise<void> {
  if (!isNewsDiscordConfigured()) return;

  const desc = formatForDiscord(article.summary, 400);

  await fetch(DISCORD_NEWS_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      thread_name: article.title,
      content: `📰 **New article from ${article.source}**`,
      embeds: [
        {
          title: article.title,
          url: article.url,
          description: desc,
          color: sourceColors[article.source] || 0x3b82f6,
          ...(article.imageUrl ? { image: { url: article.imageUrl } } : {}),
          footer: { text: `Source: ${article.source} · devsa.community` },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
}

// ========================================
// YouTube Video Feed
// ========================================

export function isYouTubeDiscordConfigured(): boolean {
  return !!DISCORD_YOUTUBE_WEBHOOK_URL && DISCORD_YOUTUBE_WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/');
}

export interface DiscordYouTubeVideo {
  title: string;
  url: string;
  channel: string;
  description: string;
  thumbnailUrl?: string;
}

const channelColors: Record<string, number> = {
  Fireship: 0xf5a623,
  Theo: 0x6366f1,
  Vercel: 0x000000,
  ThePrimeTime: 0xef4444,
  DHH: 0x1d4ed8,
  'Cult Repo': 0x8b5cf6,
  'Syntax.fm': 0xf59e0b,
  GitHub: 0x24292f,
  'Aaron Francis': 0x22c55e,
  'Code.tv': 0x06b6d4,
  NeetCode: 0xfbbf24,
  Anthropic: 0xd4a27f,
  Cursor: 0x14120b,
  OpenAI: 0x10a37f,
};

export async function shareYouTubeToDiscord(video: DiscordYouTubeVideo): Promise<void> {
  if (!isYouTubeDiscordConfigured()) return;

  await fetch(DISCORD_YOUTUBE_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      thread_name: `${video.channel}: ${video.title}`,
      content: `🎬 **New video from ${video.channel}**\n${video.url}`,
    }),
  });
}
