import { Metadata } from "next"
import { EventPageClient } from "./event-page-client"
import { getDb, COLLECTIONS, type Event } from "@/lib/firebase-admin"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getEventBySlug(slug: string) {
  // Query Firestore directly (avoids self-referencing fetch on Vercel)
  try {
    const db = getDb()
    const snapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get()

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      const data = doc.data() as Event
      
      // Look up community name from Firestore, fall back to stored communityName for custom events
      let communityName = data.communityName || 'DEVSA Community'
      if (data.communityId) {
        try {
          const communityDoc = await db.collection(COLLECTIONS.COMMUNITIES).doc(data.communityId).get()
          if (communityDoc.exists) {
            communityName = communityDoc.data()?.name || communityName
          }
        } catch {}
      }
      
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        date: data.date,
        endTime: data.endTime,
        location: data.location,
        venue: data.venue,
        address: data.address,
        description: data.description,
        url: data.url,
        communityId: data.communityId,
        organizerEmail: data.organizerEmail,
        source: data.source,
        status: data.status,
        eventType: data.eventType,
        rsvpEnabled: data.rsvpEnabled,
        externalRsvpUrl: data.externalRsvpUrl || null,
        communityName,
        createdAt: (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: (data.updatedAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
      }
    }
  } catch (error) {
    console.error("Error fetching event from Firestore:", error)
  }
  
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

  const event = await getEventBySlug(slug)
    
  if (event) {
    const community = event.communityId ? await (async () => {
      try {
        const db = getDb()
        const doc = await db.collection(COLLECTIONS.COMMUNITIES).doc(event.communityId).get()
        if (doc.exists) return doc.data() as { name: string }
      } catch {}
      return null
    })() : null
    const eventDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Chicago",
    })
    
    // OG best practices: title under 60 chars, description 120-160 chars
    const title = `${event.title} | DEVSA`
    const description = `Join ${community?.name || 'the community'} on ${eventDate} in San Antonio. DEVSA bridges passionate builders, local partners, and the growing tech ecosystem.`
    
    return {
      title,
      description,
      openGraph: {
        title: event.title,
        description,
        url: `${siteUrl}/events/${slug}`,
        siteName: "DEVSA",
        images: [
          {
            url: `${siteUrl}/api/og/event/${slug}`,
            width: 1200,
            height: 630,
            alt: `${event.title} - ${community?.name || "DEVSA Community Event"}`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${siteUrl}/api/og/event/${slug}`],
      },
    }
  }

  // Fallback metadata if event not found
  const fallbackTitle = "Community Event | DEVSA"
  const fallbackDescription = "Join the San Antonio tech community. DEVSA bridges passionate builders, local partners, and the growing tech ecosystem."
  
  return {
    title: fallbackTitle,
    description: fallbackDescription,
    openGraph: {
      title: "Community Event",
      description: fallbackDescription,
      url: `${siteUrl}/events/${slug}`,
      siteName: "DEVSA",
      images: [
        {
          url: `${siteUrl}/api/og/event/${slug}`,
          width: 1200,
          height: 630,
          alt: "DEVSA Community Event",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Community Event | DEVSA",
      description: fallbackDescription,
      images: [`${siteUrl}/api/og/event/${slug}`],
    },
  }
}

/**
 * Event rich results — the date, venue and price Google shows inside the search
 * listing itself.
 *
 * These pages had none. /events, PySanAntonio, Access Granted and zero-to-agent
 * all emit structured data; the individual event pages, which are the ones most
 * likely to actually earn a rich result, emitted nothing. Every field here is
 * already fetched for the metadata above, so this costs no extra read.
 *
 * Server-rendered rather than added in the client component, because a crawler
 * that does not execute JavaScript still gets it.
 */
function eventJsonLd(
  event: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>,
  siteUrl: string
) {
  const url = `${siteUrl}/events/${event.slug}`

  // `endDate` is only emitted when the stored end time is real and after the
  // start — the same guard lib/event-display applies to the UI. Publishing an
  // inverted range in structured data would have search engines show an event
  // that ends before it begins.
  const start = new Date(event.date).getTime()
  const rawEnd = event.endTime ? new Date(event.endTime).getTime() : NaN
  const endDate =
    Number.isFinite(rawEnd) && rawEnd > start
      ? new Date(rawEnd).toISOString()
      : undefined

  const attendanceMode =
    event.eventType === "virtual"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : event.eventType === "hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode"

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: new Date(event.date).toISOString(),
    ...(endDate ? { endDate } : {}),
    eventAttendanceMode: attendanceMode,
    eventStatus: "https://schema.org/EventScheduled",
    // Plain text: the description is authored as markdown, and schema.org
    // expects prose, not syntax.
    description: event.description
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500),
    url,
    // Virtual events take a VirtualLocation; anything with a physical room gets
    // a Place with whatever address parts were actually recorded.
    location:
      event.eventType === "virtual"
        ? {
            "@type": "VirtualLocation",
            url: event.url || url,
          }
        : {
            "@type": "Place",
            name: event.venue || event.location,
            address: event.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: event.address,
                  addressLocality: "San Antonio",
                  addressRegion: "TX",
                  addressCountry: "US",
                }
              : {
                  "@type": "PostalAddress",
                  addressLocality: "San Antonio",
                  addressRegion: "TX",
                  addressCountry: "US",
                },
          },
    organizer: {
      "@type": "Organization",
      name: event.communityName,
      url: event.communityId
        ? `${siteUrl}/buildingtogether/${event.communityId}`
        : siteUrl,
    },
    image: [`${siteUrl}/api/og/event/${event.slug}`],
    // Every event on this calendar is free to attend. Stated explicitly because
    // "Free" is one of the few things Google renders in the listing itself, and
    // an Event without an `offers` block does not get it.
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: event.externalRsvpUrl || event.url || url,
      validFrom: new Date(
        (event.createdAt as string) || event.date
      ).toISOString(),
    },
    isAccessibleForFree: true,
  }
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"
  const event = await getEventBySlug(slug)

  return (
    <>
      {event && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventJsonLd(event, siteUrl)),
          }}
        />
      )}
      <EventPageClient slug={slug} />
    </>
  )
}
