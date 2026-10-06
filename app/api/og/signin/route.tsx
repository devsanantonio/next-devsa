import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * Organizer access.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["Publish to the", "city&apos;s calendar."]}
        hook="Put your group&apos;s events in front of every other group&apos;s members. Free, and you keep running your community your way."
        footer="Organizer access"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
