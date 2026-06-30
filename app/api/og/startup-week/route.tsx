import { ImageResponse } from "next/og"
import { BrandGradientBar, DevsaLogoMark } from "@/lib/og-brand"

export const runtime = "nodejs"

const ACCENT = "#ec228d"
const STARTUP_WEEK_LOGO =
  "https://devsa-assets.s3.us-east-2.amazonaws.com/poweredbygeekdom.png"

const HEADLINE =
  "Find Your People. Build Your Future."
const SUBTITLE =
  "DEVSA and Geekdom are coming together for Startup Week 2026. Share what you're building with founders, operators, and investors from across the San Antonio ecosystem."

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
        }}
      >
        <BrandGradientBar direction="ltr" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "44px 64px",
          }}
        >
          {/* Header — co-brand lockup + status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 44,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              {/* High-res Startup Week lockup, scaled down (crisp) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={STARTUP_WEEK_LOGO}
                alt="San Antonio Startup Week"
                width={376}
                height={114}
              />
              <span style={{ fontSize: 36, fontWeight: 300, color: "#d4d4d4" }}>
                ×
              </span>
              <DevsaLogoMark size={66} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fdf2f8",
                border: `2px solid ${ACCENT}`,
                borderRadius: 24,
                padding: "8px 22px",
              }}
            >
              <span
                style={{ color: ACCENT, fontSize: 15, fontWeight: 600 }}
              >
                Call for speakers open
              </span>
            </div>
          </div>

          {/* Main content — the message */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <h1
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                margin: 0,
                marginBottom: 26,
                maxWidth: 1020,
              }}
            >
              {HEADLINE}
            </h1>
            <p
              style={{
                fontSize: 27,
                fontWeight: 400,
                color: "#6b7280",
                lineHeight: 1.45,
                margin: 0,
                maxWidth: 940,
              }}
            >
              {SUBTITLE}
            </p>
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
            }}
          >
            <span
              style={{ color: "#374151", fontSize: 19, fontWeight: 600 }}
            >
              Sept 28 – Oct 2, 2026 · San Antonio, TX
            </span>
            <span style={{ color: "#9ca3af", fontSize: 16, fontWeight: 400 }}>
              devsa.community/startup-week-2026
            </span>
          </div>
        </div>
        <BrandGradientBar direction="rtl" />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
