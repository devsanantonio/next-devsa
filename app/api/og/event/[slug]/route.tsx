import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { BrandGradientBar, DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts } from "@/lib/og-fonts"

// Use Node.js runtime to access Firestore directly (and fetch logo bytes)
export const runtime = "nodejs"

async function getEventBySlug(slug: string) {
  // Try to fetch from Firestore directly
  try {
    const db = getDb()
    const eventsSnapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get()

    if (!eventsSnapshot.empty) {
      const doc = eventsSnapshot.docs[0]
      const data = doc.data()

      // Hosts can be communities and/or partners (comma-separated, co-hosted)
      const communityIds = (data.communityId || "").split(",").map((s: string) => s.trim()).filter(Boolean)
      const partnerIds = (data.partnerId || "").split(",").map((s: string) => s.trim()).filter(Boolean)

      // Resolve the primary host name — prefer a community, else a partner
      let hostName = data.communityName || "DEVSA Community"

      if (communityIds[0]) {
        try {
          const communityDoc = await db.collection(COLLECTIONS.COMMUNITIES).doc(communityIds[0]).get()
          if (communityDoc.exists) hostName = communityDoc.data()?.name || hostName
        } catch {}
      } else if (partnerIds[0]) {
        try {
          const partnerDoc = await db.collection(COLLECTIONS.PARTNERS).doc(partnerIds[0]).get()
          if (partnerDoc.exists) hostName = partnerDoc.data()?.name || hostName
        } catch {}
      }

      const extraHosts = Math.max(0, communityIds.length + partnerIds.length - 1)

      return {
        title: data.title,
        date: data.date,
        location: data.location,
        hostName,
        extraHosts,
      }
    }
  } catch (error) {
    console.error("OG: Error fetching event from Firestore:", error)
  }

  // Last resort: parse from slug
  const parts = slug.split("-")
  const dateStr = parts.slice(-3).join("-")
  const titleParts = parts.slice(0, -3)
  const title = titleParts
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: title || "Community Event",
    date: dateStr ? `${dateStr}T00:00:00.000Z` : null,
    location: null,
    hostName: null as string | null,
    extraHosts: 0,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const event = await getEventBySlug(slug)
  const fonts = await loadBrandFonts()

  // Format date - explicitly use CST (America/Chicago) timezone
  let formattedDate = "Date TBA"
  let formattedTime = ""
  if (event.date) {
    try {
      const date = new Date(event.date)
      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "America/Chicago",
        })
        formattedTime = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "America/Chicago",
        })
      }
    } catch {
      formattedDate = "Date TBA"
    }
  }

  const displayTitle = event.title || "Community Event"
  const hostLabel = event.hostName || "Community Event"
  const location = event.location || "San Antonio, TX"

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
          {/* Header: DEVSA mark + hosting org */}
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

            {/* Host chip — the community or partner hosting this event */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fafafa",
                border: "1px solid #ececec",
                borderRadius: 999,
                padding: "10px 22px",
              }}
            >
              <span style={{ color: "#111827", fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>
                {hostLabel}
                {event.extraHosts > 0 ? ` +${event.extraHosts}` : ""}
              </span>
            </div>
          </div>

          {/* Main content area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* Event title */}
            <h1
              style={{
                fontSize: displayTitle.length > 50 ? 48 : displayTitle.length > 35 ? 58 : 66,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
                margin: 0,
                marginBottom: 28,
                maxWidth: 950,
                letterSpacing: "-0.02em",
              }}
            >
              {displayTitle}
            </h1>

            {/* Event details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Date and time */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#ef426f" strokeWidth="2" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#ef426f" strokeWidth="2" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#ef426f" strokeWidth="2" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="#ef426f" strokeWidth="2" />
                </svg>
                <span style={{ color: "#374151", fontSize: 20, fontWeight: 500, lineHeight: 1.4 }}>
                  {formattedDate}{formattedTime && ` · ${formattedTime} CST`}
                </span>
              </div>

              {/* Location */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#ef426f" strokeWidth="2" />
                  <circle cx="12" cy="10" r="3" stroke="#ef426f" strokeWidth="2" />
                </svg>
                <span style={{ color: "#374151", fontSize: 20, fontWeight: 500, lineHeight: 1.4 }}>
                  {location}
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
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#9ca3af", fontSize: 17, fontWeight: 400, lineHeight: 1.4 }}>
                Find your people.
              </span>
              <span style={{ color: "#111827", fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>
                Build your future.
              </span>
            </div>
            <span style={{ color: "#9ca3af", fontSize: 15, fontWeight: 400, lineHeight: 1.4 }}>
              devsa.community/events
            </span>
          </div>
        </div>
        <BrandGradientBar direction="rtl" />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  )
}
