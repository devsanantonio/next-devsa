import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * The homepage card.
 *
 * The hook names the problem rather than the product. "Every tech community
 * group, on one calendar" describes a feature; missing the meetup you wanted
 * is what actually happens to people, and it is why the calendar exists.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["Find your people.", "Build your future."]}
        hook="Python, Linux, AI, security, game dev, design — every group&apos;s events in one place, so you stop hearing about them the week after."
        footer="A 501(c)(3) nonprofit in San Antonio, Texas"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
