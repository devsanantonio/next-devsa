import type React from "react"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "PySanAntonio 2025 | PyTexas Conference in San Antonio",
  description:
    "Join us for PySanAntonio on Saturday, November 8, 2025 at Geekdom. A half-day PyTexas conference hosted by Alamo Python featuring talks, networking, and celebrating the Python community in San Antonio, Texas.",
  keywords: [
    "PySanAntonio",
    "PyTexas",
    "Python Conference",
    "San Antonio Python",
    "Alamo Python",
    "Geekdom",
    "Python Meetup",
    "Tech Conference San Antonio",
    "Python Developers",
    "Programming Conference",
    "Texas Python",
    "DEVSA",
  ],
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  publisher: "Alamo Python",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/pysananantonio",
  },
  openGraph: {
    title: "PySanAntonio 2025 | PyTexas Conference",
    description:
      "Join us for a half-day PyTexas conference in San Antonio on November 8, 2025. Hosted by Alamo Python at Geekdom.",
    url: `${siteUrl}/pysananantonio`,
    siteName: "DEVSA Community",
    images: [
      {
        url: `${siteUrl}/pysananantonio/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "PySanAntonio 2025 - PyTexas Conference in San Antonio",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PySanAntonio 2025 | PyTexas Conference",
    description:
      "Join us for a half-day PyTexas conference in San Antonio on November 8, 2025. Hosted by Alamo Python at Geekdom.",
    images: [`${siteUrl}/pysananantonio/opengraph-image.png`],
    creator: "@devsacommunity",
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

export default function PySanAntonioLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "PySanAntonio 2025",
    description:
      "A half-day PyTexas conference hosted by Alamo Python featuring talks, networking, and celebrating the Python community in San Antonio.",
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
    ],
    sponsor: [
      {
        "@type": "Organization",
        name: "Geekdom",
        url: "https://geekdom.com/",
      },
      {
        "@type": "Organization",
        name: "DEVSA",
        url: "https://devsa.community/",
      },
    ],
    offers: {
      "@type": "Offer",
      url: "https://www.meetup.com/alamo-python/events/311325578/",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: "2025-01-01T00:00:00-06:00",
    },
    performer: {
      "@type": "Organization",
      name: "Python Community",
    },
    image: `${process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"}/pysananantonio/opengraph-image.png`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
