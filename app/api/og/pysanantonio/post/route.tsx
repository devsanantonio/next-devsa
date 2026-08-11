import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts } from "@/lib/og-fonts"
import {
  PYSA_2026,
  PYSA_ASSETS,
  PYSA_COLORS,
  PYSA_WORDMARK,
  getCfsPhase,
} from "@/data/pysa/2026"

export const runtime = "nodejs"

/**
 * PySanAntonio II as a 1080x1350 portrait card — Instagram's 4:5 feed post.
 *
 * The counterpart to app/api/og/access-granted/post, and built on the same
 * plan: header, the event's own lockup, the art as the subject, facts in the
 * footer. Where Access Granted stacks a mono wordmark it sets live, this one
 * uses the traced Amador lockup, because Amador is Adobe-Fonts-only and cannot
 * be set as type at all — the SVG IS the wordmark.
 *
 * The art is the poster frame from the mascot clip: the beat where he holds up
 * two fingers, which is the whole point of a second edition. Used full-frame
 * rather than cropped to portrait — his raised hand is left of centre and the
 * guitar runs off to the right, so any portrait crop loses one or the other.
 * Its edges are feathered to transparent in the asset itself (see
 * PYSA_ASSETS.mascotOgPoster), so a landscape block sits in the column without
 * reading as a pasted-in rectangle.
 *
 * Deliberately NOT wired into any page's metadata — nothing crawls a 4:5
 * image. This exists to be downloaded and posted by hand, and lives as a route
 * so it can be regenerated when the call's phase changes.
 *
 * No BrandGradientBar: that rule is a web-page convention and reads as a
 * browser artifact inside a feed.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  const isOpen = getCfsPhase() === "open"

  // Both inlined from disk rather than fetched over HTTP, so the card renders
  // even when the site's own origin is unreachable (previews, local builds).
  const wordmark = `data:image/svg+xml;base64,${(
    await readFile(path.join(process.cwd(), "public", PYSA_WORDMARK.svgDark))
  ).toString("base64")}`

  const poster = `data:image/png;base64,${(
    await readFile(path.join(process.cwd(), "public", PYSA_ASSETS.mascotOgPoster))
  ).toString("base64")}`

  // 936 is the content width (1080 less two 72px gutters). Both pieces of art
  // are sized from it and keep their own ratios.
  const CONTENT_W = 936
  const MARK_W = 720
  const MARK_H = Math.round((MARK_W * PYSA_WORDMARK.height) / PYSA_WORDMARK.width)
  const ART_W = CONTENT_W
  const ART_H = Math.round(
    (ART_W * PYSA_ASSETS.mascotOgPosterHeight) / PYSA_ASSETS.mascotOgPosterWidth
  )

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
        {/* The blue wash the page carries behind the mascot, echoing the
            guitar. A radial gradient rather than a blurred div — satori has no
            `filter: blur()`, so a blurred element renders hard-edged. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 420,
            width: 1080,
            height: 700,
            display: "flex",
            background: `radial-gradient(circle at 50% 50%, rgba(74,144,217,0.20) 0%, rgba(74,144,217,0) 68%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "72px 72px 64px 72px",
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
              marginBottom: 44,
            }}
          >
            <DevsaLogoMark size={52} bodyColor="#1c1c1c" />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: isOpen ? "rgba(255,221,0,0.14)" : "rgba(255,255,255,0.08)",
                border: `2px solid ${isOpen ? PYSA_COLORS.yellow : "rgba(255,255,255,0.25)"}`,
                borderRadius: 28,
                padding: "10px 24px",
              }}
            >
              <span
                style={{
                  color: isOpen ? PYSA_COLORS.yellow : "rgba(255,255,255,0.75)",
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                {isOpen ? "CALL FOR SPEAKERS OPEN" : "PYTHON CONFERENCE"}
              </span>
            </div>
          </div>

          {/* The lockup, then the hook. No "II" set beside it — in Geist the
              two strokes read as a pause icon rather than a numeral, so the
              edition is carried by the line below and by the two fingers in
              the art. */}
          <img
            src={wordmark}
            alt="PySanAntonio"
            width={MARK_W}
            height={MARK_H}
            style={{ width: MARK_W, height: MARK_H, marginBottom: 6 }}
          />
          {/* Weight 400 rather than italic: only upright Geist faces are
              bundled and satori does not synthesise a slant. */}
          <span
            style={{
              fontSize: 46,
              fontWeight: 400,
              color: PYSA_COLORS.blue,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            returns October 2026
          </span>

          {/* The art, centred, taking every pixel between the copy and the
              footer. It is the subject of the card, so it gets the slack. */}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <img src={poster} alt="" width={ART_W} height={ART_H} style={{ width: ART_W, height: ART_H }} />
          </div>

          {/* Footer — the date leads, as on the Access Granted post card. A
              burnt-in URL is not tappable on Instagram; the date is the fact
              that has to survive the image being reshared without a caption. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
              paddingTop: 22,
              borderTop: "1px solid #262626",
            }}
          >
            <span style={{ color: "#ffffff", fontSize: 25, fontWeight: 700 }}>
              {PYSA_2026.dateLabel} · {PYSA_2026.timeLabel}
            </span>
            <span style={{ color: "#d4d4d4", fontSize: 20, fontWeight: 500 }}>
              {PYSA_2026.venue}, {PYSA_2026.venueDetail} · Part of SA Startup + Tech Week
            </span>
            <span style={{ color: "#8a8a8a", fontSize: 17, fontWeight: 500 }}>
              Alamo Python · PyTexas Foundation · DEVSA
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts }
  )
}
