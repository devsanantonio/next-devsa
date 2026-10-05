import { ImageResponse } from "next/og"
import { DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts } from "@/lib/og-fonts"
import { THE_MODEL, MODEL_LAVENDER, MODEL_INK } from "@/data/the-model/2026"

export const runtime = "nodejs"

/**
 * The Model's share card.
 *
 * It was the one conference of the four without one. Access Granted,
 * PySanAntonio and More Human Than Human each have a route here; this page's
 * openGraph block had no `images` at all, so every share of /events/the-model
 * fell back to the root card — a conference URL going out as the homepage,
 * reading "Find your people. Build your future."
 *
 * Set on the lavender rather than on white, which is what the other three do
 * with their own colors: the card should be recognizable as this brand before
 * the title is read. MODEL_LAVENDER and MODEL_INK come from data/the-model so
 * the card cannot drift from the page it represents.
 *
 * The tagline is the page's own, not a second one written for the card. Two
 * descriptions of one conference is how they end up disagreeing.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: MODEL_LAVENDER,
          fontFamily: "Geist Sans",
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <DevsaLogoMark size={40} />
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: MODEL_INK,
              opacity: 0.6,
            }}
          >
            A DEVSA Conference
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 128,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              color: MODEL_INK,
            }}
          >
            {THE_MODEL.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 900,
              fontSize: 34,
              fontWeight: 400,
              lineHeight: 1.3,
              color: MODEL_INK,
              opacity: 0.78,
            }}
          >
            {THE_MODEL.tagline.setup} {THE_MODEL.tagline.turn}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 500,
            color: MODEL_INK,
            opacity: 0.6,
          }}
        >
          devsa.community/events/the-model
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  )
}
