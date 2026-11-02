import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"
import { listCommunities } from "@/lib/communities"

export const runtime = "nodejs"

/**
 * Give a talk.
 *
 * The page's own headline, and both of its ways in: a group that is asking for
 * speakers now, or the open pool, where DEVSA finds the group a talk fits. The
 * number of open calls is read from Firestore when the card renders, as the
 * page reads it; a hardcoded count is how earlier cards came to publish stale
 * ones. With no open calls, or no read, it still says the true thing.
 */
export async function GET() {
  const [fonts, open] = await Promise.all([
    loadBrandFonts(),
    listCommunities()
      .then((c) => c.filter((g) => g.speakersOpen).length)
      .catch(() => 0),
  ])
  const hook = open
    ? `${open} San Antonio tech group${open === 1 ? " is" : "s are"} looking for speakers right now. Not sure where yours fits? Tell DEVSA, and we’ll find the group. First talks welcome.`
    : "Tell DEVSA about your talk, and we’ll find the San Antonio group it fits. Lightning talks, full talks and workshops; first talks welcome."

  return new ImageResponse(
    (
      <OgCard
        title={["Give a talk", "in San Antonio."]}
        hook={hook}
        footer="Call for speakers"
        url="devsa.community/give-a-talk"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
