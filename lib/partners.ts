import { cache } from "react"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"

/**
 * Partners, read from Firestore — the only source now.
 *
 * There used to be a second list in `data/partners.ts`, described in CLAUDE.md
 * as a fallback. It was not one: every public surface imported it at module
 * scope and none of them ever called `/api/partners`, so the static file was
 * the primary and Firestore was the copy nobody read. The two had already
 * drifted — eleven records against ten — and the way that surfaced was a
 * partner deleted in the admin still rendering on the homepage, on Building
 * Together, and on its own URL, with nothing to indicate why.
 *
 * Communities had already made this move; `data/communities.ts` holds a type
 * and a logo list, no records. This brings partners onto the same path, so
 * there is one pattern here instead of two.
 *
 * Server-side only. Client components fetch `/api/partners`, which reads the
 * same collection.
 */
export interface Partner {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  video?: string
  /** Hover confetti on the homepage grid. Two partners set it. */
  isEasterEgg?: boolean
}

/**
 * All partners, name-ordered.
 *
 * `cache()` dedupes within a single render pass, so a route that needs
 * partners for `generateMetadata` and again for the page body pays for one
 * Firestore read rather than two. It does not persist between requests —
 * `revalidate` on the route is what controls that.
 *
 * Returns an empty array if Firestore is unreachable rather than throwing.
 * A partner wall that renders empty is a visible, honest failure; the old
 * static list made an outage look like a healthy page showing stale data,
 * which is the worse of the two.
 */
export const listPartners = cache(async (): Promise<Partner[]> => {
  try {
    const snapshot = await getDb()
      .collection(COLLECTIONS.PARTNERS)
      .orderBy("name")
      .get()

    return snapshot.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        name: d.name,
        logo: d.logo,
        description: d.description,
        website: d.website ?? undefined,
        video: d.video ?? undefined,
        isEasterEgg: d.isEasterEgg ?? undefined,
      }
    })
  } catch (error) {
    console.error("Partners fetch failed:", error)
    return []
  }
})

/** One partner by its document id, or null. */
export async function getPartner(slug: string): Promise<Partner | null> {
  const all = await listPartners()
  return all.find((p) => p.id === slug) ?? null
}
