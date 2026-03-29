import { Metadata } from "next"
import { DevsaTVPage } from "@/components/devsatv/devsatv-page"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "DEVSA TV | Tech Content & Documentary Production in San Antonio",
  description: "Watch authentic San Antonio tech community stories, conference talks, and developer interviews. DEVSA TV transforms local tech culture into premium documentary-style content.",
  keywords: [
    "DEVSA TV",
    "San Antonio tech videos",
    "tech content creation",
    "documentary production San Antonio",
    "tech conference recordings",
    "developer interviews SA",
    "More Human Than Human AI conference",
    "PySanAntonio talks",
    "tech community content",
    "San Antonio tech scene",
    "tech YouTube San Antonio",
    "developer community videos",
  ],
  openGraph: {
    title: "DEVSA TV | Tech Content & Documentary Production in San Antonio",
    description: "Watch authentic San Antonio tech community stories, conference talks, and developer interviews transformed into premium documentary-style content.",
    url: `${siteUrl}/devsatv`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/devsatv`,
        width: 1200,
        height: 630,
        alt: "DEVSA TV - The Content Engine for San Antonio Tech",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVSA TV | Tech Content & Documentary Production in San Antonio",
    description: "Watch authentic San Antonio tech community stories, conference talks, and developer interviews transformed into premium documentary-style content.",
    images: [`${siteUrl}/api/og/devsatv`],
  },
}

export default function DevsaTVRoute() {
  return <DevsaTVPage />
}
