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
            <span style={{ color: "#111827", fontSize: 28, fontWeight: 600 }}>
              DEVSA
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fef2f2",
              border: "2px solid #ef426f",
              borderRadius: 24,
              padding: "8px 20px",
            }}
          >
            <span style={{ color: "#ef426f", fontSize: 16, fontWeight: 600 }}>
              Community Space
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
          {/* Main title */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 20,
            }}
          >
            Community Space in
          </h1>
          <h2
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#ef426f",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 28,
            }}
          >
            Downtown San Antonio
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 26,
              color: "#6b7280",
              margin: 0,
              marginBottom: 36,
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            Thanks to Geekdom, we have a physical space right in the heart of downtown available to our growing tech community
          </p>

          {/* Features */}
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#ef426f" strokeWidth="2" />
                <circle cx="12" cy="10" r="3" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#374151", fontSize: 20, fontWeight: 500 }}>
                Houston Street
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#ef426f" strokeWidth="2" />
                <path d="M9 3v18" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#374151", fontSize: 20, fontWeight: 500 }}>
                Free Parking
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#ef426f" strokeWidth="2" />
                <circle cx="9" cy="7" r="4" stroke="#ef426f" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#ef426f" strokeWidth="2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#374151", fontSize: 20, fontWeight: 500 }}>
                Community Access
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
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "#6b7280", fontSize: 18 }}>Powered by</span>
            <span style={{ color: "#111827", fontSize: 18, fontWeight: 700 }}>Geekdom</span>
          </div>
          <span style={{ color: "#9ca3af", fontSize: 16 }}>
            devsa.community/coworking-space
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
