import { ImageResponse } from "next/og"
import { getProduct } from "@/lib/printify"
import { loadBrandFonts } from "@/lib/og-fonts"
import { OgCard } from "@/lib/og-card"

export const runtime = "nodejs"

/**
 * The per-product card.
 *
 * The product photograph came off. It was a Printify CDN URL fetched at render
 * time, which made the card depend on a third party being up to produce a share
 * image, and at feed size it was a small shirt on a white field competing with
 * the title. The price does the work the photo was failing to do.
 *
 * A Printify failure still returns a card — the catch leaves the defaults in
 * place rather than throwing, because a broken share image is worse than a
 * plain one.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  const fonts = await loadBrandFonts()

  let title = "DEVSA merch"
  let description = ""
  let priceText = ""

  try {
    const product = await getProduct(productId)
    title = product.title
    description = product.description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 120)

    const enabled = product.variants.filter((v) => v.is_enabled)
    if (enabled.length > 0) {
      const prices = enabled.map((v) => v.price)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      priceText =
        min === max
          ? `$${(min / 100).toFixed(2)}`
          : `$${(min / 100).toFixed(2)} – $${(max / 100).toFixed(2)}`
    }
  } catch {
    // Leave the defaults — render something rather than nothing.
  }

  const hook = [priceText, description || "Designed in San Antonio, printed on demand."]
    .filter(Boolean)
    .join(" · ")

  return new ImageResponse(
    (
      <OgCard
        title={[title]}
        hook={hook}
        footer="Every order pays for the next conference"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
