import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

// Static event data for OG generation (edge runtime can't import from data files directly)
const staticEvents = [
  {
    slug: "alamo-python-meetup-january-2026-2026-01-28",
    title: "Alamo Python Meetup - January 2026",
    date: "2026-01-28T09:00:00.000Z",
    location: "Geekdom, San Antonio",
    communityId: "alamo-python",
    communityName: "Alamo Python",
  },
]

async function getEventBySlug(slug: string, baseUrl: string) {
  // Try to fetch from API
  try {
    const response = await fetch(`${baseUrl}/api/events`, {
      next: { revalidate: 60 },
    })
    if (response.ok) {
      const data = await response.json()
      const event = data.events?.find((e: { slug: string }) => e.slug === slug)
      if (event) {
        return {
          title: event.title,
          date: event.date,
          location: event.location,
          communityId: event.communityId || event.communityTag,
          communityName: event.communityName,
        }
      }
    }
  } catch (error) {
    console.error("OG: Error fetching event from API:", error)
  }

  // Fallback to static events
  const staticEvent = staticEvents.find((e) => e.slug === slug)
  if (staticEvent) {
    return staticEvent
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
    communityId: null,
    communityName: null,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Get base URL for API calls
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.nextUrl.origin ||
    "https://devsa.community"

  const event = await getEventBySlug(slug, baseUrl)

  // Format date
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
        })
        formattedTime = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      }
    } catch {
      formattedDate = "Date TBA"
    }
  }

  const displayTitle = event.title || "Community Event"
  const organizerName = event.communityName || "Community Event"
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
          padding: "48px 60px",
        }}
      >
        {/* Header with organizer branding */}
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
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #ef426f 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: 24, fontWeight: 700 }}>
                {organizerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ color: "#111827", fontSize: 28, fontWeight: 600 }}>
              {organizerName}
            </span>
          </div>
          
          {/* Event type badge */}
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
              Community Event
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
              fontSize: displayTitle.length > 50 ? 48 : displayTitle.length > 35 ? 56 : 64,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 32,
              maxWidth: 950,
            }}
          >
            {displayTitle}
          </h1>

          {/* Event details row */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Date and time */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "#ef426f" }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#ef426f" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" stroke="#ef426f" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" stroke="#ef426f" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#374151", fontSize: 22, fontWeight: 500 }}>
                {formattedDate}{formattedTime && ` • ${formattedTime}`}
              </span>
            </div>

            {/* Location */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "#ef426f" }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#ef426f" strokeWidth="2" />
                <circle cx="12" cy="10" r="3" stroke="#ef426f" strokeWidth="2" />
              </svg>
              <span style={{ color: "#374151", fontSize: 22, fontWeight: 500 }}>
                {location}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with DEVSA branding */}
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
            <span style={{ color: "#6b7280", fontSize: 18 }}>Building</span>
            <span style={{ color: "#111827", fontSize: 18, fontWeight: 700 }}>Together</span>
          </div>
          <span style={{ color: "#9ca3af", fontSize: 16 }}>
            devsa.community/events
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
