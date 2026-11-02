import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * localhost:210: the page's hook. Seven APIs and no one place to find them,
 * and localhost:210 as the bridge to every agency publishing them.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["Seven APIs.", "No one place to find them."]}
        hook="San Antonio's open data is spread across seven publishers. localhost:210 is the bridge to all of them: search all seven at once, and three small experiments to see what's in there."
        footer="localhost:210 · Build with San Antonio's open data"
        url="devsa.community/localhost"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
