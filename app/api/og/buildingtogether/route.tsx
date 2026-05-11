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
        {/* Header with DEVSA branding */}
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
              Building Together
            </span>
          </div>
        </div>

        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Main title */}
          <h1
            style={{
              fontSize: 74,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Partners & Communities
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 26,
              color: "#6b7280",
              margin: 0,
              marginBottom: 40,
              maxWidth: 800,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            From grassroots meetups to enterprise partners — these are the groups shaping San Antonio's tech ecosystem.
          </p>
          {/* Feature cards */}
          <div
            style={{
              display: "flex",
              gap: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f9fafb",
                borderRadius: 16,
                padding: "24px 32px",
                border: "1px solid #f3f4f6",
              }}
            >
              <span
                style={{
                  color: "#ef426f",
                  fontSize: 44,
                  fontWeight: 800,
                  marginBottom: 6,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                20+
              </span>
              <span style={{ color: "#6b7280", fontSize: 17, fontWeight: 400, lineHeight: 1.4 }}>
                Tech Groups
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f9fafb",
                borderRadius: 16,
                padding: "24px 32px",
                border: "1px solid #f3f4f6",
              }}
            >
              <span
                style={{
                  color: "#ef426f",
                  fontSize: 44,
                  fontWeight: 800,
                  marginBottom: 6,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                10+
              </span>
              <span style={{ color: "#6b7280", fontSize: 17, fontWeight: 400, lineHeight: 1.4 }}>
                Partners
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f9fafb",
                borderRadius: 16,
                padding: "24px 32px",
                border: "1px solid #f3f4f6",
              }}
            >
              <span
                style={{
                  color: "#ef426f",
                  fontSize: 44,
                  fontWeight: 800,
                  marginBottom: 6,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                1
              </span>
              <span style={{ color: "#6b7280", fontSize: 17, fontWeight: 400, lineHeight: 1.4 }}>
                Platform
              </span>
            </div>
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
          <span style={{ color: "#9ca3af", fontSize: 15, fontWeight: 400, lineHeight: 1.4 }}>
            devsa.community/buildingtogether
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
