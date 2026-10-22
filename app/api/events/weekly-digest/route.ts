import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { isListed } from '@/lib/event-visibility';
import { centralDayKey, centralWeekDayKeys } from '@/lib/event-week';
import {
  buildWeeklyDigestPayload,
  isEventsDiscordConfigured,
  shareWeeklyDigestToDiscord,
  type DigestEvent,
} from '@/lib/discord';

const CRON_SECRET = process.env.CRON_SECRET;

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

    // A link-only event is posted to nobody: the digest is a public channel.
    const events: DigestEvent[] = snapshot.docs
      .filter((doc) => isListed(doc.data()))
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
          description: data.description as string | undefined,
          summary: data.summary as string | undefined,
        };
      })
      .filter((event) => {
        if (!event.date) return false;
        const at = new Date(event.date);
        if (Number.isNaN(at.getTime())) return false;
        return weekKeys.has(centralDayKey(at));
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
        // On the dry path too, so "is the webhook set in this environment?"
        // can be answered without posting to a live channel to find out.
        configured: isEventsDiscordConfigured(),
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
