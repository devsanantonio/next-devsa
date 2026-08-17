import { Metadata } from "next"
import { FeaturedSastw } from "@/components/events/featured-sastw"
import { FeaturedOnDemandEvent } from "@/components/events/featured-on-demand-event"
import { CommunityEventsSection } from "@/components/events/community-events-section"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

export const metadata: Metadata = {
  title: "Tech Events & Meetups in San Antonio | DEVSA Community Calendar",
  description: "Find upcoming tech events, developer meetups, coding workshops, hackathons, and networking events in San Antonio. DEVSA aggregates 20+ community groups into one calendar so you never miss a local tech event.",
  keywords: [
    "San Antonio tech events",
    "tech meetups San Antonio",
    "developer events SA",
    "programming workshops San Antonio",
    "DEVSA events",
    "networking events San Antonio",
    "coding meetups SA",
    "hackathons San Antonio",
    "tech conferences Texas",
    "San Antonio developer meetups",
    "free tech events SA",
    "software engineering events",
    "AI meetups San Antonio",
    "Python meetups San Antonio",
    "JavaScript meetups SA",
    "tech community calendar",
    "Alamo City tech events",
    "South Texas tech meetups",
  ],
  alternates: {
    canonical: "/events",
    types: {
      "application/rss+xml": `${siteUrl}/api/events/feed`,
    },
  },
  openGraph: {
    title: "Tech Events & Meetups in San Antonio | DEVSA",
    description: "Find upcoming tech events, developer meetups, coding workshops, and networking events in San Antonio. 20+ community groups in one calendar.",
    url: `${siteUrl}/events`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/events`,
        width: 1200,
        height: 630,
        alt: "Tech Events & Meetups in San Antonio - DEVSA Community Calendar",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Events & Meetups in San Antonio | DEVSA",
    description: "Find upcoming tech events, developer meetups, coding workshops, and networking events in San Antonio. 20+ community groups in one calendar.",
    images: [`${siteUrl}/api/og/events`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

/**
 * No `revalidate`. It was set to an hour purely to keep the featured band's
 * call-for-speakers countdown accurate; with that line removed nothing this
 * page renders on the server expires — the event list, the search and the
 * month picker all fetch client-side, so they are live regardless of how long
 * the shell is cached.
 */
export default function EventsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Tech Events & Meetups in San Antonio",
            description: "Find upcoming tech events, developer meetups, coding workshops, hackathons, and networking events in San Antonio.",
            url: `${siteUrl}/events`,
            isPartOf: {
              "@type": "WebSite",
              name: "DEVSA",
              url: siteUrl,
            },
            about: {
              "@type": "Thing",
              name: "Technology Events in San Antonio",
            },
            provider: {
              "@type": "Organization",
              name: "DEVSA",
              url: siteUrl,
            },
          }),
        }}
      />
      {/* The featured band goes INSIDE the calendar section, between its
          headline and its list — not above it.

          It used to lead the page at full viewport height, which meant this
          page opened with no calendar visible on a laptop and no sign that one
          existed. On the surface every entry point calls "Community Calendar",
          and on the surface whose value is being the city's neutral index,
          that put a permanent promo above twenty other groups' events.

          Passed as a slot so the calendar never has to know what is currently
          featured — that rotates, and the page is what decides. */}
      <main className="min-h-screen bg-white text-gray-900">
        <CommunityEventsSection
          featured={<FeaturedSastw />}
        />
        <FeaturedOnDemandEvent />
      </main>
    </>
  )
}
