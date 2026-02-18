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
          padding: "56px 64px",
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
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(239, 66, 111, 0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(239, 66, 111, 0.08) 0%, transparent 40%)",
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
              fontSize: 78,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            More Human
          </h1>
          <h2
            style={{
              fontSize: 78,
              fontWeight: 800,
              color: "#ef426f",
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 28,
              letterSpacing: "-0.02em",
            }}
          >
            Than Human
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              color: "#9ca3af",
              margin: 0,
              marginBottom: 36,
              maxWidth: 700,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Where builders explore the frontier of artificial intelligence
          </p>

          {/* Event details */}
          <div
            style={{
              display: "flex",
              gap: 36,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#ef426f" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" stroke="#ef426f" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" stroke="#ef426f" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#e5e7eb", fontSize: 20, fontWeight: 500, lineHeight: 1.4 }}>
                February 28, 2026
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#ef426f" strokeWidth="2" />
                <circle cx="12" cy="10" r="3" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#e5e7eb", fontSize: 20, fontWeight: 500, lineHeight: 1.4 }}>
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
              Call for
            </span>
            <span style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>
              Speakers Open
            </span>
          </div>
          <span style={{ color: "#6b7280", fontSize: 15, fontWeight: 400, lineHeight: 1.4 }}>
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
