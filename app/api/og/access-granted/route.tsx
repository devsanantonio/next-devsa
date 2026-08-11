import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { BrandGradientBar, DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts, loadBrandMonoFonts } from "@/lib/og-fonts"
import { accessGrantedGridSvg } from "@/lib/og-access-granted"
import {
  ACCESS_AMBER,
  ACCESS_GRANTED,
  ACCESS_GREEN,
  AG_LOCK,
  AG_ONE_LINER,
  getAgCfsPhase,
} from "@/data/access-granted/2026"

export const runtime = "nodejs"

export async function GET() {
  // Both families. Geist Sans carries the name, the one-liner and the date
  // rail; Geist Mono is kept for the status pill, which reads as data rather
  // than as type — the same split the page makes, where the `>_` prompts and
  // the meta rail are mono and the h1 is not.
  const [sans, mono] = await Promise.all([loadBrandFonts(), loadBrandMonoFonts()])
  const fonts = [...sans, ...mono]

  const isOpen = getAgCfsPhase() === "open"

  // Inlined from disk rather than fetched over HTTP, so the card renders even
  // when the site's own origin is unreachable (previews, local builds).
  // A PNG, which satori decodes — it does NOT decode WebP.
  const lock = `data:image/png;base64,${(
    await readFile(path.join(process.cwd(), "public", AG_LOCK.src))
  ).toString("base64")}`

  // The field behind the lock. Shared with the Instagram card — see the
  // helper for why this is an SVG rather than the page's tiled gradients.
  const GRID_W = 660
  const GRID_H = 560
  const grid = accessGrantedGridSvg(GRID_W, GRID_H)

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          fontFamily: "Geist Sans",
          position: "relative",
        }}
      >
        <BrandGradientBar direction="ltr" />

        {/* Behind the lock, and before it in source order so it stays there —
            the copy column above carries zIndex 1 and sits over both. Its
            right edge is the card's, and it reaches 660px left, past the art
            and under the headline. */}
        <img
          src={grid}
          alt=""
          width={GRID_W}
          height={GRID_H}
          style={{ position: "absolute", left: 540, top: 35, width: GRID_W, height: GRID_H }}
        />

        {/* The padlock, bled off the right. Held clear of the 660px copy
            column so nothing overlaps. */}
        <img
          src={lock}
          alt=""
          width={260}
          height={402}
          style={{ position: "absolute", right: 56, top: 114, width: 260, height: 402 }}
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
                backgroundColor: isOpen ? "rgba(0,255,102,0.14)" : "rgba(255,255,255,0.08)",
                border: `2px solid ${isOpen ? ACCESS_GREEN : "rgba(255,255,255,0.25)"}`,
                borderRadius: 24,
                padding: "8px 22px",
              }}
            >
              <span
                style={{
                  color: isOpen ? ACCESS_GREEN : "rgba(255,255,255,0.75)",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "Geist Mono",
                }}
              >
                {isOpen ? "CALL FOR SPEAKERS OPEN" : "SECURITY & HACKER TRACK"}
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
              // 64px padding + 690 ends at 754, which still clears the
              // padlock's left edge at 884. Widened from 660 to buy the
              // one-liner's first sentence enough room to hold one line.
              maxWidth: 690,
            }}
          >
            {/* Geist Sans black, matching the page's h1 — there is no raster
                lockup for this event, so the name is live type on both.
                Weight 800 is the heaviest face bundled by loadBrandFonts;
                anything above it would silently fall back. */}
            {/* `flexShrink: 0` is what actually holds this line apart.
                ACCESS + GRANTED at this size is wider than the 660px copy
                column, so the row overflowed and flex shrank every child to
                fit — which silently ate the gap, whether it was expressed as
                the container's `gap`, a margin, a padding, or the spacer div
                below. None of them were being ignored; all of them were being
                squeezed to zero. Pinned against shrink, the spacer holds. */}
            <div style={{ display: "flex", flexShrink: 0, marginBottom: 24 }}>
              <span
                style={{
                  display: "flex",
                  flexShrink: 0,
                  fontFamily: "Geist Sans",
                  fontSize: 82,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: ACCESS_GREEN,
                }}
              >
                ACCESS
              </span>
              <div style={{ display: "flex", flexShrink: 0, width: 26, height: 4 }} />
              <span
                style={{
                  display: "flex",
                  flexShrink: 0,
                  fontFamily: "Geist Sans",
                  fontSize: 82,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                }}
              >
                GRANTED
              </span>
            </div>

            {/* The setup and the punch on their own lines, as two block spans
                in a column.

                They were one <p> with the turn as an inline <span>. Satori does
                not apply CSS defaults, so a <p> with no explicit `display` did
                not lay out as a block: it ignored the column's max width and
                the turn wrapped into a narrow strip down the right, straight
                over the padlock. Stacking them sidesteps inline wrapping
                entirely, and it matches how the brand sets this line anyway.

                Weight 400 rather than italic: only upright Geist faces are
                bundled and satori does not synthesise a slant. */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginBottom: 30,
                // The hero's treatment: a green rule down the left rather than
                // a filled panel, which at this size would shout. `borderLeft`
                // on the flex CONTAINER, not on the spans — satori drops box
                // properties on text nodes, which is the same thing that ate
                // the wordmark's gap.
                borderLeft: `3px solid ${ACCESS_GREEN}`,
                paddingLeft: 22,
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 400, color: "#d4d4d4", lineHeight: 1.35 }}>
                {AG_ONE_LINER.setup}
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", lineHeight: 1.35 }}>
                {AG_ONE_LINER.turn}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ color: "#ffffff", fontSize: 26, fontWeight: 700 }}>
                {ACCESS_GRANTED.dateLabel} · {ACCESS_GRANTED.timeLabel}
              </span>
              <span style={{ color: "#a3a3a3", fontSize: 20, fontWeight: 500 }}>
                {ACCESS_GRANTED.venue}, {ACCESS_GRANTED.venueDetail} · Part of SA Startup + Tech Week
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
              BSides SATX · DCG-SATX · SAHA · UTSA CyberJedis · Alamo City Locksport · DEVSA
            </span>
            <span style={{ color: ACCESS_AMBER, fontSize: 18, fontWeight: 600 }}>
              devsa.community
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  )
}
