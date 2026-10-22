import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { isListed } from "@/lib/event-visibility"
import { centralDayKey, centralWeekDayKeys, upcomingWeekDayKeys } from "@/lib/event-week"
import { loadBrandFonts, loadBrandMonoFonts } from "@/lib/og-fonts"
import { BRAND_GRADIENT_STOPS, DevsaLogoMark, LOGO_COLORS } from "@/lib/og-brand"
import { eventCardFromData, eventHosts } from "@/lib/og-event"

export const runtime = "nodejs"

const W = 1080
const H = 1350
const PAD = 70
const INK = "#ffffff"
const MUTED = "#a3a3a3"
const CARD = "#141414"
const CARD_EDGE = "#2a2a2a"
/** DEVSA's own events stand out in the brand's electric blue. */
const DEVSA_BLUE = "#0a14ff"
const CT = "America/Chicago"
/** Never more cards than this, however short: past it a phone can't read them. */
const MAX_CARDS = 6

/**
 * Height the cards may take: the canvas less the heading block and the foot.
 * The heading ends near 300 and the foot starts near 1215.
 */
const LIST_TOP = 330
const LIST_BOTTOM = 1190
const CARD_GAP = 20

type Size = { pad: number; num: number; day: number; logo: number; meta: number; title: number; host: number }

const REGULAR: Size = { pad: 28, num: 84, day: 26, logo: 96, meta: 22, title: 40, host: 24 }
const COMPACT: Size = { pad: 24, num: 62, day: 22, logo: 76, meta: 19, title: 33, host: 21 }

/** Left of the title: date column and logo tile, with their gaps. */
const textWidth = (s: Size) => W - PAD * 2 - s.pad * 2 - (s.num * 1.35 + 30) - (s.logo + 30)

/**
 * The time-and-venue line, kept to one line: a long venue ("Northeast
 * Lakeview College") wrapped it and pushed the card into the foot. Geist Mono
 * at 0.1em tracking is 0.7em a glyph.
 */
function oneLineMeta(meta: string, s: Size): string {
  const max = Math.floor(textWidth(s) / (s.meta * 0.7))
  return meta.length <= max ? meta : `${meta.slice(0, max - 1).trimEnd()}…`
}

function cardHeight(title: string, s: Size): number {
  // Geist Black averages about half an em per glyph; measured against the
  // titles on the calendar, 0.5 matches where they actually wrap.
  const lines = Math.max(1, Math.ceil((title.length * s.title * 0.5) / textWidth(s)))
  const text = s.meta * 1.3 + 6 + lines * s.title * 1.05 + 8 + s.host * 1.3
  return Math.max(s.logo, s.num + s.day * 1.2 + 4, text) + s.pad * 2 + 4
}

/**
 * The renderer has no overflow clipping, so cards too tall for the canvas run
 * over the foot. Each card's height is estimated from its title's length, the
 * regular size is used if every card fits at it, then the compact one, and
 * the list stops at the last card that fits; the foot counts the rest.
 */
function fit(titles: string[]): { size: Size; count: number } {
  const room = LIST_BOTTOM - LIST_TOP
  const countAt = (s: Size) => {
    let used = 0
    for (let i = 0; i < titles.length; i++) {
      used += cardHeight(titles[i], s) + (i ? CARD_GAP : 0)
      if (used > room) return i
    }
    return titles.length
  }
  if (countAt(REGULAR) === titles.length) return { size: REGULAR, count: titles.length }
  return { size: COMPACT, count: countAt(COMPACT) }
}

const fmt = (key: string, o: Intl.DateTimeFormatOptions) =>
  new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", { ...o, timeZone: CT })

function startTime(iso: string): string {
  const d = new Date(iso)
  const t = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: CT })
  // A midnight stamp means a date with no time recorded.
  return d.toLocaleTimeString("en-US", { hour12: false, timeZone: CT }).startsWith("00:00") ? "" : t
}

/** "OCT 19–25", or "OCT 26–NOV 1" across a month. */
function weekLabel(keys: string[]): string {
  const [a, b] = [keys[0], keys[6]]
  const sameMonth = a.slice(0, 7) === b.slice(0, 7)
  return `${fmt(a, { month: "short", day: "numeric" })}–${fmt(b, sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" })}`.toUpperCase()
}

/**
 * The week's events as one 1080x1350 image for Instagram and LinkedIn, drawn
 * in the layout DEVSA was making by hand each week: "› THIS WEEK", one card
 * per event with the date down the left, the host's logo, then time and
 * venue, title and host. DEVSA's own events are the blue card.
 *
 * A host with no logo (one typed into the admin) gets the brand gradient
 * filling its tile, as on the site.
 *
 * With no `week`, it is the week ahead: this week on a Monday, otherwise the
 * one starting next Monday (lib/event-week.ts). `?week=YYYY-MM-DD` draws the
 * week containing that date. Link-only events are left off, as on every
 * listing surface.
 */
export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get("week")
  const keys =
    week && /^\d{4}-\d{2}-\d{2}$/.test(week)
      ? centralWeekDayKeys(new Date(`${week}T12:00:00Z`))
      : upcomingWeekDayKeys(new Date())
  const inWeek = new Set(keys)

  const db = getDb()
  const [snapshot, sans, mono] = await Promise.all([
    db.collection(COLLECTIONS.EVENTS).where("status", "==", "published").get(),
    loadBrandFonts(),
    loadBrandMonoFonts(),
  ])

  const docs = snapshot.docs
    .map((d) => d.data())
    .filter((e) => isListed(e) && e.date && !isNaN(new Date(e.date).getTime()) && inWeek.has(centralDayKey(new Date(e.date))))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const all = await Promise.all(
    docs.slice(0, MAX_CARDS).map(async (data) => {
      const card = await eventCardFromData(db, data)
      const { logos, names } = await eventHosts(card)
      const day = centralDayKey(new Date(data.date))
      return {
        dow: fmt(day, { weekday: "short" }).toUpperCase(),
        num: fmt(day, { day: "numeric" }),
        title: card.title,
        meta: [startTime(data.date), (data.venue as string) || (card.location ?? "").split(",")[0]]
          .filter(Boolean)
          .join(" · ")
          .toUpperCase(),
        // DEVSA's own events name the groups it ran them with.
        host: card.official ? ["DEVSA", ...card.hosts.map((h) => h.name)].join(" + ") : names,
        logo: logos[0] ?? null,
        official: card.official,
      }
    })
  )

  const { size: s, count } = fit(all.map((r) => r.title))
  const cards = all.slice(0, count)
  const more = docs.length - cards.length

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          fontFamily: "Geist Sans",
          position: "relative",
        }}
      >
        {/* Heading */}
        <div style={{ display: "flex", flexDirection: "column", padding: `86px ${PAD}px 0` }}>
          <span style={{ fontFamily: "Geist Mono", fontSize: 28, fontWeight: 600, color: LOGO_COLORS.teal, letterSpacing: "0.22em" }}>
            {`FIND YOUR PEOPLE · ${weekLabel(keys)}`}
          </span>
          <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
            <svg width="70" height="100" viewBox="0 0 70 100" style={{ marginRight: 22 }}>
              <polyline
                points="12,12 54,50 12,88"
                fill="none"
                stroke={LOGO_COLORS.teal}
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: 132, fontWeight: 800, color: INK, letterSpacing: "-0.04em", lineHeight: 1 }}>THIS WEEK</span>
            <div style={{ display: "flex", width: 92, height: 26, backgroundColor: LOGO_COLORS.pink, borderRadius: 4, marginLeft: 18, marginTop: 66 }} />
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: CARD_GAP, position: "absolute", top: LIST_TOP, left: PAD, right: PAD }}>
          {cards.length === 0 ? (
            <span style={{ fontSize: 40, fontWeight: 700, color: INK, lineHeight: 1.25 }}>
              A quiet week on the calendar. See what’s coming up at devsa.community/events
            </span>
          ) : (
            cards.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: s.pad,
                  borderRadius: 24,
                  backgroundColor: c.official ? DEVSA_BLUE : CARD,
                  border: `2px solid ${c.official ? DEVSA_BLUE : CARD_EDGE}`,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: s.num * 1.35, marginRight: 30 }}>
                  <span style={{ fontSize: s.day, fontWeight: 700, color: c.official ? "#d6d9ff" : MUTED, letterSpacing: "0.12em" }}>{c.dow}</span>
                  <span style={{ fontSize: s.num, fontWeight: 800, color: INK, lineHeight: 1, letterSpacing: "-0.04em", marginTop: 4 }}>{c.num}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: s.logo,
                    height: s.logo,
                    flexShrink: 0,
                    borderRadius: 18,
                    marginRight: 30,
                    backgroundColor: c.official ? "transparent" : "#1e1e1e",
                    // No logo: the gradient fills the tile, as on the site.
                    // (Satori rejects backgroundImage "none", so omit it.)
                    ...(c.logo || c.official
                      ? {}
                      : { backgroundImage: `linear-gradient(135deg, ${BRAND_GRADIENT_STOPS.join(", ")})` }),
                  }}
                >
                  {c.official ? (
                    <DevsaLogoMark size={Math.round(s.logo * 0.78)} alt />
                  ) : c.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo} alt="" style={{ maxWidth: s.logo * 0.72, maxHeight: s.logo * 0.72, objectFit: "contain" }} />
                  ) : null}
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: "Geist Mono",
                      fontSize: s.meta,
                      fontWeight: 600,
                      color: c.official ? INK : LOGO_COLORS.teal,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {oneLineMeta(c.meta, s)}
                  </span>
                  <span style={{ fontSize: s.title, fontWeight: 800, color: INK, lineHeight: 1.05, letterSpacing: "-0.03em", marginTop: 6 }}>
                    {c.title}
                  </span>
                  <span style={{ fontSize: s.host, fontWeight: 400, color: c.official ? "#d6d9ff" : MUTED, marginTop: 8 }}>{c.host}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Foot */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            position: "absolute",
            left: PAD,
            right: PAD,
            bottom: 46,
          }}
        >
          <span style={{ fontFamily: "Geist Mono", fontSize: 28, fontWeight: 500, color: "#d4d4d4", letterSpacing: "0.08em" }}>
            {more > 0 ? `+${more} more at devsa.community/events` : "devsa.community/events"}
          </span>
          <DevsaLogoMark size={72} />
        </div>

        {/* The three-colour rule along the bottom edge */}
        <div style={{ display: "flex", position: "absolute", left: 0, right: 0, bottom: 0, height: 14 }}>
          <div style={{ display: "flex", flex: 1, backgroundColor: LOGO_COLORS.teal }} />
          <div style={{ display: "flex", flex: 1, backgroundColor: LOGO_COLORS.pink }} />
          <div style={{ display: "flex", flex: 1, backgroundColor: LOGO_COLORS.orange }} />
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [...sans, ...mono],
      headers: {
        "Content-Disposition": `inline; filename="devsa-week-of-${keys[0]}.png"`,
        // The week fills in as groups post, so don't let a CDN keep the
        // first render for a year (ImageResponse's default).
        "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  )
}
