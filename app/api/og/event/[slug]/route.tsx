import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { loadBrandFonts } from "@/lib/og-fonts"
import { OgCard } from "@/lib/og-card"
import { DevsaLogoMark } from "@/lib/og-brand"
import sharp from "sharp"

const SITE = "https://www.devsa.community"

type Host = { id: string; name: string; logo?: string; type: "community" | "partner" }


/**
 * A host's logo as a PNG data URI for a dark tile, or null.
 *
 * Every tile on this card is dark, so no logo sits in a white box on a dark
 * card. The original file is used, not lib/logo-invert's light-ground
 * variant, because the ground here is dark. A logo that is mostly dark ink
 * would vanish on it, so for those (mean brightness under 65 — of the forty
 * directory logos: 434 MEDIA, UTSA University College and Learn2AI) the
 * near-black pixels are lifted to the DEVSA mark's off-white while every
 * coloured pixel keeps its colour: UTSA's navy wordmark turns white and its
 * orange stays, the way its own reversed logo reads. Lifting dark pixels in
 * every logo was tried and washed out DEF CON, BSides, Texas Linux Fest and
 * others whose dark detail is part of the design.
 *
 * Fetched here rather than handed to the renderer as a URL so one slow or
 * missing file cannot fail the card, and converted through sharp because the
 * renderer cannot draw WebP, which five of the directory's logos are.
 */
async function hostLogo(host: Host): Promise<string | null> {
  if (!host.logo) return null
  const url = host.logo.startsWith("/") ? `${SITE}${host.logo}` : host.logo
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()), { density: 300 })
      .resize(240, 240, { fit: "inside", withoutEnlargement: false })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const lumOf = (i: number) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    // Mean brightness of the visible pixels, alpha-weighted, so a transparent
    // background counts as neither colour.
    let sum = 0
    let weight = 0
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255
      if (a < 0.1) continue
      sum += a * lumOf(i)
      weight += a
    }
    if (weight > 0 && sum / weight < 65) {
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] >= 25 && lumOf(i) < 70) data[i] = data[i + 1] = data[i + 2] = 238
      }
    }

    const png = await sharp(data, { raw: info }).png().toBuffer()
    return `data:image/png;base64,${png.toString("base64")}`
  } catch {
    return null
  }
}

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
              return d.exists
                ? ({ id, name: d.data()?.name as string, logo: d.data()?.logo as string | undefined, type: "community" } as Host)
                : undefined
            } catch {
              return undefined
            }
          })
        ),
        Promise.all(
          partnerIds.map(async (id) => {
            try {
              const d = await db.collection(COLLECTIONS.PARTNERS).doc(id).get()
              return d.exists
                ? ({ id, name: d.data()?.name as string, logo: d.data()?.logo as string | undefined, type: "partner" } as Host)
                : undefined
            } catch {
              return undefined
            }
          })
        ),
      ])

      const hosts = [...communities, ...partners].filter((h): h is Host => !!h?.name)
      // data.communityName is the denormalized label the admin writes. It is
      // the fallback, not the source — it holds one name even for a collab.
      if (!hosts.length && data.communityName)
        hosts.push({ id: "", name: data.communityName, logo: data.communityLogo || undefined, type: "community" })

      return {
        title: data.title as string,
        date: data.date as string | null,
        endTime: (data.endTime as string | undefined) ?? null,
        location: data.location as string | null,
        hosts,
        // DEVSA's own events (see Event.isOfficial) keep the DEVSA mark.
        official: data.isOfficial === true,
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
    hosts: [] as Host[],
    official: false,
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

  /*
   * The hosts lead, not DEVSA.
   *
   * Groups sharing their own event from the calendar told us the card read as
   * a DEVSA event: the DEVSA mark sat in the top-left where a brand goes, and
   * the hosts were a grey line under the date. Now the hosts' logos and names
   * take that corner, and DEVSA is only the address in the footer,
   * devsa.community/events: the calendar the event is listed on, which is all
   * DEVSA is to it. DEVSA's own events (isOfficial) and events with no host on
   * record keep the mark.
   */
  const shown = event.official ? [] : event.hosts.slice(0, 3)
  const logos = await Promise.all(shown.map(hostLogo))
  const names = shown.map((h) => h.name).join(" + ")

  const header = shown.length ? (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {shown.map((h, i) =>
        logos[i] ? (
          <div
            key={h.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 112,
              height: 112,
              borderRadius: 22,
              padding: 14,
              // Always dark: no white boxes on a dark card. See hostLogo.
              backgroundColor: "#1c1c1c",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logos[i]!} alt="" style={{ maxWidth: 84, maxHeight: 84, objectFit: "contain" }} />
          </div>
        ) : null
      )}
      <div style={{ display: "flex", flexDirection: "column", marginLeft: logos.some(Boolean) ? 4 : 0 }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: "#a3a3a3", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Hosted by
        </span>
        <span style={{ fontSize: names.length > 48 ? 26 : 32, fontWeight: 700, color: "#ffffff", maxWidth: 760, lineHeight: 1.2 }}>
          {names}
        </span>
      </div>
    </div>
  ) : undefined

  return new ImageResponse(
    (
      <OgCard
        header={header}
        title={[event.title]}
        // An official event co-hosted with groups still credits them.
        hook={event.official && event.hosts.length ? `With ${event.hosts.map((h) => h.name).join(" + ")}` : undefined}
        meta={{ when: when || "Date to be announced", where: event.location || "San Antonio, TX" }}
        // The alt mark (monochrome) alone, bottom-left, where a credit sits,
        // so it reads as a quiet sign-off rather than competing with the
        // hosts' colour above. The calendar the
        // event is listed on. No wording beside it (the logo rules keep the
        // word DEVSA off any piece with the mark). Cards DEVSA leads already
        // carry the mark at the top, so they do not repeat it here.
        footer={shown.length ? <DevsaLogoMark size={34} alt /> : undefined}
        url="devsa.community/events"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
