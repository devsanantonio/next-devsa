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
        {/* Subtle radial gradient */}
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
              San Antonio Tech Community
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
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Your Direct Connection
          </h1>
          <h2
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#ef426f",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 28,
              letterSpacing: "-0.02em",
            }}
          >
            to San Antonio Tech
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
            Meetups, workshops, coworking spaces, and career opportunities — all in one place.
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginBottom: 32,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                color: "#ef426f",
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              Events
            </span>
            <span
              style={{
                color: "#6b7280",
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Community Meetups
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                color: "#ef426f",
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              Partners
            </span>
            <span
              style={{
                color: "#6b7280",
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Local Organizations
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                color: "#ef426f",
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              Jobs
            </span>
            <span
              style={{
                color: "#6b7280",
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Career Opportunities
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
            borderTop: "2px solid rgba(255, 255, 255, 0.1)",
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
            <span
              style={{
                color: "#6b7280",
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              Bridging builders, partners &amp; the tech ecosystem
            </span>
          </div>
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
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
