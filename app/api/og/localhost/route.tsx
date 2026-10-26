import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/** localhost:210: San Antonio's open data, from the County, the City and VIA. */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["San Antonio", "has an API."]}
        hook="Follow the water through three centuries of downtown, watch the City permit what's being built, and race a real VIA bus up San Pedro."
        footer="localhost:210 · Build with San Antonio's open data"
        url="devsa.community/localhost"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
