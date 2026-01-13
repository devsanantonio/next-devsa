import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { techCommunities } from "@/data/communities"
import { partners } from "@/data/partners"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Check if it's a community
  const community = techCommunities.find((c) => c.id === slug)
  if (community) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#111827",
            padding: "48px 60px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "#ffffff", fontSize: 28, fontWeight: 600 }}>
                DEVSA
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(239, 66, 111, 0.15)",
                border: "2px solid #ef426f",
                borderRadius: 24,
                padding: "8px 20px",
              }}
            >
              <span style={{ color: "#ef426f", fontSize: 16, fontWeight: 600 }}>
                Tech Group
              </span>
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              gap: 48,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 200,
                height: 200,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 24,
                padding: 24,
              }}
            >
              <img
                src={community.logo}
                alt={community.name}
                width={160}
                height={160}
                style={{
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Text content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <h1
                style={{
                  fontSize: community.name.length > 25 ? 48 : 56,
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  margin: 0,
                  marginBottom: 20,
                }}
              >
                {community.name}
              </h1>

              <p
                style={{
                  fontSize: 22,
                  color: "#9ca3af",
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: 650,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {community.description.slice(0, 200)}
                {community.description.length > 200 ? "..." : ""}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: 24,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#9ca3af", fontSize: 18 }}>Building</span>
              <span style={{ color: "#ffffff", fontSize: 18, fontWeight: 700 }}>Together</span>
            </div>
            <span style={{ color: "#6b7280", fontSize: 16 }}>
              devsa.community/buildingtogether/{slug}
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  // Check if it's a partner
  const partner = partners.find((p) => p.id === slug)
  if (partner) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            padding: "48px 60px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "#111827", fontSize: 28, fontWeight: 600 }}>
                DEVSA
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fef2f2",
                border: "2px solid #ef426f",
                borderRadius: 24,
                padding: "8px 20px",
              }}
            >
              <span style={{ color: "#ef426f", fontSize: 16, fontWeight: 600 }}>
                Partner
              </span>
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              gap: 48,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 200,
                height: 200,
                backgroundColor: "#f3f4f6",
                borderRadius: 24,
                padding: 24,
              }}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={160}
                style={{
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Text content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <h1
                style={{
                  fontSize: partner.name.length > 25 ? 48 : 56,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.15,
                  margin: 0,
                  marginBottom: 20,
                }}
              >
                {partner.name}
              </h1>

              <p
                style={{
                  fontSize: 22,
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: 650,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {partner.description.slice(0, 200)}
                {partner.description.length > 200 ? "..." : ""}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: 24,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#6b7280", fontSize: 18 }}>Building</span>
              <span style={{ color: "#111827", fontSize: 18, fontWeight: 700 }}>Together</span>
            </div>
            <span style={{ color: "#9ca3af", fontSize: 16 }}>
              devsa.community/buildingtogether/{slug}
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  // Fallback for unknown slugs
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111827",
        }}
      >
        <span style={{ color: "#ffffff", fontSize: 48 }}>DEVSA Community</span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
