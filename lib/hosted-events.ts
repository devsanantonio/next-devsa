import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { PYSA_EVENT_ID, PYSA_HOST_COMMUNITY } from '@/data/pysa/2026';
import {
  AG_EVENT_ID,
  AG_HOST_COMMUNITY,
  AG_HOST_COMMUNITY_ID,
} from '@/data/access-granted/2026';

/**
 * The events whose submissions a host community's organizers may see.
 *
 * Each entry names the community that owns an event and the eventId to filter
 * by. Adding an event to this list is the whole job — the scoping that reads it
 * is generic, so a new open call no longer means new scoping logic.
 *
 * PySanAntonio matches on the community NAME only, which is how it has always
 * worked. Access Granted also accepts the community's document id, because a
 * name is editable in the admin UI and a rename would otherwise silently cut
 * organizers off from their own submissions.
 */
export const HOSTED_EVENTS: {
  eventId: string;
  communityName: string;
  communityId?: string;
}[] = [
  { eventId: PYSA_EVENT_ID, communityName: PYSA_HOST_COMMUNITY },
  {
    eventId: AG_EVENT_ID,
    communityName: AG_HOST_COMMUNITY,
    communityId: AG_HOST_COMMUNITY_ID,
  },
];

/**
 * The eventIds an organizer's community hosts, or [] when it hosts none.
 * Used both to scope what an organizer reads and what they may change, so the
 * two can never disagree.
 */
export async function hostedEventIdsFor(communityId: string | undefined): Promise<string[]> {
  if (!communityId) return [];
  const communityDoc = await getDb().collection(COLLECTIONS.COMMUNITIES).doc(communityId).get();
  const communityName = communityDoc.exists
    ? (communityDoc.data()?.name as string | undefined)
    : undefined;
  return HOSTED_EVENTS.filter(
    (ev) =>
      communityName?.trim().toLowerCase() === ev.communityName.toLowerCase() ||
      (ev.communityId !== undefined && communityId === ev.communityId)
  ).map((ev) => ev.eventId);
}
