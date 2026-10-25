import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * The branding kit.
 *
 * It shared the homepage's card, so a link to the kit unfurled as the community
 * calendar. The people who open this page want files and rules, and the card
 * says that is what's here.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        /* No "DEVSA" in the type: the mark above already says it, and the logo
           rules this page publishes forbid setting the word beside it. */
        title={["The logo, the colors,", "and how to use them."]}
        hook="Logos, colors, type and voice, plus the wordmarks for PySanAntonio, More Human Than Human, Access Granted and The Model."
        footer="For press, partners and community use"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
