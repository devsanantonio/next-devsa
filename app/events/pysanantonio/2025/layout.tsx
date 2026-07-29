import type React from "react"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

export const metadata: Metadata = {
  title: "PySanAntonio 2025 — Sessions & Livestream | DEVSA",
  description:
    "The archive of PySanAntonio 2025, San Antonio's first Python conference: eight sessions, slide decks, and the full livestream from Geekdom on November 8, 2025.",
  keywords: [
    "PySanAntonio 2025",
    "PyTexas",
    "Python Conference",
    "San Antonio Python",
    "Alamo Python",
    "Geekdom",
    "Python talks",
    "DEVSA",
  ],
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  publisher: "Alamo Python",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/events/pysanantonio/2025",
  },
  // Share images come from the co-located opengraph-image.png — the 2025
  // lotería card. File-based metadata wins over anything set here, so this
  // block deliberately omits `images`.
  openGraph: {
    title: "PySanAntonio 2025 — Sessions & Livestream",
    description:
      "Eight sessions, slide decks, and the full livestream from San Antonio's first Python conference.",
    url: `${siteUrl}/events/pysanantonio/2025`,
    siteName: "DEVSA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PySanAntonio 2025 — Sessions & Livestream",
    description:
      "Eight sessions, slide decks, and the full livestream from San Antonio's first Python conference.",
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

export default function PySanAntonio2025Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "PySanAntonio 2025",
    description:
      "San Antonio's first Python conference, hosted by Alamo Python, DEVSA, and the PyTexas Foundation at Geekdom.",
    startDate: "2025-11-08T13:00:00-06:00",
    endDate: "2025-11-08T18:00:00-06:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Geekdom",
      address: {
        "@type": "PostalAddress",
        streetAddress: "131 Soledad St",
        addressLocality: "San Antonio",
        addressRegion: "TX",
        postalCode: "78205",
        addressCountry: "US",
      },
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
      { "@type": "Organization", name: "H-E-B", url: "https://www.heb.com/" },
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
