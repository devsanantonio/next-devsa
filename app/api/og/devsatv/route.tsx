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
          backgroundColor: "#000000",
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
              backgroundColor: "rgba(239, 66, 111, 0.2)",
              border: "2px solid #ef426f",
              borderRadius: 24,
              padding: "8px 20px",
            }}
          >
            <span style={{ color: "#ef426f", fontSize: 16, fontWeight: 600 }}>
              Content Engine
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
          {/* Main title with gradient effect simulated */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 24,
            }}
          >
            <h1
              style={{
                fontSize: 84,
                fontWeight: 800,
                background: "linear-gradient(90deg, #ef426f, #f97316)",
                backgroundClip: "text",
                color: "#ef426f",
                lineHeight: 1,
                margin: 0,
              }}
            >
              DEVSA TV
            </h1>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 32,
              color: "#9ca3af",
              margin: 0,
              marginBottom: 40,
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            The Content Engine for San Antonio Tech
          </p>

          {/* Feature highlights */}
          <div
            style={{
              display: "flex",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 12,
                padding: "12px 20px",
              }}
            >
              <span style={{ color: "#ef426f", fontSize: 20 }}>🎬</span>
              <span style={{ color: "#e5e7eb", fontSize: 18 }}>Documentary Production</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 12,
                padding: "12px 20px",
              }}
            >
              <span style={{ color: "#ef426f", fontSize: 20 }}>🎤</span>
              <span style={{ color: "#e5e7eb", fontSize: 18 }}>Community Stories</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 12,
                padding: "12px 20px",
              }}
            >
              <span style={{ color: "#ef426f", fontSize: 20 }}>🤝</span>
              <span style={{ color: "#e5e7eb", fontSize: 18 }}>Sponsor-Ready</span>
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
            <span style={{ color: "#6b7280", fontSize: 18 }}>Authentic</span>
            <span style={{ color: "#ffffff", fontSize: 18, fontWeight: 700 }}>Community Content</span>
          </div>
          <span style={{ color: "#6b7280", fontSize: 16 }}>
            devsa.community/devsatv
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
