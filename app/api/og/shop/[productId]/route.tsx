import { ImageResponse } from "next/og"
import { getProduct } from "@/lib/printify"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ productId: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { productId } = await params

  let title = "Product"
  let description = ""
  let productImage = ""
  let priceText = ""

  try {
    const product = await getProduct(productId)
    title = product.title
    description = product.description.replace(/<[^>]*>/g, "").slice(0, 120)

    const defaultImg = product.images.find((img) => img.is_default)
    productImage = defaultImg?.src || product.images[0]?.src || ""

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
    // fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
          padding: "56px 64px",
        }}
      >
        {/* Left side — text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "space-between",
            paddingRight: 48,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 6,
                height: 32,
                backgroundColor: "#ef426f",
                borderRadius: 3,
                display: "flex",
              }}
            />
            <span
              style={{
                color: "#111827",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              DEVSA Shop
            </span>
          </div>

          {/* Product info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h1
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>

            {priceText && (
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#ef426f",
                  lineHeight: 1.2,
                }}
              >
                {priceText}
              </span>
            )}

            {description && (
              <p
                style={{
                  fontSize: 20,
                  color: "#6b7280",
                  margin: 0,
                  maxWidth: 500,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Footer */}
          <span
            style={{
              color: "#9ca3af",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            devsa.community/shop
          </span>
        </div>

        {/* Right side — product image */}
        {productImage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 420,
              height: "100%",
              position: "relative",
            }}
          >
            <img
              src={productImage}
              alt={title}
              width={400}
              height={400}
              style={{
                objectFit: "contain",
                borderRadius: 16,
              }}
            />
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
