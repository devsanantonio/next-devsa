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
          backgroundColor: "#ffffff",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* Subtle Python-blue accent gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 400,
            height: 400,
            background:
              "radial-gradient(ellipse at 100% 100%, rgba(55, 118, 171, 0.08) 0%, transparent 60%)",
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
                backgroundColor: "#3776AB",
                borderRadius: 3,
                display: "flex",
              }}
            />
            <span
              style={{
                color: "#111827",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              PySanAntonio
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#eff6ff",
              border: "2px solid #3776AB",
              borderRadius: 24,
              padding: "8px 22px",
            }}
          >
            <span
              style={{
                color: "#3776AB",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              Python Conference
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
              fontSize: 72,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            PySanAntonio
          </h1>
          <h2
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#3776AB",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 24,
              letterSpacing: "-0.01em",
            }}
          >
            Python Conference
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 22,
              color: "#6b7280",
              margin: 0,
              marginBottom: 36,
              maxWidth: 800,
              lineHeight: 1.55,
              fontWeight: 400,
            }}
          >
            Hosted by Alamo Python, DEVSA, and the PyTexas Foundation. Celebrating the industries building with Python in San Antonio.
          </p>

          {/* Event details */}
          <div
            style={{
              display: "flex",
              gap: 36,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#3776AB" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" stroke="#3776AB" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" stroke="#3776AB" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="#3776AB" strokeWidth="2" />
              </svg>
              <span style={{ color: "#374151", fontSize: 19, fontWeight: 500, lineHeight: 1.4 }}>
                Alamo Python
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#3776AB" strokeWidth="2" />
                <circle cx="12" cy="10" r="3" stroke="#3776AB" strokeWidth="2" />
              </svg>
              <span style={{ color: "#374151", fontSize: 19, fontWeight: 500, lineHeight: 1.4 }}>
                Geekdom, San Antonio
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#3776AB" strokeWidth="2" />
                <circle cx="9" cy="7" r="4" stroke="#3776AB" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#3776AB" strokeWidth="2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#3776AB" strokeWidth="2" />
              </svg>
              <span style={{ color: "#374151", fontSize: 19, fontWeight: 500, lineHeight: 1.4 }}>
                Free Admission
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
            <span style={{ color: "#9ca3af", fontSize: 17, fontWeight: 400, lineHeight: 1.4 }}>
              Powered by
            </span>
            <span style={{ color: "#111827", fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>
              DEVSA + PyTexas
            </span>
          </div>
          <span style={{ color: "#9ca3af", fontSize: 15, fontWeight: 400, lineHeight: 1.4 }}>
            devsa.community/events/pysanantonio
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
