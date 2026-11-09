import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isHostedBy } from '@/lib/event-hosts';
import { alreadyReceived, defaultKind, eventDay, messageWindow, replacesReminder, TEMPLATE_BLANKS, type MessageKind } from '@/lib/event-messages';
import { attendeesOf, eventExtrasFor, formatWhen, formatWhere, hostLogoFor, hostNameFor, sendToAttendees, SITE_URL } from '@/lib/event-emails';
import { isAdminRole } from '@/lib/admin-roles';
import {
  EventChangedEmail,
  EventCancelledEmail,
  EventMessageEmail,
  EventDetailsEmail,
  getEventMessageSubject,
  getEventDetailsSubject,
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
 *   { eventId, kind: 'message', type: 'details', note?, rsvpIds? }
 *   { eventId, kind: 'message', type: 'before' | 'after', subject, message, rsvpIds? }
 *   either with preview: true to get the rendered email back and send nothing
 *
 * A message goes to the people going (never the waitlist), or to the ones in
 * rsvpIds. Each kind reaches a person at most once, and its window is in
 * lib/event-messages.ts; anyone who already has that kind is skipped, not an
 * error. It goes from DEVSA with the sender as reply-to and their name on it.
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
    if (!eventId || (kind !== 'changed' && kind !== 'cancelled' && kind !== 'message')) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    // Plain text, as typed. The templates escape everything they render; running it through
    // sanitizeInput as well HTML-encoded it twice, so "Q&A" arrived as "Q&amp;A".
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 600) || null : null;

    const db = getDb();
    const adminQuery = await db.collection(COLLECTIONS.APPROVED_ADMINS).where('email', '==', email.toLowerCase()).limit(1).get();
    if (adminQuery.empty) return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    const admin = adminQuery.docs[0].data();

    const eventDoc = await db.collection(COLLECTIONS.EVENTS).doc(eventId).get();
    if (!eventDoc.exists) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    const event = eventDoc.data()!;

    const isAdmin = isAdminRole(admin.role);
    if (!isAdmin && !isHostedBy(event, admin.communityId)) {
      return NextResponse.json({ error: 'Unauthorized - not your event' }, { status: 403 });
    }

    if (kind === 'message') {
      const now = Date.now();
      const type: MessageKind = body.type === 'details' || body.type === 'before' || body.type === 'after' ? body.type : defaultKind(event.date, now);
      const subject = typeof body.subject === 'string' ? body.subject.replace(/\s+/g, ' ').trim().slice(0, 120) : '';
      const message = typeof body.message === 'string' ? body.message.trim().slice(0, 3000) : '';
      if (type !== 'details') {
        if (!subject || !message) return NextResponse.json({ error: 'A subject and a message are both needed' }, { status: 400 });
        if (TEMPLATE_BLANKS.some((b) => message.includes(b))) {
          return NextResponse.json({ error: 'Replace the part in [brackets] with your own words first' }, { status: 400 });
        }
      }
      const picked = Array.isArray(body.rsvpIds) ? new Set((body.rsvpIds as unknown[]).filter((x): x is string => typeof x === 'string')) : null;

      const gate = messageWindow(type, event.date, now);
      const senderName = [admin.firstName, admin.lastName].filter(Boolean).join(' ') || 'The organizers';
      const [hostName, groupLogo] = await Promise.all([hostNameFor(event), hostLogoFor(event)]);
      const eventUrl = `${SITE_URL}/events/${event.slug}`;
      const extras = eventExtrasFor(eventId, event);
      const day = eventDay(event.date);
      const build = (firstName: string) =>
        type === 'details'
          ? {
              subject: getEventDetailsSubject(day, event.title),
              html: EventDetailsEmail({ firstName, eventTitle: event.title, hostName, senderName, day, when: formatWhen(event.date), where: formatWhere(event), note, eventUrl, extras, groupLogo }),
            }
          : {
              subject: getEventMessageSubject(subject, event.title),
              html: EventMessageEmail({ firstName, eventTitle: event.title, hostName, senderName, subject, message, eventUrl, extras, groupLogo }),
            };

      // Going, chosen, and not already sent this kind.
      const going = (await attendeesOf(eventId)).filter((a) => !a.waitlisted && (!picked || picked.has(a.id)));
      const recipients = going.filter((a) => !alreadyReceived(a, type));
      const skipped = going.length - recipients.length;

      // preview: the exact email, addressed to the sender, and nothing sent. The
      // admin shows it in a frame before the Send button.
      if (body.preview === true) {
        const { subject: s, html } = build(admin.firstName || 'there');
        return NextResponse.json({
          subject: s,
          html,
          going: recipients.length,
          skipped,
          canSend: gate.open && recipients.length > 0,
          reason: !gate.open ? gate.reason : recipients.length === 0 ? 'Nobody selected still needs this one' : null,
        });
      }
      if (!gate.open) return NextResponse.json({ error: gate.reason }, { status: 400 });
      if (recipients.length === 0) return NextResponse.json({ error: 'Nobody selected still needs this one' }, { status: 400 });

      const { sent, configured } = await sendToAttendees(recipients, (a) => build(a.firstName), admin.contactEmail || admin.email);
      if (sent.length > 0) {
        const at = new Date();
        const stopReminder = replacesReminder(type, at.getTime(), event.date);
        await Promise.all(
          sent.map((a) =>
            a.ref
              .update({ [`messaged.${type}`]: at, ...(stopReminder && !a.remindedAt ? { remindedAt: at } : {}) })
              .catch((err) => console.error('messaged stamp failed:', err))
          )
        );
        await eventDoc.ref.update({
          messages: FieldValue.arrayUnion({ at, by: email.toLowerCase(), type, subject: type === 'details' ? getEventDetailsSubject(day, event.title) : subject, sent: sent.length }),
        });
      }
      return NextResponse.json({ sent: sent.length, total: recipients.length, skipped, configured });
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
        extras: eventExtrasFor(eventId, event),
      }),
    }));
    return NextResponse.json({ sent: sent.length, total: attendees.length, configured, changes });
  } catch (error) {
    console.error('Event notify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
