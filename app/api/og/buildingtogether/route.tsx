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
        title={["The groups run", "themselves."]}
        hook="Nobody hands their community over to DEVSA. We bring the room, the audience and the partners — you keep running it your way."
        footer="Partners & communities"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
