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
          backgroundColor: "#0a0a0a",
          padding: "48px 60px",
          position: "relative",
        }}
      >
        {/* Background gradient effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(239, 66, 111, 0.15) 0%, transparent 50%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: 40,
            zIndex: 1,
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
              AI Conference 2026
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
              fontSize: 76,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 24,
            }}
          >
            More Human
          </h1>
          <h2
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#ef426f",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 32,
            }}
          >
            Than Human
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 26,
              color: "#9ca3af",
              margin: 0,
              marginBottom: 36,
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            Where builders explore the frontier of artificial intelligence
          </p>

          {/* Event details */}
          <div
            style={{
              display: "flex",
              gap: 32,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#ef426f" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" stroke="#ef426f" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" stroke="#ef426f" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#e5e7eb", fontSize: 22, fontWeight: 500 }}>
                February 28, 2026
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#ef426f" strokeWidth="2" />
                <circle cx="12" cy="10" r="3" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#e5e7eb", fontSize: 22, fontWeight: 500 }}>
                Geekdom, San Antonio
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
            <span style={{ color: "#6b7280", fontSize: 18 }}>Call for</span>
            <span style={{ color: "#ffffff", fontSize: 18, fontWeight: 700 }}>Speakers Open</span>
          </div>
          <span style={{ color: "#6b7280", fontSize: 16 }}>
            devsa.community/events/morehumanthanhuman
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
