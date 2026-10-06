import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { loadBrandFonts } from "@/lib/og-fonts"
import { OgCard } from "@/lib/og-card"

export const runtime = "nodejs"

/**
 * The share card for one calendar event.
 *
 * ## Every host, not the first one
 *
 * This used to resolve `communityIds[0]` or, in an `else if`, `partnerIds[0]`
 * — so a co-hosted event named one group, and an event with both a community
 * and a partner dropped the partner entirely, because the `else` meant the
 * partner branch never ran when a community existed. The extra hosts survived
 * only as a count that nothing rendered.
 *
 * Hosts are now resolved as one list: every community, then every partner,
 * joined with " + ". That is the same model the calendar cards use, so a
 * collaboration reads the same in the feed as it does on the site, and it
 * covers all three shapes — two communities, two partners, or a mix.
 *
 * Lookups go out in one Promise.all rather than sequentially, because this
 * runs on every crawl of every event page.
 *
 * ## When and where get their own row
 *
 * They were a clause in the grey hook sentence. On a card somebody shares to
 * get people to turn up, the date and the room are the message, so they sit in
 * the accent above it at 32px.
 *
 * The date is deliberate here, against the no-dates rule the conference cards
 * follow: a conference card is evergreen and a date makes it stale, while a
 * calendar event is shared precisely to get people somewhere on a given day.
 *
 * The end time is included because duration actually varies — the published
 * events run from one hour to thirteen, median two — so "6:00 PM" alone does
 * not tell a reader whether they are giving up an evening or a Saturday. It is
 * on 151 of 160 events rather than all of them, so the range degrades to the
 * start alone when endTime is absent, and also when it is at or before the
 * start, which one record currently is.
 */
async function getEventBySlug(slug: string) {
  try {
    const db = getDb()
    const snap = await db
      .collection(COLLECTIONS.EVENTS)
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get()

    if (!snap.empty) {
      const data = snap.docs[0].data()
      const ids = (field: string) =>
        (data[field] || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)

      const communityIds: string[] = ids("communityId")
      const partnerIds: string[] = ids("partnerId")

      const [communities, partners] = await Promise.all([
        Promise.all(
          communityIds.map(async (id) => {
            try {
              const d = await db.collection(COLLECTIONS.COMMUNITIES).doc(id).get()
              return d.exists ? (d.data()?.name as string | undefined) : undefined
            } catch {
              return undefined
            }
          })
        ),
        Promise.all(
          partnerIds.map(async (id) => {
            try {
              const d = await db.collection(COLLECTIONS.PARTNERS).doc(id).get()
              return d.exists ? (d.data()?.name as string | undefined) : undefined
            } catch {
              return undefined
            }
          })
        ),
      ])

      const hosts = [...communities, ...partners].filter(Boolean) as string[]
      // data.communityName is the denormalized label the admin writes. It is
      // the fallback, not the source — it holds one name even for a collab.
      if (!hosts.length && data.communityName) hosts.push(data.communityName)

      return {
        title: data.title as string,
        date: data.date as string | null,
        endTime: (data.endTime as string | undefined) ?? null,
        location: data.location as string | null,
        hosts,
      }
    }
  } catch (error) {
    console.error("OG: error fetching event", error)
  }

  // Last resort: the slug carries a trailing yyyy-mm-dd.
  const parts = slug.split("-")
  const dateStr = parts.slice(-3).join("-")
  const title = parts
    .slice(0, -3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return {
    title: title || "Community Event",
    date: dateStr ? `${dateStr}T00:00:00.000Z` : null,
    endTime: null as string | null,
    location: null,
    hosts: [] as string[],
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const [event, fonts] = await Promise.all([getEventBySlug(slug), loadBrandFonts()])

  // Central time, explicitly. The render runs on a UTC box, so a 6pm event
  // reads as the next day without this.
  const CT = "America/Chicago"
  const dayOf = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: CT })
  const timeOf = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: CT })
  const isMidnight = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour12: false, timeZone: CT }).startsWith("00:00")

  let when = ""
  const start = event.date ? new Date(event.date) : null
  if (start && !isNaN(start.getTime())) {
    if (isMidnight(start)) {
      // A midnight stamp means the admin recorded a date with no time, not an
      // event that begins at 12:00 AM.
      when = dayOf(start)
    } else {
      const end = event.endTime ? new Date(event.endTime) : null
      const hasEnd = end && !isNaN(end.getTime()) && end.getTime() > start.getTime()

      if (!hasEnd) {
        // 9 of 160 published events carry no endTime, and one has an end at or
        // before its start. Both fall back to the start alone rather than
        // rendering an empty or backwards range.
        when = `${dayOf(start)} · ${timeOf(start)}`
      } else if (dayOf(end) !== dayOf(start)) {
        // Crosses midnight, or a genuinely multi-day event.
        when = `${dayOf(start)} · ${timeOf(start)} – ${dayOf(end)} · ${timeOf(end)}`
      } else {
        // Same day: drop the opening meridiem when both ends share one, so an
        // evening event reads "6:00 – 8:00 PM" rather than "6:00 PM – 8:00 PM".
        const a = timeOf(start)
        const b = timeOf(end)
        const mer = (t: string) => t.slice(-2)
        const compact = mer(a) === mer(b) ? a.slice(0, -3) : a
        when = `${dayOf(start)} · ${compact} – ${b}`
      }
    }
  }

  const hostLine = event.hosts.length
    ? `Hosted by ${event.hosts.join(" + ")}`
    : "On the DEVSA community calendar"

  return new ImageResponse(
    (
      <OgCard
        title={[event.title]}
        meta={{ when: when || "Date to be announced", where: event.location || "San Antonio, TX" }}
        hook={hostLine}
        footer="On the DEVSA community calendar"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
