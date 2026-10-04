import { cache } from "react"
import {
  getDb,
  COLLECTIONS,
  byDisplayOrder,
  type Orderable,
} from "@/lib/firebase-admin"

/**
 * Communities, read from Firestore — the only source.
 *
 * The companion to lib/partners.ts, and it exists for the same reason that one
 * does. components/footer.tsx carried a hardcoded array of nine groups with
 * hardcoded slugs while Firestore held twenty-three, so fourteen communities —
 * Alamo City AI, ACM UTSA, Linux San Antonio, AWS User Group, Alamo Agents,
 * OWASP San Antonio and eight more — never appeared in the footer on any page
 * of the site. Nothing was broken enough to notice: all nine still existed, so
 * no link was dead. It had simply stopped keeping up, silently, and every group
 * added in the admin from then on would have been invisible there too.
 *
 * That is the failure CLAUDE.md already records for partners, in almost the
 * same words: a list consulted unconditionally is not a fallback, it is a
 * second source of truth, and it will drift.
 *
 * Server-side only. Client components fetch `/api/communities`, which reads the
 * same collection and applies the same ordering.
 */
export interface CommunityLink {
  id: string
  name: string
}

/**
 * All communities, in the order the admin arranged them.
 *
 * `byDisplayOrder` rather than a Firestore `orderBy`, matching
 * app/api/communities/route.ts — and the note there is worth repeating,
 * because it is a trap: ordering in the query on a field most documents do not
 * carry yet drops those documents from the result entirely. Sorting in memory
 * keeps every record and puts the ones with an explicit `order` first.
 *
 * `cache()` dedupes within a single render pass. It does not persist between
 * requests, which is the point — the footer is on every page and admin changes
 * are supposed to show immediately.
 *
 * Returns an empty array if Firestore is unreachable rather than throwing. A
 * community column that renders short is an honest failure; a hardcoded list
 * standing in for it is what got us here.
 */
export const listCommunities = cache(async (): Promise<CommunityLink[]> => {
  try {
    const snapshot = await getDb().collection(COLLECTIONS.COMMUNITIES).get()

    const rows: Orderable[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    rows.sort(byDisplayOrder)

    return rows
      .filter((row): row is Orderable & { name: string } => Boolean(row.name))
      .map((row) => ({ id: row.id, name: row.name }))
  } catch (error) {
    console.error("Communities fetch failed:", error)
    return []
  }
})
