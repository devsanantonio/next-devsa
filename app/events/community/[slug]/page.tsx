import { Metadata } from "next"
import { EventPageClient } from "./event-page-client"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

  // In a real app, you'd fetch this from Convex
  // For now, we'll use dynamic OG image generation
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
