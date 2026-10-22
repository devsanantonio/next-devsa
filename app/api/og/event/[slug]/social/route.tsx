import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { loadBrandFonts } from "@/lib/og-fonts"
import { DevsaLogoMark } from "@/lib/og-brand"
import { getEventBySlug, eventWhenParts, eventHosts } from "@/lib/og-event"

export const runtime = "nodejs"

const W = 1080
const H = 1350
const INK = "#ffffff"
const MUTED = "#a3a3a3"
const PINK_RGB = "rgb(239, 66, 111)"

const rgba = (rgb: string, a: number) => rgb.replace("rgb(", "rgba(").replace(")", `, ${a})`)

/**
 * The event as a 1080x1350 image (Instagram's 4:5 feed size, uncropped on
 * LinkedIn and Facebook) for people to post or text, from the Image menu on
 * the event page and the Share button on the calendar cards. The link card at
 * /api/og/event/[slug] is the preview a pasted URL gets; this is the file
 * someone sends.
 *
 * The host's logo is the hero: large and centred on black, lit by a glow in
 * the logo's own colour, so every group's card reads as that group's. That is
 * how DEVSA describes its part on the homepage, Building Together and About:
 * the groups run their events, DEVSA is the shared calendar they publish to.
 * So DEVSA is only the alt mark and the address at the foot. Its own events
 * put the full mark in the hero instead, lit pink.
 *
 * Two other looks were rendered against this one and dropped: a headline in
 * the site's two-tone type over a JSON terminal, and a card that was all
 * terminal. Both put DEVSA's idiom first and the group second.
 *
 * No QR code. On a phone feed the viewer is holding the camera that would
 * have to scan it; Share sends the event link with the image instead, and
 * the address here is short enough to type.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [event, fonts] = await Promise.all([getEventBySlug(slug), loadBrandFonts()])
  // No poster for an event that is not published: see getEventBySlug.
  if (!event.found) return new Response("Event not found", { status: 404 })
  const { date, time } = eventWhenParts(event)
  const { shown, logos, names, color } = await eventHosts(event)
  const withLogo = shown.map((h, i) => ({ name: h.name, logo: logos[i] })).filter((h) => h.logo)
  const coHosts = event.official && event.hosts.length ? event.hosts.map((h) => h.name).join(" + ") : null

  // A black-and-white logo has no colour of its own, so it takes DEVSA pink.
  const glow = color ?? PINK_RGB
  /* Box per logo, wide enough for a wordmark and tall enough for a square mark.
     A single logo was capped at 400px square, so a wide wordmark like DEF CON
     Group's drew 400 by about 190 inside a hero roughly 940 by 700, which left
     it looking small on a card that is about the group. objectFit keeps every
     logo inside its box at its own shape: wide ones use the width, square ones
     the height. */
  const box =
    withLogo.length >= 3
      ? { w: 280, h: 240 }
      : withLogo.length === 2
        ? { w: 420, h: 320 }
        : { w: 760, h: 440 }
  const len = event.title.length
  const titleSize = len <= 20 ? 96 : len <= 36 ? 84 : len <= 56 ? 70 : 58
  const eyebrow = !event.official ? `Hosted by ${names}` : coHosts ? `With ${coHosts}` : null

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          backgroundImage: `radial-gradient(circle at 50% 30%, ${rgba(glow, 0.42)} 0%, ${rgba(glow, 0.12)} 34%, rgba(0,0,0,0) 62%)`,
          fontFamily: "Geist Sans",
          padding: "72px 72px 72px",
        }}
      >
        {/* The hero: the hosts' logos, or DEVSA's mark on its own events */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 64 }}>
          {event.official ? (
            <DevsaLogoMark size={300} />
          ) : withLogo.length ? (
            withLogo.map((h) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={h.name} src={h.logo!} alt="" style={{ maxWidth: box.w, maxHeight: box.h, objectFit: "contain" }} />
            ))
          ) : (
            <span style={{ fontSize: 72, fontWeight: 800, color: INK, letterSpacing: "-0.02em", textAlign: "center" }}>{names}</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 72 }}>
          {eyebrow ? (
            <span style={{ fontSize: 22, fontWeight: 500, color: MUTED, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {eyebrow}
            </span>
          ) : null}
          <span
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              color: INK,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginTop: 22,
              // No lone last word.
              textWrap: "balance",
            }}
          >
            {event.title}
          </span>
          <span style={{ fontSize: 34, fontWeight: 700, color: INK, marginTop: 36 }}>
            {[date || "Date to be announced", time].filter(Boolean).join(" · ")}
          </span>
          <span style={{ fontSize: 28, fontWeight: 400, color: MUTED, marginTop: 12, lineHeight: 1.3, maxWidth: 860 }}>
            {event.location || "San Antonio, TX"}
          </span>
        </div>

        {/* The sign-off: DEVSA's alt mark and where to find the calendar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {event.official ? <span /> : <DevsaLogoMark size={46} alt />}
          <span style={{ fontSize: 28, fontWeight: 500, color: MUTED }}>
            {event.unlisted ? "Private event" : "devsa.community/events"}
          </span>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts,
      headers: {
        // Named for the event, so a download is not "social.png".
        "Content-Disposition": `inline; filename="${slug}.png"`,
      },
    }
  )
}
