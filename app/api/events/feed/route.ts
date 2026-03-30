import { NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';
const EVENT_TIMEZONE = 'America/Chicago';
const DEVSA_NAMESPACE = 'https://devsa.community/ns/event-feed/1.0';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const safeText = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return `${safeText.trimEnd()}...`;
}

function formatIsoInTimeZone(dateInput: string, timeZone: string): string {
  const date = new Date(dateInput);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'shortOffset',
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const offsetValue = lookup.timeZoneName || 'GMT';
  const offsetMatch = offsetValue.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/);
  const offset = offsetMatch
    ? `${offsetMatch[1]}${offsetMatch[2].padStart(2, '0')}:${(offsetMatch[3] || '00').padStart(2, '0')}`
    : '+00:00';

  return `${lookup.year}-${lookup.month}-${lookup.day}T${lookup.hour}:${lookup.minute}:${lookup.second}${offset}`;
}

export async function GET() {
  try {
    const db = getDb();

    // Build community lookup for display names
    const communityLookup = new Map<string, string>();
    try {
      const communitiesSnapshot = await db.collection(COLLECTIONS.COMMUNITIES).get();
      communitiesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        communityLookup.set(doc.id, data.name || doc.id);
      });
    } catch {
      // Firestore unavailable for communities — proceed with IDs
    }

    // Fetch published events with dates >= today
    const now = new Date();
    const snapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where('status', '==', 'published')
      .get();

    const events = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const communityIds = (data.communityId || '').split(',').map((id: string) => id.trim()).filter(Boolean);
        const hosts = communityIds.map((id: string) => ({
          id,
          name: communityLookup.get(id) || data.communityName || id,
        }));
        const fallbackCommunityName = typeof data.communityName === 'string' ? data.communityName.trim() : '';
        const communityName = hosts.length > 0
          ? hosts.map(host => host.name).join(', ')
          : fallbackCommunityName;
        const venue = (data.venue || '') as string;
        const address = (data.address || '') as string;
        const location = (venue || data.location || '') as string;

        return {
          title: data.title as string,
          slug: data.slug as string,
          date: data.date as string,
          endTime: data.endTime as string | undefined,
          venue,
          address,
          location,
          description: data.description as string,
          communityName,
          hosts: hosts.length > 0 || !fallbackCommunityName
            ? hosts
            : [{ id: '', name: fallbackCommunityName }],
          eventType: (data.eventType || 'in-person') as string,
          rsvpEnabled: Boolean(data.rsvpEnabled),
          externalUrl: (data.url || '') as string,
          createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt || data.date,
        };
      })
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const lastBuildDate = new Date().toUTCString();

    const items = events.map(event => {
      const eventUrl = `${SITE_URL}/events/${event.slug}`;
      const eventDate = new Date(event.date);
      const detailsUrl = eventUrl;
      const rsvpUrl = event.externalUrl || (event.rsvpEnabled ? `${eventUrl}#rsvp` : '');
      const rsvpMode = event.externalUrl ? 'external' : event.rsvpEnabled ? 'internal' : '';
      const dateStr = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: EVENT_TIMEZONE,
      });
      const timeStr = eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: EVENT_TIMEZONE,
      });

      const plainDescription = stripHtml(event.description);
      const truncatedPlainDescription = plainDescription
        ? truncateAtWordBoundary(plainDescription, 300)
        : '';
      const formatLabel = event.eventType === 'virtual' ? 'Virtual' : event.eventType === 'hybrid' ? 'Hybrid' : 'In-Person';
      const categories = [formatLabel, ...event.hosts.map(host => host.name).filter(Boolean)];
      const locationLabel = event.address && event.venue
        ? `${event.venue}, ${event.address}`
        : event.location;

      let descriptionParts = [`${dateStr} at ${timeStr} CT`];
      if (event.location) descriptionParts.push(event.location);
      descriptionParts.push(`Format: ${formatLabel}`);
      if (event.communityName) descriptionParts.push(`Hosted by ${event.communityName}`);
      if (truncatedPlainDescription) descriptionParts.push(truncatedPlainDescription);

      const pubDate = typeof event.createdAt === 'string'
        ? new Date(event.createdAt).toUTCString()
        : eventDate.toUTCString();
      const categoryFields = categories
        .map(category => `      <category>${escapeXml(category)}</category>`)
        .join('\n');
      const extensionFields = [
        `      <devsa:eventStart>${escapeXml(formatIsoInTimeZone(event.date, EVENT_TIMEZONE))}</devsa:eventStart>`,
        event.endTime ? `      <devsa:eventEnd>${escapeXml(formatIsoInTimeZone(event.endTime, EVENT_TIMEZONE))}</devsa:eventEnd>` : null,
        `      <devsa:eventTimezone>${EVENT_TIMEZONE}</devsa:eventTimezone>`,
        `      <devsa:eventType>${escapeXml(event.eventType)}</devsa:eventType>`,
        truncatedPlainDescription ? `      <devsa:description>${escapeXml(truncatedPlainDescription)}</devsa:description>` : null,
        event.venue ? `      <devsa:venue>${escapeXml(event.venue)}</devsa:venue>` : null,
        event.address ? `      <devsa:address>${escapeXml(event.address)}</devsa:address>` : null,
        locationLabel ? `      <devsa:locationLabel>${escapeXml(locationLabel)}</devsa:locationLabel>` : null,
        ...event.hosts
          .filter(host => host.name)
          .map(host => host.id
            ? `      <devsa:host id="${escapeXml(host.id)}">${escapeXml(host.name)}</devsa:host>`
            : `      <devsa:host>${escapeXml(host.name)}</devsa:host>`),
        `      <devsa:detailsUrl>${escapeXml(detailsUrl)}</devsa:detailsUrl>`,
        rsvpUrl ? `      <devsa:rsvpUrl>${escapeXml(rsvpUrl)}</devsa:rsvpUrl>` : null,
        rsvpMode ? `      <devsa:rsvpMode>${escapeXml(rsvpMode)}</devsa:rsvpMode>` : null,
        `      <devsa:link rel="details">${escapeXml(detailsUrl)}</devsa:link>`,
        rsvpUrl ? `      <devsa:link rel="rsvp">${escapeXml(rsvpUrl)}</devsa:link>` : null,
      ].filter(Boolean).join('\n');

      return `    <item>
      <title>${escapeXml(event.title)}</title>
      <link>${escapeXml(eventUrl)}</link>
      <guid isPermaLink="true">${escapeXml(eventUrl)}</guid>
      <description>${escapeXml(descriptionParts.join(' · '))}</description>
      <pubDate>${pubDate}</pubDate>
      <source url="${escapeXml(`${SITE_URL}/api/events/feed`)}">DEVSA Community Calendar</source>
${categoryFields}
${extensionFields}
    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:devsa="${DEVSA_NAMESPACE}">
  <channel>
    <title>DEVSA Community Calendar</title>
    <link>${SITE_URL}/events</link>
    <atom:link href="${SITE_URL}/api/events/feed" rel="self" type="application/rss+xml" />
    <description>One calendar for every community. Stop hunting for links — DEVSA brings San Antonio's tech groups together in one place. Find your people. Build your future.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>devsa.community</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <image>
      <url>${SITE_URL}/devsa-logo.png</url>
      <title>DEVSA Community Calendar</title>
      <link>${SITE_URL}/events</link>
    </image>
${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('RSS feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
