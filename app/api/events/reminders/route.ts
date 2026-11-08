import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { centralDayKey } from '@/lib/event-week';
import { attendeesOf, eventExtrasFor, formatWhen, formatWhere, hostNameFor, sendToAttendees, SITE_URL } from '@/lib/event-emails';
import { EventReminderEmail, getEventReminderSubject } from '@/lib/emails/event-reminder';
import { remindersSuppressed } from '@/lib/event-messages';

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET — the day-before reminder: every published event happening tomorrow (San
 * Antonio time) with RSVPs on devsa.community gets a "see you tomorrow" email to
 * each person who registered.
 *
 * Registered in vercel.json (daily, 15:00 UTC: mid-morning in San Antonio), so it
 * checks CRON_SECRET first. Each RSVP is stamped `remindedAt` once its email
 * goes out, so a re-run never sends twice. Link-only events are included: the
 * people who RSVP'd were sent the link.
 *
 * An event whose organizers used "Message attendees" is skipped: that message
 * already carries the details and the add-to-calendar links, so a reminder on
 * top of it is one email too many (lib/event-messages.ts, remindersSuppressed).
 *
 * `?dry=1` lists what would send, and sends nothing.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const tomorrow = centralDayKey(new Date(Date.now() + 24 * 60 * 60 * 1000));

    const snapshot = await db.collection(COLLECTIONS.EVENTS).where('status', '==', 'published').get();
    const events = snapshot.docs.filter((doc) => {
      const e = doc.data();
      if (e.rsvpEnabled !== true || !e.date) return false;
      const at = new Date(e.date);
      return !Number.isNaN(at.getTime()) && centralDayKey(at) === tomorrow;
    });

    const dry = request.nextUrl.searchParams.get('dry') === '1';
    const report: { title: string; due: number; sent: number; skipped?: string }[] = [];

    for (const doc of events) {
      const event = doc.data();
      if (remindersSuppressed(event)) {
        report.push({ title: event.title, due: 0, sent: 0, skipped: 'organizers messaged attendees' });
        continue;
      }
      // The waitlist isn't reminded: it has no seat to come to.
      const due = (await attendeesOf(doc.id)).filter((a) => !a.remindedAt && !a.waitlisted);
      if (dry || due.length === 0) {
        report.push({ title: event.title, due: due.length, sent: 0 });
        continue;
      }
      const hostName = await hostNameFor(event);
      const when = formatWhen(event.date);
      const where = formatWhere(event);
      const eventUrl = `${SITE_URL}/events/${event.slug}`;
      const extras = eventExtrasFor(doc.id, event);
      const { sent } = await sendToAttendees(due, (a) => ({
        subject: getEventReminderSubject(event.title),
        html: EventReminderEmail({ firstName: a.firstName, eventTitle: event.title, hostName, when, where, eventUrl, extras }),
      }));
      // Stamp only what went out. A failed batch isn't retried (by the next run the event has
      // started), but it isn't marked sent either. The stamp is what stops a re-run sending twice.
      await Promise.all(sent.map((a) => a.ref.update({ remindedAt: new Date() }).catch((err) => console.error('remindedAt stamp failed:', err))));
      report.push({ title: event.title, due: due.length, sent: sent.length });
    }

    return NextResponse.json({ dryRun: dry, day: tomorrow, events: report });
  } catch (error) {
    console.error('Event reminders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
