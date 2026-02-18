import type React from "react"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "PySanAntonio 2025 | Python Conference in San Antonio",
  description:
    "PySanAntonio, A Python conference hosted by Alamo Python, DEVSA, and the PyTexas Foundation featuring talks, networking, and celebrating the different industries building with Python from our community in San Antonio, Texas.",
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
    canonical: "/events/pysanantonio",
  },
  openGraph: {
    title: "PySanAntonio 2025 | Python Conference",
    description:
      "PySanAntonio, Python conference hosted by Alamo Python, DEVSA, and the PyTexas Foundation at Geekdom.",
    url: `${siteUrl}/events/pysanantonio`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/pysanantonio`,
        width: 1200,
        height: 630,
        alt: "PySanAntonio 2025 - Python Conference in San Antonio",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PySanAntonio 2025 | Python Conference",
    description:
      "PySanAntonio, Python conference hosted by Alamo Python, DEVSA, and the PyTexas Foundation at Geekdom.",
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

export default function PySanAntonioLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "PySanAntonio 2025",
    description:
      "A Python conference hosted by Alamo Python, DEVSA, and the PyTexas Foundation featuring talks, networking, and celebrating the different industries building with Python from our community in San Antonio.",
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
    image: `${process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"}/api/og/pysanantonio`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
