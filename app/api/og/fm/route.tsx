import { readFile } from "node:fs/promises"
import { ImageResponse } from "next/og"
import { OgCard } from "@/lib/og-card"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * DEVSA FM: the page's hook. The >FM mark stands in for the DEVSA mark in the corner, on its own
 * (no wordmark set beside it), the way the stream's own graphics carry it.
 */
export async function GET() {
  const fonts = await loadBrandFonts()
  // One literal URL, so the file is traced into the bundle (see the og-image skill on fonts).
  const svg = await readFile(new URL("../../../../public/branding/devsa-fm/devsa-fm-mark.svg", import.meta.url))
  const mark = `data:image/svg+xml;base64,${svg.toString("base64")}`
  return new ImageResponse(
    (
      <OgCard
        // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img only
        header={<img src={mark} alt="" width={128} height={134} />}
        title={["A night in San Antonio,", "in ASCII."]}
        hook="DEVSA FM is DEVSA's lofi livestream, open source. Every scene is one HTML file, and anyone can build one."
        footer="DEVSA FM · Live on YouTube @devsatx"
        url="devsa.community/fm"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
