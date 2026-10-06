import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * The coworking room, which closed in September 2026.
 *
 * This card was the last thing still selling it, in the present tense, with a
 * street address, under a badge that said "Closed September 2026". A share of
 * that link invited someone to an address they cannot walk into.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["The room at", "Geekdom."]}
        hook="For two years DEVSA kept a space open to anyone building, staffed by volunteers. It closed in September 2026. This page is the thank-you."
        footer="A record, not an invitation"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
