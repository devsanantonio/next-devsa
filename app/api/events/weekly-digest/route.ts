import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import {
  buildWeeklyDigestPayload,
  isEventsDiscordConfigured,
  shareWeeklyDigestToDiscord,
  type DigestEvent,
} from '@/lib/discord';

const CRON_SECRET = process.env.CRON_SECRET;

const TZ = 'America/Chicago';

/** `YYYY-MM-DD` for an instant, as the calendar day it falls on in San Antonio. */
const dayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * The seven Central-time day keys of the week this cron fires inside, Monday
 * first.
 *
 * Day keys rather than a pair of timestamps, and this is the part the previous
 * version got wrong. It did:
 *
 *     new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
 *
 * `toLocaleString` returns a wall-clock string with no offset in it, so
 * `new Date` parses it back in the *server's* zone — UTC on Vercel. The result
 * was a Date five or six hours off, and `setHours(0,0,0,0)` then pinned
 * midnight UTC rather than midnight Central. The window ran Sunday evening to
 * Saturday evening: it swept in events from the night before the week began
 * and cut off most of its final Sunday.
 *
 * Comparing day keys sidesteps offsets entirely, and matches how the calendar
 * itself groups events. The arithmetic runs from noon UTC because a civil day
 * is never shorter than 23 hours, so ±12h never lands on a neighbouring date
 * however the clocks move.
 */
function centralWeekDayKeys(now: Date): string[] {
  const noon = new Date(`${dayKeyFmt.format(now)}T12:00:00Z`);
  const backToMonday = (noon.getUTCDay() + 6) % 7; // 0 on a Monday
  const monday = noon.getTime() - backToMonday * 86_400_000;
  return Array.from({ length: 7 }, (_, i) =>
    new Date(monday + i * 86_400_000).toISOString().slice(0, 10),
  );
}

/**
 * GET — posts this week's calendar to the DEVSA Discord.
 *
 * Registered in vercel.json and therefore publicly reachable, so it checks
 * CRON_SECRET before doing any work.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const weekKeys = new Set(centralWeekDayKeys(new Date()));

    // Display names for the hosts. Best-effort: if this read fails the digest
    // still goes out, with community ids where the names would have been.
    const communityLookup = new Map<string, string>();
    try {
      const communitiesSnapshot = await db.collection(COLLECTIONS.COMMUNITIES).get();
      communitiesSnapshot.docs.forEach((doc) => {
        communityLookup.set(doc.id, (doc.data().name as string) || doc.id);
      });
    } catch {
      // Firestore unavailable for communities — proceed with ids.
    }

    const snapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where('status', '==', 'published')
      .get();

    const events: DigestEvent[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const communityIds = (data.communityId || '')
          .split(',')
          .map((id: string) => id.trim())
          .filter(Boolean);
        const communityName = communityIds
          .map((id: string) => communityLookup.get(id) || data.communityName || id)
          .join(', ');

        return {
          title: data.title as string,
          slug: data.slug as string,
          date: data.date as string,
          location: data.location as string | undefined,
          venue: data.venue as string | undefined,
          communityName,
          eventType: data.eventType as string | undefined,
        };
      })
      .filter((event) => {
        if (!event.date) return false;
        const at = new Date(event.date);
        if (Number.isNaN(at.getTime())) return false;
        return weekKeys.has(dayKeyFmt.format(at));
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    /* `?dry=1` returns the message instead of sending it.
    
       Still behind CRON_SECRET, so it is no more reachable than the cron
       itself. It exists because the alternative way to check a change to this
       layout is to post it to a channel real people read, and then post the
       correction underneath. */
    if (request.nextUrl.searchParams.get('dry') === '1') {
      return NextResponse.json({
        dryRun: true,
        count: events.length,
        week: [...weekKeys][0],
        payload: buildWeeklyDigestPayload(events),
      });
    }

    // Posts even when the week is empty — a quiet week is worth saying out
    // loud, and silence is indistinguishable from the cron having failed.
    const posted = await shareWeeklyDigestToDiscord(events)
      .then(() => true)
      .catch((err) => {
        console.error('Discord weekly digest failed:', err);
        return false;
      });

    return NextResponse.json({
      success: true,
      message: `Weekly digest: ${events.length} event${events.length !== 1 ? 's' : ''} this week`,
      count: events.length,
      week: [...weekKeys][0],
      /* Reported separately from `discord`, because on its own that flag
         cannot tell "posted" from "skipped, no webhook set" — the sender fails
         soft and returns without throwing either way. Which is precisely the
         state this endpoint gets checked for after a deploy. */
      configured: isEventsDiscordConfigured(),
      discord: posted,
    });
  } catch (error) {
    console.error('Weekly digest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
