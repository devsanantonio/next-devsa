import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"
import { listCommunities } from "@/lib/communities"

export const runtime = "nodejs"

/**
 * The community calendar.
 *
 * Says what the page's hero says, in the same order: "Every group. One
 * calendar." It had them reversed, and a hook about "checking six Meetup
 * pages" from before the site described the calendar as the place the groups
 * publish to themselves. That is the claim now, with the count read from
 * Firestore as the page reads it (a hardcoded number is how earlier cards
 * came to publish stale ones), and subscribing as the thing to do.
 */
export async function GET() {
  const [fonts, count] = await Promise.all([
    loadBrandFonts(),
    listCommunities()
      .then((c) => c.length)
      .catch(() => 0),
  ])
  const who = count ? `All ${count} of San Antonio’s tech communities` : "San Antonio’s tech communities"

  return new ImageResponse(
    (
      <OgCard
        title={["Every group.", "One calendar."]}
        hook={`${who} publish here. Subscribe once and every event lands in your own calendar.`}
        footer="Community calendar"
        url="devsa.community/events"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
