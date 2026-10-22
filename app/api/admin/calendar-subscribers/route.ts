import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';

/**
 * How many people have the community calendar in their own calendar app.
 * Any approved admin, organizers included: it is a count, nothing personal.
 *
 * Counted from the coded subscriptions /api/events/calendar records (see
 * lib/calendar-subscribe.ts). A subscription is **active** when it was polled
 * in the last 30 days and has been polling for more than 12 hours. The second
 * condition is what separates a calendar app that keeps checking from a single
 * click, a link opened once in a browser, or someone typing in a made-up code:
 * those are seen once and never again.
 *
 * It undercounts in one known way: subscriptions made before codes existed use
 * the bare feed address and are not here at all.
 */
const DAY = 86_400_000;

async function isApprovedAdmin(email: string | null) {
  if (!email) return false;
  const q = await getDb()
    .collection(COLLECTIONS.APPROVED_ADMINS)
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();
  return !q.empty;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isApprovedAdmin(await verifiedEmail(request)))) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    }

    const since = new Date(Date.now() - 30 * DAY);
    const snap = await getDb()
      .collection(COLLECTIONS.CALENDAR_SUBSCRIPTIONS)
      .where('lastSeen', '>=', since)
      .get();

    const byClient: Record<string, number> = { google: 0, apple: 0, outlook: 0, other: 0 };
    let active = 0;
    snap.docs.forEach((doc) => {
      const d = doc.data();
      const first = d.firstSeen?.toDate?.() as Date | undefined;
      const last = d.lastSeen?.toDate?.() as Date | undefined;
      if (!first || !last || last.getTime() - first.getTime() < DAY / 2) return;
      active += 1;
      byClient[d.client in byClient ? d.client : 'other'] += 1;
    });

    return NextResponse.json({ active, byClient, seenLast30Days: snap.size });
  } catch (error) {
    console.error('Calendar subscriber count error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
