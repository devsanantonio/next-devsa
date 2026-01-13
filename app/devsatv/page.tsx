import { Metadata } from "next"
import { DevsaTVPage } from "@/components/devsatv/devsatv-page"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "DEVSA TV | The Content Engine for San Antonio Tech",
  description: "Transform authentic community stories into premium, sponsor-ready content through documentary-style production. DEVSA TV leverages the living ecosystem that DEVSA created.",
  keywords: [
    "DEVSA TV",
    "San Antonio tech",
    "tech content",
    "documentary production",
    "sponsored workshops",
    "tech conferences",
    "More Human Than Human",
    "AI Conference",
    "PySanAntonio",
    "content sponsorship",
  ],
  openGraph: {
    title: "DEVSA TV | The Content Engine for San Antonio Tech",
    description: "Transform authentic community stories into premium, sponsor-ready content through documentary-style production.",
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
    title: "DEVSA TV | The Content Engine for San Antonio Tech",
    description: "Transform authentic community stories into premium, sponsor-ready content through documentary-style production.",
    images: [`${siteUrl}/api/og/devsatv`],
  },
}

export default function DevsaTVRoute() {
  return <DevsaTVPage />
}
