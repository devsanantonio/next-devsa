import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * Partners and communities.
 *
 * The old hook listed what DEVSA provides. This one leads with what the groups
 * keep, because that is the actual offer and the thing partners get wrong.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <OgCard
        title={["Bring the idea.", "We’ll bring the builders."]}
        hook="San Antonio&apos;s tech groups and the partners behind them. Partner with DEVSA, host with a group, or sponsor the work."
        footer="Get involved"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
