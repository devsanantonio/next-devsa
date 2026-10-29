import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { isListed } from '@/lib/event-visibility';
import { centralDayKey, centralWeekDayKeys } from '@/lib/event-week';
import type { DigestEvent } from '@/lib/discord';

/**
 * This week's events, as the Monday Discord digest posts them: published,
 * listed (a link-only event goes to nobody), in San Antonio's Monday-to-Sunday
 * week, soonest first.
 *
 * Shared by the cron (/api/events/weekly-digest) and the admin Overview's
 * preview (/api/admin/digest-preview), so the preview is the message that will
 * post, not a second reading of the rules.
 */
export async function gatherWeekDigestEvents(now: Date = new Date()): Promise<{ events: DigestEvent[]; week: string }> {
  const db = getDb();
  const weekKeys = new Set(centralWeekDayKeys(now));

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

  return { events, week: [...weekKeys][0] };
}
