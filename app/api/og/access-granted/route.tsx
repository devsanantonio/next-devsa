import { ImageResponse } from "next/og"
import { OgCard, DEVSA } from "@/lib/og-card"
import { loadDisplayFonts } from "@/lib/og-fonts"
import { ACCESS_GREEN } from "@/data/access-granted/2026"

export const runtime = "nodejs"

/**
 * Access Granted — the security and hacker track.
 *
 * Oswald bold uppercase is what the wordmark is actually specified in, so this
 * card finally sets it in the right face. The lock cut-out and grid field came
 * off: at feed size they were texture behind the only two words that matter.
 */
export async function GET() {
  const fonts = await loadDisplayFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["Access", "Granted"]}
        hook="Every other room that week was people talking about technology. This one was people taking it apart."
        theme={{ ...DEVSA, accent: ACCESS_GREEN }}
        display
        footer="A DEVSA security track"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
