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
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* Radial gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            background:
              "radial-gradient(ellipse at 100% 0%, rgba(239, 66, 111, 0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: 48,
            zIndex: 1,
          }}
        >
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
                color: "#ffffff",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              DEVSA
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(239, 66, 111, 0.1)",
              border: "2px solid rgba(239, 66, 111, 0.3)",
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
              Official Merch
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
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Community Vibes.
          </h1>
          <h2
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ef426f",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 28,
              letterSpacing: "-0.02em",
              fontStyle: "italic",
            }}
          >
            Wear the Source.
          </h2>

          <p
            style={{
              fontSize: 22,
              color: "#9ca3af",
              margin: 0,
              maxWidth: 750,
              lineHeight: 1.55,
              fontWeight: 400,
            }}
          >
            Print-on-demand apparel designed in San Antonio — bridging the gap between code and community.
          </p>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                color: "#ef426f",
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              devsa.community/shop
            </span>
            <span
              style={{
                color: "#6b7280",
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              San Antonio Developer Community
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
