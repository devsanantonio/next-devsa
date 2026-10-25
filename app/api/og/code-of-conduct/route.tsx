import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * The code of conduct.
 *
 * The page set Open Graph without an image, so a shared link to it unfurled
 * with no picture. It is linked from every page's footer and from the RSVP form,
 * so it gets shared, mostly in group chats deciding whether to come.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["One standard,", "in every room."]}
        // No "DEVSA" in the type: the mark already says it (see /branding).
        hook="What we expect, what isn't tolerated, how to report a problem, and what happens next, at every event, online space and activation."
        footer="Code of Conduct"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
