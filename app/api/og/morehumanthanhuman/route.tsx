import { ImageResponse } from "next/og"
import { MH_HOOK } from "@/data/more-human/2026"
import { OgCard, DEVSA } from "@/lib/og-card"
import { loadDisplayFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/** More Human Than Human — the engineering counterpart to The Model. */
export async function GET() {
  const fonts = await loadDisplayFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["More Human", "Than Human"]}
        hook={MH_HOOK.positioning}
        theme={{ ...DEVSA, accent: "#ff9900" }}
        display
        footer="A DEVSA conference"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
