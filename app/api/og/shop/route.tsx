import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * The shop.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["Community threads.", "Wear the source."]}
        hook="Designed in San Antonio, printed on demand. Every order pays for the next conference, not a middleman."
        footer="Official DEVSA merch"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
