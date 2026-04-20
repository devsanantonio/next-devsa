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
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
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
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Vercel triangle */}
            <svg width="20" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 1.608l12 20.784H0z" />
            </svg>
            <span
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
              }}
            >
              Vercel Community Event
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              04.25.26
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 16,
              }}
            >
              |
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
              }}
            >
              San Antonio/TX
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
          {/* Zero to Agent wordmark */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 300,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              zero to
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 88,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                textTransform: "uppercase" as const,
              }}
            >
              AGENT
            </div>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.6)",
              margin: 0,
              marginTop: 32,
              maxWidth: 700,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Find Your People. Build Your Future.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 500 }}>
                $30 v0 Credits
              </span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 500 }}>
              $6K+ Prize Pool
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 500 }}>
              Limited Edition Swag
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
              }}
            >
              Powered by
            </span>
            <svg width="16" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
              <path d="M12 1.608l12 20.784H0z" />
            </svg>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
