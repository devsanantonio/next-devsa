import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { LOGO_COLORS } from "@/lib/og-brand"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * DEVSA TV's share card: the announcement as /tv makes it.
 *
 * Built by hand rather than with OgCard, because the card has to carry the
 * DEVSA TV clapperboard mark (OgCard sets the DEVSA mark) and TVSA's logo. The
 * mark sits on #161616, not the usual #0a0a0a, because its near-black body
 * disappears on pure black; and it never has a "DEVSA TV" wordmark beside it.
 * TVSA's logo is the dark-ground version in public/tv/ (white card removed).
 */
export async function GET() {
  const [fonts, tvsa] = await Promise.all([
    loadBrandFonts(),
    readFile(path.join(process.cwd(), "public", "tv", "tvsa-dark.png")),
  ])
  const tvsaSrc = `data:image/png;base64,${tvsa.toString("base64")}`
  const muted = "#a1a1aa"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#161616",
          fontFamily: "Geist Sans",
          padding: "56px 64px 44px",
        }}
      >
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 10 }}>
          <div style={{ display: "flex", flex: 1, backgroundColor: LOGO_COLORS.teal }} />
          <div style={{ display: "flex", flex: 1, backgroundColor: LOGO_COLORS.pink }} />
          <div style={{ display: "flex", flex: 1, backgroundColor: LOGO_COLORS.orange }} />
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 700 }}>
            <span style={{ fontSize: 20, fontWeight: 500, color: muted, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Coming this December
            </span>
            <span style={{ marginTop: 18, fontSize: 76, fontWeight: 800, color: "#ffffff", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
              DEVSA is coming
            </span>
            <span style={{ fontSize: 76, fontWeight: 800, color: LOGO_COLORS.pink, lineHeight: 1.02, letterSpacing: "-0.03em" }}>
              to your TV.
            </span>
            <span style={{ marginTop: 26, fontSize: 28, fontWeight: 700, color: "#ffffff" }}>
              From the meetup room to your living room.
            </span>
            <div style={{ display: "flex", alignItems: "center", marginTop: 26, gap: 16 }}>
              <span style={{ fontSize: 24, fontWeight: 500, color: muted }}>On</span>
              <img src={tvsaSrc} height={62} width={Math.round((62 * 845) / 365)} alt="TVSA" />
              <span style={{ fontSize: 24, fontWeight: 500, color: muted }}>Spectrum 20 · Grande 19 · AT&T 99</span>
            </div>
          </div>

          {/* The DEVSA TV mark, clapper open. */}
          <svg width="330" height="356" viewBox="-24.7 -267 764.4 823.4">
            <g transform="rotate(-13 0 -8)">
              <g transform="translate(0 -99.9)">
                <rect x="0" y="0" width="735.7" height="91.9" rx="14" fill="#2b2b2b" />
                <path fill={LOGO_COLORS.teal} d="M196,0 h150 l-46,91.9 h-150 Z" />
                <path fill={LOGO_COLORS.pink} d="M358,0 h150 l-46,91.9 h-150 Z" />
                <path fill={LOGO_COLORS.orange} d="M520,0 h150 l-46,91.9 h-150 Z" />
              </g>
            </g>
            <rect x="0" y="0" width="735.7" height="91.9" rx="14" fill="#2b2b2b" />
            <path fill={LOGO_COLORS.teal} d="M196,0 h150 l-46,91.9 h-150 Z" />
            <path fill={LOGO_COLORS.pink} d="M358,0 h150 l-46,91.9 h-150 Z" />
            <path fill={LOGO_COLORS.orange} d="M520,0 h150 l-46,91.9 h-150 Z" />
            <rect x="0" y="0" width="136" height="91.9" rx="14" fill="#0a0a0a" />
            <circle cx="38" cy="26" r="11" fill="#eeeeee" />
            <circle cx="38" cy="66" r="11" fill="#eeeeee" />
            <circle cx="98" cy="66" r="11" fill="#eeeeee" />
            <path d="M0,107.9h735.7v413.8c0,16.8-13.8,30.7-30.7,30.7H30.6c-16.9,0-30.6-13.8-30.6-30.7V107.9Z" fill="#0a0a0a" />
            <path
              d="M193.1,320.9l-95,95c-7.7,7.7-7.7,18.4,0,24.5l27.6,27.6c7.7,7.7,18.4,7.7,24.5,0l134.9-134.9c6.8-5.6,7.7-15.7,2.1-22.4-.6-.8-1.3-1.5-2.1-2.1l-134.9-134.9c-6.1-6.1-18.4-6.1-24.5,0l-27.6,27.6c-7.7,6.1-7.7,16.9,0,24.5l95,95h0Z"
              fill="#eeeeee"
            />
            <path
              d="M352.5,460.4c0,9.2,6.1,15.3,15.3,15.3h245.2c9.2,0,15.3-6.1,15.3-15.3v-46c0-9.2-6.1-15.3-15.3-15.3h-245.3c-9.2,0-15.3,6.1-15.3,15.3v46h0Z"
              fill="#eeeeee"
            />
            <path
              fill="#eeeeee"
              transform="translate(348.7 370.8)"
              d="M44.47 0V-113.33H2.05V-145.5H127.26V-113.33H84.84V0Z M181.36 0 128.9 -145.5H169.89L204.31 -45.49L238.74 -145.5H279.73L226.86 0Z"
            />
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: "#71717a" }}>Air dates and times coming soon</span>
          <span style={{ fontSize: 17, fontWeight: 400, color: "#71717a" }}>devsa.community/tv</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  )
}
