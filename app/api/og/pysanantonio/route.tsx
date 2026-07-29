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

  // Inlined from disk rather than fetched over HTTP: the card must render even
  // when the site's own origin is not reachable from the render (previews,
  // local builds), and satori cannot rasterise the SVG version.
  const wordmark = `data:image/png;base64,${(
    await readFile(path.join(process.cwd(), "public", PYSA_WORDMARK.pngDark))
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

        {/* Mascot, bled off the right edge */}
        <img
          src={PYSA_ASSETS.mascotDark}
          alt=""
          width={460}
          height={575}
          style={{
            position: "absolute",
            right: -40,
            bottom: 0,
            height: 600,
            width: 480,
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
        {/* Fade the mascot into the card so the type stays readable */}
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 560,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.75) 35%, rgba(10,10,10,0) 75%)",
          }}
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
                  ? "rgba(248,184,0,0.14)"
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
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 14 }}>
              <img
                src={wordmark}
                alt="PySanAntonio"
                width={560}
                height={130}
                style={{ width: 560, height: 130 }}
              />
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.03em",
                  paddingBottom: 6,
                }}
              >
                II
              </span>
            </div>
            <h2
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: PYSA_COLORS.blue,
                lineHeight: 1.2,
                margin: 0,
                marginBottom: 28,
                letterSpacing: "-0.01em",
              }}
            >
              {PYSA_2026.dateLabel}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ color: "#d4d4d4", fontSize: 24, fontWeight: 500 }}>
                {PYSA_2026.venue}, {PYSA_2026.venueDetail} · {PYSA_2026.timeLabel}
              </span>
              <span style={{ color: "#8a8a8a", fontSize: 20 }}>
                Part of SA Startup + Tech Week · {PYSA_2026.superEvent.label}
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
