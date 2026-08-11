import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts, loadBrandMonoFonts } from "@/lib/og-fonts"
import { accessGrantedGridSvg } from "@/lib/og-access-granted"
import {
  ACCESS_GRANTED,
  ACCESS_GREEN,
  AG_LOCK,
  AG_ONE_LINER,
  getAgCfsPhase,
} from "@/data/access-granted/2026"

export const runtime = "nodejs"

/**
 * Access Granted as a 1080x1350 portrait card — Instagram's 4:5 feed post,
 * the tallest crop the grid will show without cropping it to square.
 *
 * A recomposition of the 1200x630 share card, not a rescale. The landscape
 * card sets the copy beside the art; at 4:5 there is no room for two columns,
 * so everything stacks and the padlock becomes the centre of the frame rather
 * than a note at the edge. The wordmark stacks with it — ACCESS over GRANTED —
 * which at this width reads stronger than one long line and sidesteps the
 * shrink-to-fit problem that eats the gap on the landscape card.
 *
 * The date, time and venue sit in the footer as two compact lines rather than
 * the tall rail this card originally had — enough that the image still works
 * if it is reshared without its caption, without taking the frame back from
 * the art.
 *
 * Deliberately NOT wired into any page's metadata. Nothing crawls a 4:5 image;
 * this exists to be downloaded and posted by hand. The route is here rather
 * than a one-off script so it can be regenerated whenever the call's phase or
 * the organiser list changes.
 *
 * No BrandGradientBar: that rule is a web-page convention and reads as a
 * browser artifact inside a feed.
 */
export async function GET() {
  const [sans, mono] = await Promise.all([loadBrandFonts(), loadBrandMonoFonts()])
  const fonts = [...sans, ...mono]

  const isOpen = getAgCfsPhase() === "open"

  const lock = `data:image/png;base64,${(
    await readFile(path.join(process.cwd(), "public", AG_LOCK.src))
  ).toString("base64")}`

  // Centred rather than pushed right (focusX 50%), because the art is centred
  // here instead of bled off one edge.
  const GRID_W = 1000
  const GRID_H = 900
  const grid = accessGrantedGridSvg(GRID_W, GRID_H, "50%")

  // 907:1400 is the render's own ratio — carried through so the lock is never
  // squashed by a rounded height.
  const LOCK_W = 405
  const LOCK_H = Math.round((LOCK_W * AG_LOCK.height) / AG_LOCK.width)

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
        {/* Behind everything, centred on where the lock lands in the flow. */}
        <img
          src={grid}
          alt=""
          width={GRID_W}
          height={GRID_H}
          style={{ position: "absolute", left: 40, top: 417, width: GRID_W, height: GRID_H }}
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
              marginBottom: 46,
            }}
          >
            <DevsaLogoMark size={52} bodyColor="#1c1c1c" />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: isOpen ? "rgba(0,255,102,0.14)" : "rgba(255,255,255,0.08)",
                border: `2px solid ${isOpen ? ACCESS_GREEN : "rgba(255,255,255,0.25)"}`,
                borderRadius: 28,
                padding: "10px 24px",
              }}
            >
              <span
                style={{
                  color: isOpen ? ACCESS_GREEN : "rgba(255,255,255,0.75)",
                  fontSize: 17,
                  fontWeight: 600,
                  fontFamily: "Geist Mono",
                }}
              >
                {isOpen ? "CALL FOR SPEAKERS OPEN" : "SECURITY & HACKER TRACK"}
              </span>
            </div>
          </div>

          {/* Wordmark, stacked. Two rows means no horizontal gap to hold, so
              none of the landscape card's shrink-to-fit trouble applies. */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 30 }}>
            <span
              style={{
                display: "flex",
                fontSize: 118,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: ACCESS_GREEN,
              }}
            >
              ACCESS
            </span>
            <span
              style={{
                display: "flex",
                fontSize: 118,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: "#ffffff",
              }}
            >
              GRANTED
            </span>
          </div>

          {/* The one-liner, under the page's green rule. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              borderLeft: `4px solid ${ACCESS_GREEN}`,
              paddingLeft: 26,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 27, fontWeight: 400, color: "#d4d4d4", lineHeight: 1.35 }}>
              {AG_ONE_LINER.setup}
            </span>
            <span style={{ fontSize: 27, fontWeight: 700, color: "#ffffff", lineHeight: 1.35 }}>
              {AG_ONE_LINER.turn}
            </span>
          </div>

          {/* The lock, centred, taking every pixel between the copy and the
              footer via `flex: 1`. It is the subject of this card rather than a
              note at its edge, so it gets the slack rather than the margins
              absorbing it. */}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <img src={lock} alt="" width={LOCK_W} height={LOCK_H} style={{ width: LOCK_W, height: LOCK_H }} />
          </div>

          {/* Footer */}
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
            {/* The date leads the footer, and the URL is gone.
                On Instagram a burnt-in URL is not tappable — it only works as
                something to memorise — while the date is the one fact that has
                to survive the image being screenshotted or reshared without
                its caption. The landscape card makes the opposite trade,
                correctly: there the preview IS the link.

                One compact line each, not the three-line rail this replaced,
                so the lock keeps the space it was given. */}
            <span style={{ color: "#ffffff", fontSize: 25, fontWeight: 700 }}>
              {ACCESS_GRANTED.dateLabel} · {ACCESS_GRANTED.timeLabel}
            </span>
            <span style={{ color: "#d4d4d4", fontSize: 20, fontWeight: 500 }}>
              {ACCESS_GRANTED.venue}, {ACCESS_GRANTED.venueDetail} · Part of SA Startup + Tech Week
            </span>
            <span style={{ color: "#8a8a8a", fontSize: 17, fontWeight: 500 }}>
              BSides SATX · DCG-SATX · SAHA · UTSA CyberJedis · Alamo City Locksport · DEVSA
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts }
  )
}
