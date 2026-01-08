import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

// Static event data for OG generation (edge runtime can't import from data files directly)
const staticEvents = [
  {
    slug: "alamo-python-meetup-january-2026-2026-01-28",
    title: "Alamo Python Meetup - January 2026",
    date: "2026-01-28T09:00:00.000Z",
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
  let formattedDate = "Upcoming Event"
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
      }
    } catch {
      formattedDate = "Upcoming Event"
    }
  }

  const displayTitle = event.title || "Community Event"
  const communityName = event.communityName || "DEVSA Community"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* Community branding */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ color: "white", fontSize: 28, fontWeight: 600 }}>
            {communityName}
          </span>
        </div>

        {/* Community badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#ef426f",
            borderRadius: 24,
            padding: "8px 20px",
            marginBottom: 24,
          }}
        >
          <span style={{ color: "white", fontSize: 18, fontWeight: 600 }}>
            Community Event
          </span>
        </div>

        {/* Event title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 1000,
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          <h1
            style={{
              fontSize: displayTitle.length > 40 ? 48 : 64,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 24,
            }}
          >
            {displayTitle}
          </h1>

          {/* Date */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#9ca3af",
              fontSize: 28,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#6b7280",
            fontSize: 20,
          }}
        >
          <span>devsa.community/events</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
