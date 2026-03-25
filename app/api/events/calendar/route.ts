import { NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
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

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function foldLine(line: string): string {
  // iCalendar spec: lines must not exceed 75 octets; fold with CRLF + space
  const maxLen = 75;
  if (line.length <= maxLen) return line;
  const parts: string[] = [];
  parts.push(line.slice(0, maxLen));
  let i = maxLen;
  while (i < line.length) {
    parts.push(' ' + line.slice(i, i + maxLen - 1));
    i += maxLen - 1;
  }
  return parts.join('\r\n');
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

    const snapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where('status', '==', 'published')
      .get();

    const now = new Date();
    const events = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const communityIds = (data.communityId || '').split(',').map((id: string) => id.trim()).filter(Boolean);
        const communityName = communityIds
          .map((id: string) => communityLookup.get(id) || data.communityName || id)
          .join(', ');

        return {
          id: doc.id,
          title: data.title as string,
          slug: data.slug as string,
          date: data.date as string,
          endTime: data.endTime as string | undefined,
          location: (data.venue || data.location || '') as string,
          description: stripHtml(data.description as string || ''),
          communityName,
          eventType: (data.eventType || 'in-person') as string,
          url: data.url as string | undefined,
        };
      })
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const vevents = events.map(event => {
      const startDate = new Date(event.date);
      const endDate = event.endTime
        ? new Date(event.endTime)
        : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

      const description = event.url
        ? `${event.description}\\n\\nMore info: ${event.url}`
        : event.description;

      const lines = [
        'BEGIN:VEVENT',
        foldLine(`UID:${event.id}@devsa.community`),
        `DTSTAMP:${formatICSDate(now)}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        foldLine(`SUMMARY:${escapeICalText(event.title)}`),
        foldLine(`LOCATION:${escapeICalText(event.location)}`),
        foldLine(`DESCRIPTION:${escapeICalText(description)}`),
        foldLine(`URL:${SITE_URL}/events/${event.slug}`),
        event.communityName ? foldLine(`ORGANIZER;CN=${escapeICalText(event.communityName)}:mailto:hello@devsa.community`) : null,
        'END:VEVENT',
      ].filter(Boolean);

      return lines.join('\r\n');
    }).join('\r\n');

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DEVSA//Community Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:DEVSA Community Calendar`,
      `X-WR-CALDESC:San Antonio tech community events`,
      'X-WR-TIMEZONE:America/Chicago',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      'X-PUBLISHED-TTL:PT1H',
      vevents,
      'END:VCALENDAR',
    ].join('\r\n');

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="devsa-events.ics"',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('iCal feed error:', error);
    return NextResponse.json({ error: 'Failed to generate calendar feed' }, { status: 500 });
  }
}
