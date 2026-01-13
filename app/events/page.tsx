import { Metadata } from "next"
import { FeaturedDevsaEvent } from "@/components/events/featured-devsa-event"
import { FeaturedOnDemandEvent } from "@/components/events/featured-on-demand-event"
import { CommunityEventsSection } from "@/components/events/community-events-section"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "Events | DEVSA Community Calendar",
  description: "Discover communities that align with your interests. DEVSA is the central hub where local groups collaborate, exchange resources, and build a more connected tech ecosystem.",
  keywords: [
    "San Antonio tech events",
    "tech meetups SA",
    "developer events",
    "programming workshops",
    "DEVSA events",
    "networking events San Antonio",
  ],
  openGraph: {
    title: "Events | DEVSA Community Calendar",
    description: "Discover communities that align with your interests. DEVSA is the central hub where local groups collaborate, exchange resources, and build a more connected tech ecosystem.",
    url: `${siteUrl}/events`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/events`,
        width: 1200,
        height: 630,
        alt: "DEVSA Community Events",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | DEVSA Community Calendar",
    description: "Discover communities that align with your interests. DEVSA is the central hub where local groups collaborate, exchange resources, and build a more connected tech ecosystem.",
    images: [`${siteUrl}/api/og/events`],
  },
}

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <FeaturedDevsaEvent />
      <CommunityEventsSection />
      <FeaturedOnDemandEvent />
    </main>
  )
}
