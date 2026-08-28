import type React from "react"
import type { Metadata } from "next"
import { PYSA_2026, SASTW_URL } from "@/data/pysa/2026"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const description =
  "PySanAntonio II — Friday, October 2, 2026 at Geekdom, part of SA Startup + Tech Week. An afternoon of learning, networking, and community building for San Antonio's Python community, led by Alamo Python with the PyTexas Foundation and DEVSA. Call for speakers open through September 11."

export const metadata: Metadata = {
  title: "PySanAntonio II — Oct 2, 2026 | Call for Speakers Open",
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
    "call for speakers",
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
    title: "PySanAntonio II — Oct 2, 2026 | Call for Speakers Open",
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
    title: "PySanAntonio II — Oct 2, 2026 | Call for Speakers Open",
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
