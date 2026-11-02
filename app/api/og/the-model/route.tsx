import { ImageResponse } from "next/og"
import { OgCard, DEVSA } from "@/lib/og-card"
import { loadBrandFonts, loadBrandMonoFonts } from "@/lib/og-fonts"
import { MODEL_LAVENDER, MODEL_INK } from "@/data/the-model/2026"

export const runtime = "nodejs"

/**
 * The Model.
 *
 * White ground, and the conference's own wordmark: THE in Geist Mono, MODEL
 * caught in a lavender selection (components/brand/the-model.tsx). The card
 * used to be a lavender field with the name in Oswald, the Startup + Tech Week
 * display face, which is not how The Model writes its name anywhere else.
 * Lavender is now the one color on the card, where the brand spends it: the
 * selection.
 *
 * No date. A dated card is wrong the day after the event and stays wrong for
 * as long as anyone shares the link; the description is true whenever it is
 * read. That rule holds across all five conference cards.
 */
export async function GET() {
  const fonts = [...(await loadBrandFonts()), ...(await loadBrandMonoFonts())]
  return new ImageResponse(
    (
      <OgCard
        title={["The Model"]}
        wordmark={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: "Geist Mono",
              fontWeight: 500,
              fontSize: 104,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: MODEL_INK,
            }}
          >
            <span style={{ display: "flex" }}>THE</span>
            <span
              style={{
                display: "flex",
                marginLeft: 36,
                padding: "6px 14px",
                backgroundColor: MODEL_LAVENDER,
                color: MODEL_INK,
              }}
            >
              MODEL
            </span>
          </div>
        }
        hook="Creatives, founders and builders in the same room for an afternoon, showing each other what they are actually making with AI."
        theme={{
          ...DEVSA,
          bg: "#ffffff",
          ink: MODEL_INK,
          accent: MODEL_INK,
          muted: "rgba(9,9,11,0.72)",
          footMuted: "rgba(9,9,11,0.55)",
          logoBody: MODEL_INK,
        }}
        footer="A DEVSA conference"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
