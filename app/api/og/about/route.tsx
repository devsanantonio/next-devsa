import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * About DEVSA. Leads with what DEVSA is, as the page's hero does; the
 * history that used to be the title is the second line of the hook.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["Community infrastructure", "for San Antonio's learners and builders."]}
        hook="One calendar, one directory, one channel and a few rooms a year. A Discord server in 2023, a 501(c)(3) since 2024, governed by a volunteer board."
        footer="A 501(c)(3) nonprofit in San Antonio, Texas"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
