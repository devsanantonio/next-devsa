import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb, COLLECTIONS, type CalendarSubscription } from '@/lib/firebase-admin';
import { SUBSCRIBE_CODE } from '@/lib/calendar-subscribe';
import { isListed } from '@/lib/event-visibility';
import { eventDescriptionToPlainText } from '@/lib/event-markdown';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.devsa.community';

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

/** Which calendar app is polling, from its user-agent. Rough, and only used to split the count. */
function calendarClient(ua: string): CalendarSubscription['client'] {
  if (/google/i.test(ua)) return 'google';
  if (/microsoft|outlook|office/i.test(ua)) return 'outlook';
  if (/ios|mac ?os|darwin|dataaccessd|calendaragent|apple/i.test(ua)) return 'apple';
  return 'other';
}

/**
 * Note a poll of a coded subscription (lib/calendar-subscribe.ts).
 *
 * Fails soft: a Firestore hiccup must never cost a subscriber their calendar,
 * so this is caught and logged. The feed is cached per URL for 15 minutes, and
 * each code is its own URL, so this runs at most about four times an hour per
 * subscription — far more often than calendar apps actually poll.
 */
async function recordSubscription(db: FirebaseFirestore.Firestore, code: string, ua: string) {
  try {
    const ref = db.collection(COLLECTIONS.CALENDAR_SUBSCRIPTIONS).doc(code);
    const now = new Date();
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists) {
        tx.update(ref, { lastSeen: now, fetches: FieldValue.increment(1) });
      } else {
        tx.set(ref, { firstSeen: now, lastSeen: now, fetches: 1, client: calendarClient(ua) });
      }
    });
  } catch (error) {
    console.error('Calendar subscription record failed:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();

    const code = request.nextUrl.searchParams.get('s');
    if (code && SUBSCRIBE_CODE.test(code)) {
      await recordSubscription(db, code, request.headers.get('user-agent') ?? '');
    }

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
    // Link-only events never reach a subscriber's calendar.
    const events = snapshot.docs
      .filter(doc => isListed(doc.data()))
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

      // A real newline: escapeICalText turns it into the \n the format wants.
      // This used to write the escape itself, which escapeICalText then
      // escaped again, so calendars showed a literal "\n\n" before the link.
      const plain = eventDescriptionToPlainText(event.description);
      const description = event.url ? `${plain}\n\nMore info: ${event.url}` : plain;

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
        event.communityName ? foldLine(`ORGANIZER;CN=${escapeICalText(event.communityName)}:mailto:jesse@devsanantonio.com`) : null,
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
