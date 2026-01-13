import { Metadata } from "next"
import { MoreHumanThanHuman } from "@/components/aiconference/more-human-than-human"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "More Human Than Human | DEVSA AI Conference 2026",
  description: "Join us for the DEVSA AI Conference on February 28th, 2026 at Geekdom. Where builders, dreamers, and technologists as we explore how AI is transforming the way we write code, test, automate, and ship.",
  keywords: [
    "AI conference",
    "artificial intelligence",
    "San Antonio tech",
    "DEVSA",
    "machine learning",
    "call for speakers",
    "tech conference 2026",
    "Geekdom",
    "More Human Than Human",
  ],
  openGraph: {
    title: "More Human Than Human | DEVSA AI Conference 2026",
    description: "Join us for the DEVSA AI Conference on February 28th, 2026 at Geekdom. Where builders, dreamers, and technologists as we explore how AI is transforming the way we write code, test, automate, and ship.",
    url: `${siteUrl}/events/morehumanthanhuman`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/morehumanthanhuman`,
        width: 1200,
        height: 630,
        alt: "More Human Than Human - DEVSA AI Conference 2026",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "More Human Than Human | DEVSA AI Conference 2026",
    description: "Join us for the DEVSA AI Conference on February 28th, 2026 at Geekdom. Where builders, dreamers, and technologists as we explore how AI is transforming the way we write code, test, automate, and ship.",
    images: [`${siteUrl}/api/og/morehumanthanhuman`],
  },
}

export default function MoreHumanThanHumanPage() {
  return <MoreHumanThanHuman />
}
