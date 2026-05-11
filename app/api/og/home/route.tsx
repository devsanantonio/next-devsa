import { ImageResponse } from "next/og"
import { BrandGradientBar, DevsaLogoMark } from "@/lib/og-brand"

export const runtime = "nodejs"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
        }}
      >
        <BrandGradientBar direction="ltr" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "44px 64px",
          }}
        >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: 48,
          }}
        >
          <DevsaLogoMark size={40} />

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fef2f2",
              border: "2px solid #ef426f",
              borderRadius: 24,
              padding: "8px 22px",
            }}
          >
            <span
              style={{
                color: "#ef426f",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              Community Driven Platform
            </span>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Find your people.
          </h1>
          <h2
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ef426f",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 28,
              letterSpacing: "-0.02em",
            }}
          >
            Build your future.
          </h2>

          <p
            style={{
              fontSize: 22,
              color: "#6b7280",
              margin: 0,
              maxWidth: 750,
              lineHeight: 1.55,
              fontWeight: 400,
            }}
          >
            Our platform simplifies how local partners and tech communities collaborate, exchange resources, and grow the ecosystem together.
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                color: "#ef426f",
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              Coworking Space
            </span>
            <span
              style={{
                color: "#9ca3af",
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              Downtown San Antonio
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                color: "#ef426f",
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              Community Calendar
            </span>
            <span
              style={{
                color: "#9ca3af",
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              Workshops & Events
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                color: "#ef426f",
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              Building Together
            </span>
            <span
              style={{
                color: "#9ca3af",
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              Partners & Communities
            </span>
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
            borderTop: "2px solid #f3f4f6",
          }}
        >
          <span
            style={{
              color: "#9ca3af",
              fontSize: 17,
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            Find your people. Build your future.
          </span>
          <span
            style={{
              color: "#9ca3af",
              fontSize: 15,
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            devsa.community
          </span>
        </div>
        </div>
        <BrandGradientBar direction="rtl" />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
