import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { BrandGradientBar, DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts } from "@/lib/og-fonts"
import {
  PYSA_2026,
  PYSA_ASSETS,
  PYSA_COLORS,
  PYSA_WORDMARK,
  getCfsPhase,
} from "@/data/pysa/2026"

export const runtime = "nodejs"

export async function GET() {
  const fonts = await loadBrandFonts()
  const isOpen = getCfsPhase() === "open"

  // The traced SVG, so the wordmark stays vector-crisp at any card scale.
  // Inlined from disk rather than fetched over HTTP: the card must render even
  // when the site's own origin is unreachable from the render (previews, local
  // builds).
  const wordmark = `data:image/svg+xml;base64,${(
    await readFile(path.join(process.cwd(), "public", PYSA_WORDMARK.svgDark))
  ).toString("base64")}`

  // Standing cut-out for the corner. A PNG, not the .webp sticker: satori
  // decodes PNG, JPEG and SVG but NOT WebP — a WebP fails the whole render
  // with "u2 is not iterable".
  const mascot = `data:image/png;base64,${(
    await readFile(path.join(process.cwd(), "public", PYSA_ASSETS.mascotOgFigure))
  ).toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PYSA_COLORS.ink,
          fontFamily: "Geist Sans",
          position: "relative",
        }}
      >
        <BrandGradientBar direction="ltr" />

        {/* Mascot in the lower-right corner — a supporting note, not the
            subject. Held clear of the footer rule and well right of the copy's
            720px column, so nothing overlaps. */}
        <img
          src={mascot}
          alt=""
          width={140}
          height={300}
          style={{ position: "absolute", right: 64, bottom: 96, width: 140, height: 300 }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "44px 64px",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 40,
            }}
          >
            <DevsaLogoMark size={40} bodyColor="#1c1c1c" />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: isOpen
                  ? "rgba(255,221,0,0.14)"
                  : "rgba(255,255,255,0.08)",
                border: `2px solid ${isOpen ? PYSA_COLORS.yellow : "rgba(255,255,255,0.25)"}`,
                borderRadius: 24,
                padding: "8px 22px",
              }}
            >
              <span
                style={{
                  color: isOpen ? PYSA_COLORS.yellow : "rgba(255,255,255,0.75)",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {isOpen ? "Call for speakers open" : "Python conference"}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              maxWidth: 720,
            }}
          >
            {/* The wordmark alone, no "II" alongside it — set in Geist the two
                strokes read as a pause icon rather than a numeral. The edition
                is carried by the line below and by the mascot's two fingers. */}
            <img
              src={wordmark}
              alt="PySanAntonio"
              width={800}
              height={188}
              style={{ width: 800, height: 188, marginBottom: 4 }}
            />
            {/* The page's actual hook. Weight 400 rather than italic: only
                upright Geist faces are bundled, and satori does not synthesise
                a slant, so asking for italic would silently do nothing. */}
            <h2
              style={{
                fontSize: 46,
                fontWeight: 400,
                color: PYSA_COLORS.blue,
                lineHeight: 1.2,
                margin: 0,
                marginBottom: 26,
                letterSpacing: "-0.01em",
              }}
            >
              returns October 2026
            </h2>

            {/* The date leads this stack now that the headline carries the hook
                instead — it is the one fact a share card cannot drop. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ color: "#ffffff", fontSize: 26, fontWeight: 700 }}>
                {PYSA_2026.dateLabel} · {PYSA_2026.timeLabel}
              </span>
              <span style={{ color: "#a3a3a3", fontSize: 20, fontWeight: 500 }}>
                {PYSA_2026.venue}, {PYSA_2026.venueDetail} · Part of SA Startup + Tech Week
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: 24,
              borderTop: "1px solid #262626",
            }}
          >
            <span style={{ color: "#8a8a8a", fontSize: 18, fontWeight: 500 }}>
              Alamo Python · PyTexas Foundation · DEVSA
            </span>
            <span style={{ color: PYSA_COLORS.yellow, fontSize: 18, fontWeight: 600 }}>
              devsa.community
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  )
}
