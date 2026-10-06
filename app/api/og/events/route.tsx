import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * The community calendar.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["One calendar.", "Every group."]}
        hook="Subscribe once and the whole city&apos;s tech meetups land in your calendar — no more checking six Meetup pages to find your week."
        footer="The DEVSA community calendar"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
