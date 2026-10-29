import type { Metadata } from "next"
import { TvHero } from "@/components/tv/tv-hero"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const TITLE = "DEVSA TV — Coming to TVSA This December"
const SHORT =
  "DEVSA programming is coming to TVSA, San Antonio's public access channel, this December: the groups, speakers and builders DEVSA connects, on Spectrum 20, Grande 19 and AT&T 99 and on DEVSA's YouTube. Air dates and times coming soon."

/**
 * DEVSA TV: one page on its own route (not under /events). TVSA approved DEVSA
 * programming on 2026-10-29; first episodes air in December 2026, with dates
 * and times still to be set. See components/tv/tv-hero.tsx for what the page
 * may claim, and update SHORT, the hero's schedule and lib/llms.ts together
 * when the schedule lands.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: SHORT,
  alternates: { canonical: "/tv" },
  openGraph: {
    title: TITLE,
    description: SHORT,
    url: `${siteUrl}/tv`,
    siteName: "DEVSA",
    type: "website",
    images: [
      {
        url: `${siteUrl}/api/og/tv`,
        width: 1200,
        height: 630,
        alt: "DEVSA is coming to your TV: from the meetup room to your living room, on TVSA this December",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SHORT,
    images: [`${siteUrl}/api/og/tv`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

export default function TvPage() {
  return (
    <>
      {/* What the page is, for search and for assistants: a TV series from DEVSA on
          TVSA's public access channel, starting December 2026, episodes also on YouTube. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: TITLE,
            url: `${siteUrl}/tv`,
            description: SHORT,
            mainEntity: {
              "@type": "TVSeries",
              name: "DEVSA TV",
              description:
                "Programming from DEVSA, San Antonio's tech community nonprofit, featuring the groups, speakers and builders it connects.",
              startDate: "2026-12",
              inLanguage: "en-US",
              productionCompany: { "@type": "Organization", name: "DEVSA", url: siteUrl },
              publication: {
                "@type": "BroadcastEvent",
                publishedOn: {
                  "@type": "BroadcastService",
                  name: "TVSA",
                  description: "The City of San Antonio's public access channel",
                  areaServed: { "@type": "City", name: "San Antonio, Texas" },
                },
              },
              sameAs: ["https://www.youtube.com/@devsatx"],
            },
          }),
        }}
      />
      <main className="bg-[#161616]">
        <TvHero />
      </main>
    </>
  )
}
