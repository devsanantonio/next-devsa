import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { buildCalendarLinks } from '@/lib/event-display';
import { SITE_URL } from '@/lib/event-emails';

/**
 * GET ?slug=<slug> — one event as an .ics file, for the "Apple / Outlook" button
 * in emails. On the site the event page builds the file in the browser
 * (downloadIcs); an email can't do that, so it links here. Same builder, so the
 * file matches what the event page hands out.
 *
 * Link-only events are served too: their slug is the invitation, and anyone with
 * it can already open the event page.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')?.trim();
  if (!slug || !/^[a-z0-9-]{1,120}$/.test(slug)) {
    return NextResponse.json({ error: 'Missing or invalid slug' }, { status: 400 });
  }

  try {
    const snapshot = await getDb().collection(COLLECTIONS.EVENTS).where('slug', '==', slug).limit(1).get();
    const doc = snapshot.docs[0];
    const e = doc?.data();
    if (!doc || !e || e.status !== 'published' || !e.date) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { icsContent } = buildCalendarLinks(
      {
        id: doc.id,
        slug: e.slug,
        title: e.title,
        date: e.date,
        endTime: e.endTime,
        location: e.location || [e.venue, e.address].filter(Boolean).join(', '),
        description: e.description || '',
        url: `${SITE_URL}/events/${e.slug}`,
      },
      SITE_URL,
    );

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${e.slug}.ics"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Event .ics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
