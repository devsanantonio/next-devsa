import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * The homepage card.
 *
 * The hook is the hero's own line: DEVSA as the bridge between the city's
 * builders, tech groups and partners, then what that bridge is made of, in
 * the words of the homepage's "Built to Serve" section. It used to pitch the
 * calendar alone ("every group's events in one place, so you stop hearing
 * about them the week after"), which is now the /events card's job, and it
 * described DEVSA as a feature rather than as what the site says it is.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["Find your people.", "Build your future."]}
        hook="DEVSA is the bridge between San Antonio’s builders, tech groups and partners: one shared calendar and one public directory, open to every grassroots group in the city."
        footer="A 501(c)(3) nonprofit in San Antonio, Texas"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
