import type { Metadata } from "next"
import { CoworkingSpaceClient } from "./coworking-space-client"
import { ClosingNotice } from "@/components/coworking-space/closing-notice"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

export const metadata: Metadata = {
  title: "The DEVSA Community Space, 2024–2026",
  description:
    "DEVSA's community space at Geekdom on Houston Street closed on 19 September 2026. Our programming and community meetups at Geekdom continue, and every one of them is on the Community Calendar.",
  /* No keyword list. It read "free office space SA", "community workspace",
     "free meeting space" — terms for a service that no longer exists, and the
     last thing this page should do is win a search for one. */
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  publisher: "DEVSA",
  alternates: {
    canonical: "/coworking-space",
  },
  openGraph: {
    title: "The DEVSA Community Space, 2024–2026",
    description:
      "DEVSA's community space at Geekdom on Houston Street closed on 19 September 2026. Our programming and community meetups at Geekdom continue, and every one of them is on the Community Calendar.",
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
    title: "The DEVSA Community Space, 2024–2026",
    description:
      "DEVSA's community space at Geekdom on Houston Street closed on 19 September 2026. Our programming and community meetups at Geekdom continue, and every one of them is on the Community Calendar.",
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
      {/* The CoworkingSpace schema that sat here is gone. It described an
          open venue — amenities, opening hours, priceRange "Free",
          isAccessibleForFree — and structured data is a machine-readable
          claim. Left in place it would have kept telling search engines the
          room was available to walk into. */}
      <ClosingNotice />
      <CoworkingSpaceClient />
    </>
  )
}
