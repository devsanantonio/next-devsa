import { Metadata } from "next"
import { EventPageClient } from "./event-page-client"
import { techCommunities } from "@/data/communities"
import { initialCommunityEvents } from "@/data/events"
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
      const community = techCommunities.find(c => c.id === data.communityId)
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        date: data.date,
        endTime: data.endTime,
        location: data.location,
        description: data.description,
        url: data.url,
        communityId: data.communityId,
        organizerEmail: data.organizerEmail,
        source: data.source,
        status: data.status,
        rsvpEnabled: data.rsvpEnabled,
        communityName: community?.name || 'DEVSA Community',
        createdAt: (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: (data.updatedAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
      }
    }
  } catch (error) {
    console.error("Error fetching event from Firestore:", error)
  }
  
  // Fallback to static events
  const staticEvent = initialCommunityEvents.find(e => e.slug === slug)
  if (staticEvent) {
    return {
      ...staticEvent,
      communityId: staticEvent.communityTag,
    }
  }
  
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

  const event = await getEventBySlug(slug)
    
  if (event) {
    const community = techCommunities.find((c) => c.id === event.communityId)
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

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params
  return <EventPageClient slug={slug} />
}
