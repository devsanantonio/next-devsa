import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * About DEVSA.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["A Discord server in 2023.", "A 501(c)(3) in 2024."]}
        hook="Civic infrastructure for San Antonio&apos;s tech community: one calendar, one directory and a few rooms a year, governed by a volunteer board."
        footer="A 501(c)(3) nonprofit in San Antonio, Texas"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
