import { ImageResponse } from "next/og"
import { OgCard, DEVSA } from "@/lib/og-card"
import { loadDisplayFonts } from "@/lib/og-fonts"
import { ACCESS_GREEN, AG_ONE_LINER, AG_POSITIONING } from "@/data/access-granted/2026"

export const runtime = "nodejs"

/**
 * Access Granted — DEVSA's security conference. The hook and the footer
 * match the page: the hook is the hero's lead paragraph, read from
 * AG_POSITIONING and AG_ONE_LINER, and the footer said
 * "security track" when the page and metadata say conference.
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
        hook={`${AG_POSITIONING} ${AG_ONE_LINER.setup} ${AG_ONE_LINER.turn}`}
        theme={{ ...DEVSA, accent: ACCESS_GREEN }}
        display
        footer="A DEVSA conference"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
