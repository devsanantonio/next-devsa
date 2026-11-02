import type React from "react"
import type { Metadata } from "next"
import { ACCESS_GRANTED, SASTW_URL } from "@/data/access-granted/2026"
import { jsonLdScript } from "@/lib/json-ld"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

// Written for after the first edition. It used to advertise the open call for
// speakers and volunteers, a career corner and a threat-modeling workshop, and
// say "this week", all of which went stale on October 1.
const description =
  "Access Granted is DEVSA's free security conference in San Antonio. Every other room is people talking about technology; this one is people taking it apart. The first edition ran September 30, 2026 at Geekdom during SA Startup + Tech Week: seven hacker talks and a lockpicking village, powered by BSides San Antonio, DEF CON Group San Antonio, the San Antonio Hackers Association, UTSA CyberJedis and Alamo City Locksport."

const title = "Access Granted — DEVSA's security conference in San Antonio"

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Access Granted",
    "Access Granted San Antonio",
    "San Antonio cybersecurity",
    "BSides San Antonio",
    "DEF CON Group San Antonio",
    "DC210",
    "San Antonio Hackers Association",
    "UTSA CyberJedis",
    "Alamo City Locksport",
    "lockpicking village",
    "SA Startup Week",
    "SA Tech Week",
    "Geekdom",
    "cybersecurity conference San Antonio",
    "DEVSA",
  ],
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/events/access-granted",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/events/access-granted`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/access-granted`,
        width: 1200,
        height: 630,
        alt: "Access Granted — September 30, 2026 at Geekdom, San Antonio",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}/api/og/access-granted`],
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

export default function AccessGrantedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ACCESS_GRANTED.name,
    description,
    startDate: ACCESS_GRANTED.start,
    endDate: ACCESS_GRANTED.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${siteUrl}/events/access-granted`,
    // Free and drop-in, which is worth saying in structured data — it is the
    // first thing the badges say on the page too.
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      url: `${siteUrl}/events/access-granted`,
    },
    location: {
      "@type": "Place",
      name: ACCESS_GRANTED.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: ACCESS_GRANTED.address.street,
        addressLocality: ACCESS_GRANTED.address.city,
        addressRegion: ACCESS_GRANTED.address.region,
        postalCode: ACCESS_GRANTED.address.postalCode,
        addressCountry: ACCESS_GRANTED.address.country,
      },
    },
    // The week that contains this event — the schema.org-correct way to say
    // "part of SA Startup + Tech Week" rather than listing it as an organizer.
    superEvent: {
      "@type": "Event",
      name: ACCESS_GRANTED.superEvent.name,
      startDate: ACCESS_GRANTED.superEvent.start,
      endDate: ACCESS_GRANTED.superEvent.end,
      url: SASTW_URL,
    },
    // DEVSA's conference. The groups on the wall powered the first edition
    // and are named in the description; this used to list all six as
    // organizers, which said the conference was theirs.
    organizer: {
      "@type": "Organization",
      name: "DEVSA",
      url: "https://www.devsa.community/",
    },
    sponsor: [
      { "@type": "Organization", name: "Geekdom", url: "https://geekdom.com/" },
    ],
    image: `${siteUrl}/api/og/access-granted`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {children}
    </>
  )
}
