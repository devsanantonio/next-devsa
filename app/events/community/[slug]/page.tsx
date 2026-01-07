import { Metadata } from "next"
import { EventPageClient } from "./event-page-client"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { techCommunities } from "@/data/communities"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

  // Fetch event data from Convex
  try {
    const event = await fetchQuery(api.events.getEventBySlug, { slug })
    
    if (event) {
      const community = techCommunities.find((c) => c.id === event.communityId)
      const eventDate = new Date(event.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      
      const title = `${event.title} | DEVSA Community`
      const description = `${event.description.slice(0, 150)}${event.description.length > 150 ? "..." : ""} - ${eventDate} at ${event.location}`
      
      return {
        title,
        description,
        openGraph: {
          title,
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
  } catch (error) {
    console.error("Error fetching event metadata:", error)
  }

  // Fallback metadata if event not found
  return {
    title: `Event | DEVSA Community`,
    description: "Join the San Antonio tech community for this upcoming event.",
    openGraph: {
      title: `Event | DEVSA Community`,
      description: "Join the San Antonio tech community for this upcoming event.",
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
      title: `Event | DEVSA Community`,
      description: "Join the San Antonio tech community for this upcoming event.",
      images: [`${siteUrl}/api/og/event/${slug}`],
    },
  }
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params
  return <EventPageClient slug={slug} />
}
