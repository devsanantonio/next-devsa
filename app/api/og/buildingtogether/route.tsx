import { ImageResponse } from "next/og"

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
          backgroundColor: "#111827",
          padding: "48px 60px",
        }}
      >
        {/* Header with DEVSA branding */}
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

          {/* Badge */}
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
              Tech Communities
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
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 24,
            }}
          >
            Building Together
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 28,
              color: "#9ca3af",
              margin: 0,
              marginBottom: 40,
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            Discover 20+ active tech-focused groups and partners in San Antonio
          </p>

          {/* Feature cards */}
          <div
            style={{
              display: "flex",
              gap: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 16,
                padding: "24px 28px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span style={{ color: "#ef426f", fontSize: 42, fontWeight: 700, marginBottom: 8 }}>
                20+
              </span>
              <span style={{ color: "#9ca3af", fontSize: 18 }}>
                Tech Groups
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 16,
                padding: "24px 28px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span style={{ color: "#ef426f", fontSize: 42, fontWeight: 700, marginBottom: 8 }}>
                10+
              </span>
              <span style={{ color: "#9ca3af", fontSize: 18 }}>
                Partners
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 16,
                padding: "24px 28px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span style={{ color: "#ef426f", fontSize: 42, fontWeight: 700, marginBottom: 8 }}>
                1
              </span>
              <span style={{ color: "#9ca3af", fontSize: 18 }}>
                Community
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
            <span style={{ color: "#9ca3af", fontSize: 18 }}>San Antonio</span>
            <span style={{ color: "#ffffff", fontSize: 18, fontWeight: 700 }}>Tech Ecosystem</span>
          </div>
          <span style={{ color: "#6b7280", fontSize: 16 }}>
            devsa.community/buildingtogether
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
