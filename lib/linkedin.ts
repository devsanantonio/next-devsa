const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_ORG_ID = process.env.LINKEDIN_ORG_ID;

export function isLinkedInConfigured(): boolean {
  return !!LINKEDIN_ACCESS_TOKEN && !!LINKEDIN_ORG_ID;
}

/**
 * Strip HTML tags and decode entities to produce clean plain text for LinkedIn.
 */
function stripToPlainText(text: string, maxLength = 250): string {
  let cleaned = text;

  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<\/p>/gi, '\n');
  cleaned = cleaned.replace(/<\/(div|li|ul|ol|tr|h[1-6])>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&nbsp;/g, ' ');

  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  if (cleaned.length > maxLength) {
    const truncated = cleaned.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    cleaned = (lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated) + '…';
  }

  return cleaned;
}

interface LinkedInJobPayload {
  title: string;
  companyName: string;
  slug: string;
  type: string;
  locationType: string;
  location?: string;
  salaryRange?: string;
  description?: string;
  tags: string[];
}

interface LinkedInEventPayload {
  title: string;
  slug: string;
  date: string;
  location?: string;
  venue?: string;
  description: string;
  communityName?: string;
  eventType?: string;
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

export async function shareJobToLinkedIn(job: LinkedInJobPayload): Promise<void> {
  if (!isLinkedInConfigured()) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';
  const jobUrl = `${siteUrl}/jobs/${job.slug}`;

  const locationLine = `${locationLabels[job.locationType] || job.locationType}${job.location ? ` · ${job.location}` : ''}`;
  const typeLine = typeLabels[job.type] || job.type;

  let commentary = `🚀 New job posted on DEVSA Jobs!\n\n`;
  commentary += `${job.title} at ${job.companyName}\n`;
  commentary += `📋 ${typeLine} · ${locationLine}\n`;
  if (job.salaryRange) commentary += `💰 ${job.salaryRange}\n`;
  if (job.description) {
    commentary += `\n${stripToPlainText(job.description, 200)}\n`;
  }
  if (job.tags.length > 0) {
    commentary += `\n${job.tags.slice(0, 5).map(t => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ')}\n`;
  }
  commentary += `\n👉 Apply now: ${jobUrl}`;

  await postToLinkedIn({
    commentary,
    articleUrl: jobUrl,
    articleTitle: `${job.title} at ${job.companyName}`,
    articleDescription: `${typeLine} · ${locationLine}${job.salaryRange ? ` · ${job.salaryRange}` : ''}`,
  });
}

export async function shareEventToLinkedIn(event: LinkedInEventPayload): Promise<void> {
  if (!isLinkedInConfigured()) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';
  const eventUrl = `${siteUrl}/events/${event.slug}`;

  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const locationDisplay = event.venue || event.location;

  let commentary = `📆 New community event!\n\n`;
  commentary += `${event.title}\n`;
  commentary += `📅 ${dateStr} at ${timeStr}\n`;
  if (locationDisplay) commentary += `📍 ${locationDisplay}\n`;
  if (event.communityName) commentary += `👥 Hosted by ${event.communityName}\n`;
  commentary += `\n${stripToPlainText(event.description, 200)}\n`;
  commentary += `\n👉 Details & RSVP: ${eventUrl}`;

  await postToLinkedIn({
    commentary,
    articleUrl: eventUrl,
    articleTitle: event.title,
    articleDescription: `${dateStr}${locationDisplay ? ` · ${locationDisplay}` : ''}`,
  });
}

interface LinkedInPostData {
  commentary: string;
  articleUrl: string;
  articleTitle: string;
  articleDescription: string;
}

async function postToLinkedIn(data: LinkedInPostData): Promise<void> {
  const orgUrn = `urn:li:organization:${LINKEDIN_ORG_ID}`;

  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202503',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: orgUrn,
      commentary: data.commentary,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        article: {
          source: data.articleUrl,
          title: data.articleTitle,
          description: data.articleDescription,
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn API error ${response.status}: ${errorText}`);
  }
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

export async function shareWeeklyDigestToLinkedIn(events: DigestEvent[]): Promise<void> {
  if (!isLinkedInConfigured() || events.length === 0) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';
  const eventsUrl = `${siteUrl}/events`;

  const weekDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Chicago',
  });

  let commentary = `📅 This week from the tech community — ${events.length} event${events.length !== 1 ? 's' : ''} happening the week of ${weekDate}\n\n`;

  for (const event of events) {
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Chicago',
    });
    const timeStr = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',
    });
    const locationDisplay = event.venue || event.location;

    commentary += `${event.title}\n`;
    commentary += `${dateStr} at ${timeStr} CT`;
    if (locationDisplay) commentary += ` · ${locationDisplay}`;
    if (event.communityName) commentary += ` · ${event.communityName}`;
    commentary += '\n\n';
  }

  commentary += `Find your people. Build your future.\n👉 ${eventsUrl}`;

  await postToLinkedIn({
    commentary,
    articleUrl: eventsUrl,
    articleTitle: `This week from the tech community — Week of ${weekDate}`,
    articleDescription: 'One calendar for every community. Powered by https://www.devsa.community',
  });
}
