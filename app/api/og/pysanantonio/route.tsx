import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { OgCard, DEVSA } from "@/lib/og-card"
import { loadDisplayFonts } from "@/lib/og-fonts"
import { PYSA_COLORS, PYSA_WORDMARK } from "@/data/pysa/2026"

export const runtime = "nodejs"

/**
 * PySanAntonio.
 *
 * The wordmark is the card. It is the one conference here with real lettering
 * of its own, so the layout steps aside for it.
 *
 * Inlined from disk as a data URI rather than fetched over HTTP, so the card
 * renders when the site's own origin is unreachable — previews, local builds.
 * Satori decodes PNG, JPEG and SVG but NOT WebP; a WebP source fails the whole
 * render with "u2 is not iterable".
 *
 * The date and the call-for-speakers badge are gone. The conference ran on
 * 2 October and the badge logic was still computing an open or closed phase
 * for a window that had shut — a card that is wrong the moment it is stale.
 */
export async function GET() {
  const fonts = await loadDisplayFonts()
  const wordmark = `data:image/svg+xml;base64,${(
    await readFile(path.join(process.cwd(), "public", PYSA_WORDMARK.svgDark))
  ).toString("base64")}`

  return new ImageResponse(
    (
      <OgCard
        title={[]}
        wordmark={
          <div style={{ display: "flex" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wordmark} width={660} height={132} alt="" />
          </div>
        }
        hook="The city&apos;s Python conference — a full afternoon of talks and the people who actually ship Python in San Antonio."
        theme={{ ...DEVSA, bg: PYSA_COLORS.ink, accent: PYSA_COLORS.yellow }}
        footer="A DEVSA conference"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
