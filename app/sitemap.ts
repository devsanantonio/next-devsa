import type { MetadataRoute } from "next"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { listPartners } from "@/lib/partners"

/**
 * The sitemap reads Firestore, so a community, partner or event added in the
 * admin is advertised to search engines without a deploy.
 *
 * It used to be a hand-maintained array of top-level pages only — it never
 * listed a single partner, community or event, which meant the pages most
 * worth indexing on an events site were the ones crawlers had to find on their
 * own. Every entry below the static block is generated.
 *
 * Rendered per request rather than at build time; without this the file would
 * be baked once and go stale the moment anything changed, which is the problem
 * it exists to solve.
 */
export const dynamic = "force-dynamic"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

/** Pages that exist in the repo rather than in Firestore. */
function staticRoutes(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/events`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/buildingtogether`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/coworking-space`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/events/pysanantonio`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/events/access-granted`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/events/morehumanthanhuman`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/events/pysanantonio/2025`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/events/zero-to-agent`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/devsatv`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/branding`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/signin`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]
}

/**
 * Published events only, and only ones that have not finished.
 *
 * A sitemap advertising last spring's meetup invites crawlers to spend budget
 * on pages that will never be useful again. Past events stay reachable and
 * indexable if already known — they are simply not promoted here.
 */
async function eventRoutes(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getDb()
    .collection(COLLECTIONS.EVENTS)
    .where("status", "==", "published")
    .get()

  const now = Date.now()
  return snapshot.docs
    .map((doc) => doc.data())
    .filter((d) => {
      if (!d.slug || !d.date) return false
      const start = new Date(d.date).getTime()
      const rawEnd = d.endTime ? new Date(d.endTime).getTime() : NaN
      // Same guard the UI uses: ignore an end time that is missing or lands
      // before its start, so a bad row is never dropped as "already over".
      const end = Number.isFinite(rawEnd) && rawEnd > start ? rawEnd : start + 7_200_000
      return end >= now
    })
    .map((d) => ({
      url: `${baseUrl}/events/${d.slug}`,
      lastModified: d.updatedAt?.toDate?.() ?? d.createdAt?.toDate?.() ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
}

async function communityRoutes(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getDb().collection(COLLECTIONS.COMMUNITIES).get()
  return snapshot.docs.map((doc) => ({
    url: `${baseUrl}/buildingtogether/${doc.id}`,
    lastModified: doc.data().updatedAt?.toDate?.() ?? new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }))
}

async function partnerRoutes(): Promise<MetadataRoute.Sitemap> {
  const partners = await listPartners()
  return partners.map((p) => ({
    url: `${baseUrl}/buildingtogether/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * Each source is settled independently and a failure contributes nothing.
   *
   * A sitemap that 500s is worse than a short one: crawlers treat the error as
   * a signal about the site rather than about one Firestore call. If events are
   * unreachable, the partners and communities still ship.
   */
  const [events, communities, partners] = await Promise.allSettled([
    eventRoutes(),
    communityRoutes(),
    partnerRoutes(),
  ])

  const settled = (r: PromiseSettledResult<MetadataRoute.Sitemap>) => {
    if (r.status === "fulfilled") return r.value
    console.error("Sitemap section failed:", r.reason)
    return []
  }

  const routes = [
    ...staticRoutes(),
    ...settled(events),
    ...settled(communities),
    ...settled(partners),
  ]

  // A partner and a community can share the /buildingtogether/<id> namespace,
  // and duplicate <loc> entries make a sitemap invalid. First wins.
  const seen = new Set<string>()
  return routes.filter((r) => !seen.has(r.url) && seen.add(r.url))
}
