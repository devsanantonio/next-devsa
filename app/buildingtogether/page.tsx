import { Metadata } from "next"
import { GroupsHero } from "@/components/partners/groups-hero"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "Partners + Communities | DEVSA",
  description: "Our platform is bridging the gap between passionate builders, local partners, and the growing tech ecosystem in San Antonio.",
  openGraph: {
    title: "Partners + Communities | DEVSA",
    description: "Our platform is bridging the gap between passionate builders, local partners, and the growing tech ecosystem in San Antonio.",
    url: `${siteUrl}/buildingtogether`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/buildingtogether`,
        width: 1200,
        height: 630,
        alt: "DEVSA Tech Groups - Building Together",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partners + Communities | DEVSA",
    description: "Our platform is bridging the gap between passionate builders, local partners, and the growing tech ecosystem in San Antonio.",
    images: [`${siteUrl}/api/og/buildingtogether`],
  },
}

export default function GroupsPage() {
  return (
    <main className="min-h-screen bg-black">
      <GroupsHero />
    </main>
  )
}
