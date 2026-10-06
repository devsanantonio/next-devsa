import { ImageResponse } from "next/og"
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
        hook="The engineering side of AI — the people shipping it, securing it, and answering for it when it goes wrong."
        theme={{ ...DEVSA, accent: "#ff9900" }}
        display
        footer="A DEVSA conference"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
