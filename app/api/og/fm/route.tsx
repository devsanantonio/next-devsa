import { readFile } from "node:fs/promises"
import { ImageResponse } from "next/og"
import { loadBrandFonts, loadBrandMonoFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * DEVSA FM's share card: the stream itself, not a text card. The night bus (the page's hero, scene 01) fills
 * the top, cropped to where the bus rolls past Mission San José; under it the >FM mark on its own (no
 * "DEVSA" wordmark set beside it), the headline, and where to find it.
 *
 * Built by hand rather than with OgCard because the frame is the point: OgCard has no slot for a picture.
 * The files are read with one literal URL each so they're traced into the bundle (see the og-image skill).
 * If either can't be read, the card still renders, without it.
 */
const TEAL = "#00b2a9", PINK = "#ef426f", ORANGE = "#ff8200"

async function dataUri(url: URL, type: string) {
  try {
    return `data:${type};base64,${(await readFile(url)).toString("base64")}`
  } catch {
    return null
  }
}

export async function GET() {
  const [sans, mono, bus, mark] = await Promise.all([
    loadBrandFonts(),
    loadBrandMonoFonts(),
    dataUri(new URL("../../../../public/fm/night-bus.jpg", import.meta.url), "image/jpeg"),
    dataUri(new URL("../../../../public/branding/devsa-fm/devsa-fm-mark.svg", import.meta.url), "image/svg+xml"),
  ])

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#0a0a0a", fontFamily: "Geist Sans" }}>
        <div style={{ display: "flex", width: 1200, height: 420, position: "relative", overflow: "hidden" }}>
          {bus && (
            // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img only
            <img src={bus} alt="" width={1200} height={600} style={{ position: "absolute", left: 0, top: -150, width: 1200, height: 600 }} />
          )}
          {/* fade the frame into the card's ground */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, display: "flex", backgroundImage: "linear-gradient(to bottom, rgba(10,10,10,0), #0a0a0a)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 36, padding: "0 64px", flex: 1 }}>
          {mark && (
            // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img only
            <img src={mark} alt="" width={118} height={123} style={{ marginTop: -18 }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontSize: 54, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1 }}>
              A night in San Antonio, in ASCII.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[TEAL, PINK, ORANGE].map((c) => (
                  <div key={c} style={{ display: "flex", width: 30, height: 5, backgroundColor: c }} />
                ))}
              </div>
              <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.75)", letterSpacing: "0.04em" }}>
                DEVSA&apos;s lofi livestream · open source · devsa.community/fm
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: [...sans, ...mono] }
  )
}
