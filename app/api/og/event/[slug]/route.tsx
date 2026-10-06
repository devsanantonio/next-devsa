import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { loadBrandFonts } from "@/lib/og-fonts"
import { OgCard } from "@/lib/og-card"

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

  // The host and the date are the hook. On a per-event card the date is the
  // point — somebody shares this to get people to turn up on a specific day —
  // which is the opposite of the conference cards, where a date goes stale and
  // the description does not.
  const when = formattedTime ? `${formattedDate} · ${formattedTime}` : formattedDate
  const by = event.hostName ? `Hosted by ${event.hostName}` : "On the DEVSA community calendar"

  return new ImageResponse(
    (
      <OgCard
        title={[event.title]}
        hook={`${when} · ${location}`}
        footer={by}
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
