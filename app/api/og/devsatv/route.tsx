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
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* Subtle gradient background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(239, 66, 111, 0.1) 0%, transparent 50%)",
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(239, 66, 111, 0.15)",
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
            zIndex: 1,
          }}
        >
          {/* Main title */}
          <h1
            style={{
              fontSize: 86,
              fontWeight: 800,
              color: "#ef426f",
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            DEVSA TV
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 30,
              color: "#9ca3af",
              margin: 0,
              marginBottom: 40,
              maxWidth: 800,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            The Content Engine for San Antonio Tech
          </p>

          {/* Feature highlights */}
          <div
            style={{
              display: "flex",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderRadius: 12,
                padding: "12px 20px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <span style={{ fontSize: 18 }}>🎬</span>
              <span style={{ color: "#e5e7eb", fontSize: 17, fontWeight: 500, lineHeight: 1.4 }}>
                Documentary Production
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderRadius: 12,
                padding: "12px 20px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <span style={{ fontSize: 18 }}>🎤</span>
              <span style={{ color: "#e5e7eb", fontSize: 17, fontWeight: 500, lineHeight: 1.4 }}>
                Community Stories
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderRadius: 12,
                padding: "12px 20px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <span style={{ fontSize: 18 }}>🤝</span>
              <span style={{ color: "#e5e7eb", fontSize: 17, fontWeight: 500, lineHeight: 1.4 }}>
                Sponsor-Ready
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
            borderTop: "2px solid rgba(255, 255, 255, 0.08)",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "#6b7280", fontSize: 17, fontWeight: 400, lineHeight: 1.4 }}>
              Authentic
            </span>
            <span style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>
              Community Content
            </span>
          </div>
          <span style={{ color: "#6b7280", fontSize: 15, fontWeight: 400, lineHeight: 1.4 }}>
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
