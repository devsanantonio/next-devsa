import { ImageResponse } from "next/og"
import { OgCard, DEVSA } from "@/lib/og-card"
import { loadDisplayFonts } from "@/lib/og-fonts"
import { MODEL_LAVENDER, MODEL_INK } from "@/data/the-model/2026"

export const runtime = "nodejs"

/**
 * The Model.
 *
 * The one card that is not on the dark ground — lavender is the conference's
 * own color and the thing that makes it recognizable next to More Human.
 *
 * No date. A dated card is wrong the day after the event and stays wrong for
 * as long as anyone shares the link; the description is true whenever it is
 * read. That rule holds across all five conference cards.
 */
export async function GET() {
  const fonts = await loadDisplayFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["The Model"]}
        hook="Creatives, founders and builders in the same room for an afternoon, showing each other what they are actually making with AI."
        theme={{
          ...DEVSA,
          bg: MODEL_LAVENDER,
          ink: MODEL_INK,
          accent: MODEL_INK,
          muted: "rgba(17,17,17,0.74)",
          footMuted: "rgba(17,17,17,0.55)",
          logoBody: MODEL_INK,
        }}
        display
        footer="A DEVSA conference"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
