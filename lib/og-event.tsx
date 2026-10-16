import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import sharp from "sharp"

/*
 * Everything an event share image needs, shared by the link card
 * (/api/og/event/[slug], 1200x630) and the social graphic
 * (/api/og/event/[slug]/social, 1080x1350) so the two cannot drift: the
 * event, its hosts and their logos, and when it is.
 */

const SITE = "https://www.devsa.community"

export type Host = { id: string; name: string; logo?: string; type: "community" | "partner" }


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
async function hostLogo(host: Host): Promise<{ src: string; color: string | null } | null> {
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

    // The logo's own colour, for anything on a card that should carry it:
    // the mean of its saturated pixels, or null for a black-and-white mark
    // (under 3% of its visible pixels in colour), which then takes DEVSA's.
    let r = 0
    let g = 0
    let b = 0
    let n = 0
    let seen = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue
      seen++
      const mx = Math.max(data[i], data[i + 1], data[i + 2])
      const mn = Math.min(data[i], data[i + 1], data[i + 2])
      if (mx < 60 || (mx - mn) / mx < 0.35) continue
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      n++
    }
    const color = seen && n / seen >= 0.03 ? `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})` : null

    const png = await sharp(data, { raw: info }).png().toBuffer()
    return { src: `data:image/png;base64,${png.toString("base64")}`, color }
  } catch {
    return null
  }
}

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
export async function getEventBySlug(slug: string) {
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
        // Link only (lib/event-visibility.ts): the cards say "Private event"
        // rather than send invitees to a calendar the event is not on.
        unlisted: data.unlisted === true,
        found: true,
      }
    }
  } catch (error) {
    console.error("OG: error fetching event", error)
  }

  /*
   * Not a published event: deleted, cancelled, a draft, or a slug nobody
   * made. This used to invent one from the slug's words, so a cancelled
   * event's link became a garbled card, and any URL at all produced a
   * DEVSA-branded poster with whatever title it spelled out
   * (/api/og/event/free-crypto-giveaway/social). Now it says so: the social
   * graphic answers 404, and the link card falls back to the calendar's own.
   */
  return {
    title: "",
    date: null as string | null,
    endTime: null as string | null,
    location: null as string | null,
    hosts: [] as Host[],
    official: false,
    unlisted: false,
    found: false,
  }
}


export type EventCardData = Awaited<ReturnType<typeof getEventBySlug>>

// Central time, explicitly. The render runs on a UTC box, so a 6pm event
// reads as the next day without this.
const CT = "America/Chicago"
const dayOf = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: CT })
const timeOf = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: CT })
const isMidnight = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour12: false, timeZone: CT }).startsWith("00:00")

/**
 * When, as a date and a time kept apart: the social graphic sets them on
 * one line itself. `time` is empty when the admin recorded a date only.
 */
export function eventWhenParts(event: EventCardData): { date: string; time: string } {
  const start = event.date ? new Date(event.date) : null
  if (!start || isNaN(start.getTime())) return { date: "", time: "" }
  // A midnight stamp means the admin recorded a date with no time, not an
  // event that begins at 12:00 AM.
  if (isMidnight(start)) return { date: dayOf(start), time: "" }

  const end = event.endTime ? new Date(event.endTime) : null
  const hasEnd = end && !isNaN(end.getTime()) && end.getTime() > start.getTime()
  // 9 of 160 published events carry no endTime, and one has an end at or
  // before its start. Both fall back to the start alone rather than rendering
  // an empty or backwards range.
  if (!hasEnd) return { date: dayOf(start), time: timeOf(start) }
  // Crosses midnight, or a genuinely multi-day event.
  if (dayOf(end) !== dayOf(start)) {
    return { date: `${dayOf(start)} – ${dayOf(end)}`, time: `${timeOf(start)} – ${timeOf(end)}` }
  }
  // Same day: drop the opening meridiem when both ends share one, so an
  // evening event reads "6:00 – 8:00 PM" rather than "6:00 PM – 8:00 PM".
  const a = timeOf(start)
  const b = timeOf(end)
  const compact = a.slice(-2) === b.slice(-2) ? a.slice(0, -3) : a
  return { date: dayOf(start), time: `${compact} – ${b}` }
}

/** "Tuesday, October 13 · 6:00 – 7:30 PM", in Central time, for the link card. */
export function eventWhen(event: EventCardData): string {
  const start = event.date ? new Date(event.date) : null
  const end = event.endTime ? new Date(event.endTime) : null
  // Multi-day keeps its own shape on one line: each end with its day.
  if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && !isMidnight(start) &&
      end.getTime() > start.getTime() && dayOf(end) !== dayOf(start)) {
    return `${dayOf(start)} · ${timeOf(start)} – ${dayOf(end)} · ${timeOf(end)}`
  }
  const { date, time } = eventWhenParts(event)
  return time ? `${date} · ${time}` : date
}

/**
 * The hosts to lead with (up to three) and their logos. DEVSA's own events
 * (isOfficial) return none, so the card keeps the DEVSA mark instead.
 */
export async function eventHosts(event: EventCardData) {
  const shown = event.official ? [] : event.hosts.slice(0, 3)
  const loaded = await Promise.all(shown.map(hostLogo))
  const logos = loaded.map((l) => l?.src ?? null)
  // The first host whose logo has a colour, for a glow or an accent.
  const color = loaded.find((l) => l?.color)?.color ?? null
  const names = shown.map((h) => h.name).join(" + ")
  return { shown, logos, names, color }
}
