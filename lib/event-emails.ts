/**
 * Emailing the people who RSVP'd to an event: the change and cancellation
 * notices (/api/events/notify) and the day-before reminder (/api/events/reminders).
 *
 * Time and place are formatted exactly as the RSVP confirmation formats them, in
 * San Antonio's zone and saying so, so every email about one event agrees.
 */
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from '@/lib/resend';
import { EVENT_TIMEZONE } from '@/app/api/events/feed/_shared';

export const SITE_URL = 'https://www.devsa.community';

export function formatWhen(date: string | undefined | null): string {
  if (!date) return 'TBD';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'TBD';
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: EVENT_TIMEZONE,
    timeZoneName: 'short',
  });
}

/** Venue and address, as the admin form joins them. */
export function formatWhere(e: { venue?: string; address?: string; location?: string }): string {
  if (e.venue && e.address) return `${e.venue}, ${e.address}`;
  return e.venue || e.address || e.location || 'TBD';
}

/** Every host by name, for "Hosted by": a collab stores "alamo-python,pytexas". */
export async function hostNameFor(event: FirebaseFirestore.DocumentData): Promise<string> {
  const db = getDb();
  const ids = `${event.communityId || ''},${event.partnerId || ''}`.split(',').map((s) => s.trim()).filter(Boolean);
  const names = await Promise.all(
    ids.map(async (id) => {
      for (const col of [COLLECTIONS.COMMUNITIES, COLLECTIONS.PARTNERS]) {
        const doc = await db.collection(col).doc(id).get().catch(() => null);
        if (doc?.exists) return (doc.data()?.name as string) || id;
      }
      return event.communityName || id;
    })
  );
  const hosts = [...(event.isOfficial ? ['DEVSA'] : []), ...names];
  return hosts.length ? hosts.join(' + ') : 'DEVSA';
}

export interface Attendee {
  ref: FirebaseFirestore.DocumentReference;
  firstName: string;
  email: string;
  remindedAt?: unknown;
}

export async function attendeesOf(eventId: string): Promise<Attendee[]> {
  const snap = await getDb().collection(COLLECTIONS.EVENT_RSVPS).where('eventId', '==', eventId).get();
  const seen = new Set<string>();
  return snap.docs
    .map((d) => ({ ref: d.ref, firstName: d.data().firstName || '', email: String(d.data().email || '').toLowerCase(), remindedAt: d.data().remindedAt }))
    .filter((a) => a.email && !seen.has(a.email) && (seen.add(a.email), true));
}

/**
 * One email per attendee, in Resend batches of 100. Returns how many went out.
 * A failed batch is logged and skipped; the rest still send.
 */
export async function sendToAttendees(
  attendees: Attendee[],
  build: (a: Attendee) => { subject: string; html: string }
): Promise<{ sent: Attendee[]; configured: boolean }> {
  if (!isResendConfigured() || !resend) return { sent: [], configured: false };
  const sent: Attendee[] = [];
  for (let i = 0; i < attendees.length; i += 100) {
    const chunk = attendees.slice(i, i + 100);
    try {
      const { error } = await resend.batch.send(
        chunk.map((a) => ({ from: EMAIL_FROM, to: a.email, replyTo: EMAIL_REPLY_TO, ...build(a) }))
      );
      if (error) throw error;
      sent.push(...chunk);
    } catch (err) {
      console.error('Attendee email batch failed:', err);
    }
  }
  return { sent, configured: true };
}
