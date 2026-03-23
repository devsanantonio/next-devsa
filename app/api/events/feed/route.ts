import { NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';

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
        const communityName = communityIds
          .map((id: string) => communityLookup.get(id) || data.communityName || id)
          .join(', ');

        return {
          title: data.title as string,
          slug: data.slug as string,
          date: data.date as string,
          location: (data.venue || data.location || '') as string,
          description: data.description as string,
          communityName,
          eventType: (data.eventType || 'in-person') as string,
          createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt || data.date,
        };
      })
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const lastBuildDate = new Date().toUTCString();

    const items = events.map(event => {
      const eventUrl = `${SITE_URL}/events/${event.slug}`;
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Chicago',
      });
      const timeStr = eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Chicago',
      });

      const plainDescription = stripHtml(event.description);
      const formatLabel = event.eventType === 'virtual' ? 'Virtual' : event.eventType === 'hybrid' ? 'Hybrid' : 'In-Person';

      let descriptionParts = [`${dateStr} at ${timeStr} CT`];
      if (event.location) descriptionParts.push(event.location);
      descriptionParts.push(`Format: ${formatLabel}`);
      if (event.communityName) descriptionParts.push(`Hosted by ${event.communityName}`);
      if (plainDescription) descriptionParts.push(plainDescription.slice(0, 300));

      const pubDate = typeof event.createdAt === 'string'
        ? new Date(event.createdAt).toUTCString()
        : eventDate.toUTCString();

      return `    <item>
      <title>${escapeXml(event.title)}</title>
      <link>${escapeXml(eventUrl)}</link>
      <guid isPermaLink="true">${escapeXml(eventUrl)}</guid>
      <description>${escapeXml(descriptionParts.join(' · '))}</description>
      <pubDate>${pubDate}</pubDate>
      <source url="${escapeXml(`${SITE_URL}/api/events/feed`)}">DEVSA Community Calendar</source>
      <category>${escapeXml(formatLabel)}</category>
    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
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
