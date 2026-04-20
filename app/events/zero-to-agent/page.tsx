import { Metadata } from "next"
import { ZeroToAgentResources } from "@/components/events/zero-to-agent-resources"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "Zero to Agent — Vercel Global Build Week | San Antonio | DEVSA",
  description:
    "DEVSA is the official San Antonio community partner for Zero to Agent — a 10-day global initiative to ship AI agents with the Vercel AI SDK, v0, and AI Gateway. April 25, 2026 at Geekdom. $30 in v0 credits, $6K+ global prize pool, and limited edition swag.",
  keywords: [
    "Zero to Agent",
    "Vercel hackathon",
    "AI agents",
    "Vercel AI SDK",
    "v0 by Vercel",
    "AI Gateway",
    "MCP",
    "Model Context Protocol",
    "ChatSDK",
    "Workflow Development Kit",
    "WDK",
    "San Antonio hackathon",
    "DEVSA",
    "Geekdom",
    "AI hackathon San Antonio",
    "build AI agents",
    "Vercel community event",
    "global build week",
    "developer event San Antonio",
  ],
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  publisher: "DEVSA",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/events/zero-to-agent",
  },
  openGraph: {
    title: "Zero to Agent — Find Your People. Build Your Future.",
    description:
      "Ship real AI agents at San Antonio's official Zero to Agent pop-up. $30 in v0 credits, $6K+ global prize pool, and 3 hackathon tracks. April 25, 2026 at Geekdom.",
    url: `${siteUrl}/events/zero-to-agent`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/zero-to-agent`,
        width: 1200,
        height: 630,
        alt: "Zero to Agent — Vercel Global Build Week in San Antonio",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero to Agent — Find Your People. Build Your Future.",
    description:
      "Ship real AI agents at San Antonio's official Zero to Agent pop-up. $30 in v0 credits, $6K+ global prize pool, and 3 hackathon tracks. April 25 at Geekdom.",
    images: [`${siteUrl}/api/og/zero-to-agent`],
    creator: "@devsatx",
    site: "@devsatx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function ZeroToAgentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: "Zero to Agent — Vercel Global Build Week",
            description:
              "DEVSA is the official San Antonio community partner for Zero to Agent — a 10-day global initiative to ship AI agents with the Vercel AI SDK, v0, and AI Gateway.",
            startDate: "2026-04-25T12:00:00-05:00",
            endDate: "2026-04-25T14:30:00-05:00",
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: "Geekdom",
              address: {
                "@type": "PostalAddress",
                addressLocality: "San Antonio",
                addressRegion: "TX",
                addressCountry: "US",
              },
            },
            organizer: {
              "@type": "Organization",
              name: "DEVSA",
              url: siteUrl,
            },
            image: `${siteUrl}/api/og/zero-to-agent`,
            url: `${siteUrl}/events/zero-to-agent`,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: "https://luma.com/hwfvt791",
            },
          }),
        }}
      />
      <main className="min-h-screen bg-black text-white overflow-x-hidden">
        <ZeroToAgentResources />
      </main>
    </>
  )
}
