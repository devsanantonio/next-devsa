import { ImageResponse } from "next/og"
import { BrandGradientBar, DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

/**
 * Share card for /signin — organizer access.
 *
 * Matches the page and the confirmation email it triggers: white surface, the
 * DEVSA logo in the header, and "One platform for everyone building San
 * Antonio." as the lead, split across two lines the way the home card splits
 * its own headline.
 *
 * The page sets that second line in light italic. This does not: only upright
 * Geist faces are bundled and satori will not synthesise a slant, so asking for
 * italic here would silently do nothing. The pink carries the emphasis instead.
 */
export async function GET() {
  const fonts = await loadBrandFonts()

  // The same four capabilities the page lists and the email repeats.
  const capabilities = [
    { label: "Community Calendar", detail: "Publish your events" },
    { label: "Building Together", detail: "Run your community page" },
    { label: "RSVPs", detail: "See who's coming" },
    { label: "Speakers", detail: "Collect talk submissions" },
  ]

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          fontFamily: "Geist Sans",
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
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 44,
            }}
          >
            <DevsaLogoMark size={40} />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fef2f2",
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
                Organizer Access
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
            <h1
              style={{
                fontSize: 62,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
                margin: 0,
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              One platform for everyone
            </h1>
            <h2
              style={{
                fontSize: 62,
                fontWeight: 700,
                color: "#ef426f",
                lineHeight: 1.2,
                margin: 0,
                marginBottom: 28,
                letterSpacing: "-0.02em",
              }}
            >
              building San Antonio.
            </h2>

            <p
              style={{
                fontSize: 22,
                color: "#6b7280",
                margin: 0,
                // Wide enough to hold the sentence on two lines; at 800 the
                // final word wrapped alone and crowded the capability row.
                maxWidth: 940,
                lineHeight: 1.55,
                fontWeight: 400,
              }}
            >
              Builders, organizers and partners all work off one calendar, one
              directory, one audience — organizer access is how your group takes part.
            </p>
          </div>

          {/* Capability row */}
          <div style={{ display: "flex", gap: 36, marginBottom: 32 }}>
            {capabilities.map(({ label, detail }) => (
              <div
                key={label}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span
                  style={{
                    color: "#ef426f",
                    fontSize: 20,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    color: "#9ca3af",
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {detail}
                </span>
              </div>
            ))}
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
              style={{
                color: "#9ca3af",
                fontSize: 17,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Free for San Antonio tech communities
            </span>
            <span
              style={{
                color: "#9ca3af",
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              devsa.community/signin
            </span>
          </div>
        </div>

        <BrandGradientBar direction="rtl" />
      </div>
    ),
    { width: 1200, height: 630, fonts }
  )
}
