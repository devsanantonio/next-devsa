import type { Metadata } from "next"
import { CoworkingSpaceClient } from "./coworking-space-client"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "DEVSA Community Space in Downtown San Antonio",
  description:
    "When we first started DEVSA, we never planned to have a physical community space. Thanks to Geekdom we have one right in the heart of downtown San Antonio that's available to our growing tech community.",
  keywords: [
    "San Antonio",
    "DEVSA community space",
    "downtown San Antonio coworking",
    "free office space SA",
    "tech coworking space",
    "Geekdom Houston Street",
    "community workspace",
    "volunteer-managed space",
    "free parking downtown SA",
    "tech community workspace",
    "collaborative workspace San Antonio",
    "startup workspace",
    "developer workspace",
    "community-driven coworking",
    "downtown workspace",
    "San Antonio tech hub",
    "free meeting space",
    "community access Discord",
    "Houston Street workspace",
    "Alamo City coworking",
  ],
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  publisher: "DEVSA",
  alternates: {
    canonical: "/coworking-space",
  },
  openGraph: {
    title: "DEVSA Community Space Downtown San Antonio",
    description:
      "When we first started DEVSA, we never planned to have a physical community space. Thanks to Geekdom we have one right in the heart of downtown San Antonio that's available to our growing tech community.",
    url: `${siteUrl}/coworking-space`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/coworking-space`,
        width: 1200,
        height: 630,
        alt: "DEVSA Community Space in Downtown San Antonio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVSA Community Space Downtown San Antonio",
    description:
      "When we first started DEVSA, we never planned to have a physical community space. Thanks to Geekdom we have one right in the heart of downtown San Antonio that's available to our growing tech community.",
    images: [`${siteUrl}/api/og/coworking-space`],
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

export default function CoworkingSpacePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CoworkingSpace",
            name: "DEVSA Community Coworking Space",
            description: "When we first started DEVSA, we never planned to have a physical community space. Thanks to Geekdom we have one right in the heart of downtown San Antonio that's available to our growing tech community.",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"}/coworking-space`,
            address: {
              "@type": "PostalAddress",
              streetAddress: "131 Houston Street",
              addressLocality: "San Antonio",
              addressRegion: "TX",
              postalCode: "78205",
              addressCountry: "US",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "29.4241",
              longitude: "-98.4936",
            },
            telephone: "",
            email: "",
            priceRange: "Free",
            amenityFeature: [
              {
                "@type": "LocationFeatureSpecification",
                name: "Free WiFi",
                value: true,
              },
              {
                "@type": "LocationFeatureSpecification", 
                name: "Meeting Rooms",
                value: true,
              },
              {
                "@type": "LocationFeatureSpecification",
                name: "Community Access",
                value: true,
              },
              {
                "@type": "LocationFeatureSpecification",
                name: "Downtown Parking",
                value: true,
              },
            ],
            openingHours: "By appointment via Discord community",
            isAccessibleForFree: true,
            managedBy: {
              "@type": "Organization",
              name: "DEVSA",
              url: "https://devsa.community",
            },
            parentOrganization: {
              "@type": "Organization", 
              name: "Geekdom",
              url: "https://geekdom.com",
            },
            photos: [
              "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6350.jpg",
              "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_7186.jpg",
              "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_5061.jpg",
            ],
          }),
        }}
      />
      <CoworkingSpaceClient />
    </>
  )
}
