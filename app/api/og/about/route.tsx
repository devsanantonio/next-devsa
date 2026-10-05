import { ImageResponse } from "next/og"
import { BrandGradientBar, DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts } from "@/lib/og-fonts"
import { listCommunities } from "@/lib/communities"
import { listPartners } from "@/lib/partners"

export const runtime = "nodejs"

/**
 * The share card for /about.
 *
 * The page borrowed /api/og/home until this existed, which put a card whose
 * alt text reads "the community calendar for San Antonio tech" under a link
 * about when the organization was founded and who governs it. /about exists
 * for the diligence audience — a grantmaker, a sponsorship committee, a
 * journalist — and that audience is exactly who gets sent a bare link.
 *
 * The headline is the page's headline, because the two dates are the only
 * thing on /about that is not said somewhere else on the site, and a card is
 * read for about a second.
 *
 * The counts are live, matching the page's fact strip, so the card cannot
 * drift from it. Per the og-image skill a dynamic card must always render
 * something — a Firestore failure here produces the card without numbers
 * rather than a 500, since a broken share image is worse than a plain one.
 *
 * Weights are 400/500/700/800 only. `fontWeight: 600` on Geist Sans silently
 * falls back to the nearest loaded weight, so 700 is used where the home card
 * (which has this bug on its badge) asks for 600.
 */
export async function GET() {
  const fonts = await loadBrandFonts()

  let communityCount: number | null = null
  let partnerCount: number | null = null
  try {
    const [communities, partners] = await Promise.all([
      listCommunities(),
      listPartners(),
    ])
    communityCount = communities.length
    partnerCount = partners.length
  } catch {
    // Render the card without the numbers rather than failing the request.
  }

  const stats: { value: string; label: string }[] = [
    ...(communityCount
      ? [{ value: `${communityCount} Groups`, label: "On one calendar" }]
      : []),
    ...(partnerCount
      ? [{ value: `${partnerCount} Partners`, label: "Backing the work" }]
      : []),
    { value: "Volunteer Board", label: "Governs every program" },
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
              marginBottom: 48,
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
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                About DEVSA
              </span>
            </div>
          </div>

          {/* Main content — the page's own headline, for the same reason the
              page leads with it: these two dates are what is only here. */}
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
                fontSize: 64,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
                margin: 0,
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              A Discord server in 2023.
            </h1>
            <h2
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: "#ef426f",
                lineHeight: 1.2,
                margin: 0,
                marginBottom: 28,
                letterSpacing: "-0.02em",
              }}
            >
              A 501(c)(3) in 2024.
            </h2>

            <p
              style={{
                fontSize: 22,
                color: "#6b7280",
                margin: 0,
                maxWidth: 950,
                lineHeight: 1.55,
                fontWeight: 400,
              }}
            >
              San Antonio&apos;s tech groups run themselves. DEVSA keeps them on
              one calendar, in one public directory, and in one room a few times
              a year.
            </p>
          </div>

          {/* Stats — the scale the dates do not carry. Live, so this card and
              the page's fact strip cannot disagree. */}
          <div
            style={{ display: "flex", gap: 48, marginTop: 40, marginBottom: 32 }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span
                  style={{
                    color: "#ef426f",
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    color: "#9ca3af",
                    fontSize: 15,
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {stat.label}
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
              A 501(c)(3) nonprofit in San Antonio, Texas
            </span>
            <span
              style={{
                color: "#9ca3af",
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              devsa.community/about
            </span>
          </div>
        </div>
        <BrandGradientBar direction="rtl" />
      </div>
    ),
    { width: 1200, height: 630, fonts }
  )
}
