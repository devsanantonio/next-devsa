import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { isListed } from "@/lib/event-visibility"

/**
 * Published, listed events on the community calendar, read on the server, as plain objects a client
 * component can take as props.
 *
 * The group pages (/buildingtogether/<id>) and the topic pages (/buildingtogether/topics/<topic>) render
 * per request with these, so a group's name, description and meetups are in the HTML a search engine
 * reads. Until November 2026 the group page fetched the whole calendar in the browser after load, and the
 * server sent a spinner: no heading, no description, no events.
 */
export type GroupEvent = {
  id: string
  title: string
  slug: string
  date: string
  location: string
  description: string
  url?: string
  communityId: string
}

export async function listPublishedEvents(): Promise<GroupEvent[]> {
  try {
    const snap = await getDb().collection(COLLECTIONS.EVENTS).where("status", "==", "published").get()
    return snap.docs
      .map((d): Record<string, unknown> & { id: string } => ({ ...(d.data() as Record<string, unknown>), id: d.id }))
      .filter((e) => isListed(e as { unlisted?: unknown }))
      .map((e) => ({
        id: e.id,
        title: String(e.title ?? ""),
        slug: String(e.slug ?? ""),
        date: String(e.date ?? ""),
        location: String(e.location ?? ""),
        description: String(e.description ?? ""),
        url: typeof e.url === "string" ? e.url : undefined,
        communityId: String(e.communityId ?? ""),
      }))
  } catch (error) {
    console.error("Published events fetch failed:", error)
    return []
  }
}

/** A collaboration lists its hosts comma-separated in communityId. */
export function hostedBy(event: GroupEvent, groupId: string): boolean {
  return event.communityId.split(",").map((id) => id.trim()).includes(groupId)
}
