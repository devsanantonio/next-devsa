import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { sanitizeInput } from '@/lib/sanitize';
import { attendeesOf, formatWhen, formatWhere, hostNameFor, sendToAttendees, SITE_URL } from '@/lib/event-emails';
import {
  EventChangedEmail,
  EventCancelledEmail,
  getEventChangedSubject,
  getEventCancelledSubject,
  type EventChange,
} from '@/lib/emails/event-update';

/**
 * POST — email the people who RSVP'd that their event changed or was cancelled.
 *
 * Only ever on purpose: the admin offers it after a save that moved the date,
 * time or place, and before deleting an event that has RSVPs. Admins may send
 * for any event; an organizer only for an event their group hosts.
 *
 *   { eventId, kind: 'changed', previous: { date, endTime, venue, address, location }, note? }
 *   { eventId, kind: 'cancelled', note? }   (sent before the DELETE, while the event exists)
 *
 * For a change, what changed is worked out here from `previous` against the
 * saved event. If nothing an attendee would act on changed, it sends nothing.
 */
export async function POST(request: NextRequest) {
  try {
    const email = await verifiedEmail(request);
    if (!email) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { eventId, kind } = body as { eventId?: string; kind?: string };
    if (!eventId || (kind !== 'changed' && kind !== 'cancelled')) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    const note = typeof body.note === 'string' ? sanitizeInput(body.note.trim()).slice(0, 600) || null : null;

    const db = getDb();
    const adminQuery = await db.collection(COLLECTIONS.APPROVED_ADMINS).where('email', '==', email.toLowerCase()).limit(1).get();
    if (adminQuery.empty) return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    const admin = adminQuery.docs[0].data();

    const eventDoc = await db.collection(COLLECTIONS.EVENTS).doc(eventId).get();
    if (!eventDoc.exists) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    const event = eventDoc.data()!;

    const isAdmin = admin.role === 'admin' || admin.role === 'superadmin';
    const hosts = `${event.communityId || ''},${event.partnerId || ''}`.split(',').map((s: string) => s.trim());
    if (!isAdmin && !(admin.communityId && hosts.includes(admin.communityId))) {
      return NextResponse.json({ error: 'Unauthorized - not your event' }, { status: 403 });
    }

    const attendees = await attendeesOf(eventId);
    if (attendees.length === 0) return NextResponse.json({ sent: 0, total: 0 });

    const hostName = await hostNameFor(event);
    const eventUrl = `${SITE_URL}/events/${event.slug}`;

    if (kind === 'cancelled') {
      const when = formatWhen(event.date);
      const { sent, configured } = await sendToAttendees(attendees, (a) => ({
        subject: getEventCancelledSubject(event.title),
        html: EventCancelledEmail({ firstName: a.firstName, eventTitle: event.title, hostName, when, note }),
      }));
      return NextResponse.json({ sent: sent.length, total: attendees.length, configured });
    }

    // What an attendee would act on: when it starts, when it ends, and where.
    const previous = (body.previous ?? {}) as { date?: string; endTime?: string; venue?: string; address?: string; location?: string };
    const changes: EventChange[] = [];
    if (formatWhen(previous.date) !== formatWhen(event.date)) {
      changes.push({ label: 'When', before: formatWhen(previous.date), after: formatWhen(event.date) });
    }
    const endOf = (d?: string) =>
      d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }) : '';
    if (previous.endTime && event.endTime && endOf(previous.endTime) !== endOf(event.endTime)) {
      changes.push({ label: 'Ends', before: endOf(previous.endTime), after: endOf(event.endTime) });
    }
    if (formatWhere(previous) !== formatWhere(event)) {
      changes.push({ label: 'Where', before: formatWhere(previous), after: formatWhere(event) });
    }
    if (changes.length === 0) {
      return NextResponse.json({ error: 'The date, time and place are unchanged, so there is nothing to tell attendees' }, { status: 400 });
    }

    const { sent, configured } = await sendToAttendees(attendees, (a) => ({
      subject: getEventChangedSubject(event.title),
      html: EventChangedEmail({
        firstName: a.firstName,
        eventTitle: event.title,
        hostName,
        changes,
        when: formatWhen(event.date),
        where: formatWhere(event),
        note,
        eventUrl,
      }),
    }));
    return NextResponse.json({ sent: sent.length, total: attendees.length, configured, changes });
  } catch (error) {
    console.error('Event notify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
