import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * DEVSA TV.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["DEVSA TV.", "The city on film."]}
        hook="Documentaries and community stories made with the people actually building here — not about them."
        footer="DEVSA TV"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
