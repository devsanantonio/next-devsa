import type React from "react"
import type { Metadata } from "next"
import { PYSA_2026, SASTW_URL } from "@/data/pysa/2026"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

/**
 * Written in the past tense, because the event is in the past.
 *
 * The title said "PySanAntonio — San Antonio's Python Conference | DEVSA" in
 * three places — the page title, the OpenGraph title and the Twitter title —
 * and went on saying it after the conference ran on 2 October 2026 and after
 * the call closed on 25 September. Every search result and every share of this
 * URL was promising a dated event and an open speaker call, both expired.
 *
 * The page's own components never had this problem: getCfsPhase() computes
 * from CFS_CLOSES and the OG card already flips to "Python conference". Only
 * these strings were hardcoded, which is exactly why they rotted — a constant
 * cannot notice a date passing.
 *
 * The brand is `returning` in data/conferences.ts, so the title names the
 * conference rather than an occurrence of it. That is the form that does not
 * need editing the day after the next one runs; when a date for the third is
 * set it belongs here as an addition, not as the whole title.
 */
const description =
  "PySanAntonio is San Antonio's Python conference, led by Alamo Python with the PyTexas Foundation and DEVSA. The second edition ran on October 2, 2026 at Geekdom as part of SA Startup + Tech Week — an afternoon of talks, networking and community building for the city's Python community."

export const metadata: Metadata = {
  title: "PySanAntonio — San Antonio's Python Conference | DEVSA",
  description,
  keywords: [
    "PySanAntonio",
    "PySanAntonio 2026",
    "PyTexas",
    "Python Conference",
    "San Antonio Python",
    "Alamo Python",
    "Geekdom",
    "SA Startup Week",
    "SA Tech Week",
    "Python Meetup",
    "Tech Conference San Antonio",
    "DEVSA",
  ],
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  publisher: "Alamo Python",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/events/pysanantonio",
  },
  openGraph: {
    title: "PySanAntonio — San Antonio's Python Conference | DEVSA",
    description,
    url: `${siteUrl}/events/pysanantonio`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/pysanantonio`,
        width: 1200,
        height: 630,
        alt: "PySanAntonio II — October 2, 2026 at Geekdom, San Antonio",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PySanAntonio — San Antonio's Python Conference | DEVSA",
    description,
    images: [`${siteUrl}/api/og/pysanantonio`],
    creator: "@devsatx",
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

export default function PySanAntonioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: PYSA_2026.name,
    description,
    startDate: PYSA_2026.start,
    endDate: PYSA_2026.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${siteUrl}/events/pysanantonio`,
    location: {
      "@type": "Place",
      name: PYSA_2026.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: PYSA_2026.address.street,
        addressLocality: PYSA_2026.address.city,
        addressRegion: PYSA_2026.address.region,
        postalCode: PYSA_2026.address.postalCode,
        addressCountry: PYSA_2026.address.country,
      },
    },
    // The week that contains this event — the schema.org-correct way to say
    // "part of SA Startup + Tech Week" rather than listing it as an organizer.
    superEvent: {
      "@type": "Event",
      name: PYSA_2026.superEvent.name,
      startDate: PYSA_2026.superEvent.start,
      endDate: PYSA_2026.superEvent.end,
      url: SASTW_URL,
    },
    organizer: [
      {
        "@type": "Organization",
        name: "Alamo Python",
        url: "https://www.meetup.com/alamo-python/",
      },
      {
        "@type": "Organization",
        name: "PyTexas Foundation",
        url: "https://www.pytexas.org/",
      },
      {
        "@type": "Organization",
        name: "DEVSA",
        url: "https://www.devsa.community/",
      },
    ],
    sponsor: [
      { "@type": "Organization", name: "Geekdom", url: "https://geekdom.com/" },
    ],
    performer: { "@type": "Organization", name: "Python Community" },
    image: `${siteUrl}/api/og/pysanantonio`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
