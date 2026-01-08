import { Metadata } from "next"
import { EventPageClient } from "./event-page-client"
import { techCommunities } from "@/data/communities"
import { initialCommunityEvents } from "@/data/events"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getEventBySlug(slug: string) {
  // Try to fetch from Firestore API
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/events`, { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      const event = data.events?.find((e: { slug: string }) => e.slug === slug)
      if (event) return event
    }
  } catch (error) {
    console.error("Error fetching event from API:", error)
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
        url: `${siteUrl}/events/community/${slug}`,
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
      url: `${siteUrl}/events/community/${slug}`,
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
