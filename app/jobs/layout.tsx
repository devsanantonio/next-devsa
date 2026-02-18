import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/auth-provider"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "Jobs - San Antonio Tech Job Board",
  description:
    "Find tech jobs and hiring opportunities in San Antonio. Connect with local companies, startups, and developers building the future of the Alamo City tech ecosystem.",
  keywords: [
    "San Antonio tech jobs",
    "DEVSA jobs",
    "developer jobs SA",
    "tech hiring San Antonio",
    "software engineer jobs",
    "startup jobs San Antonio",
    "contract work tech",
    "remote tech jobs",
    "San Antonio startups",
    "tech careers Texas",
  ],
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    title: "DEVSA Jobs - San Antonio Tech Job Board",
    description:
      "Find tech jobs and hiring opportunities in San Antonio. Connect with local companies, startups, and developers in the DEVSA community.",
    url: `${siteUrl}/jobs`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/jobs`,
        width: 1200,
        height: 630,
        alt: "DEVSA Jobs - San Antonio Tech Job Board",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVSA Jobs - San Antonio Tech Job Board",
    description:
      "Find tech jobs and hiring opportunities in San Antonio. Connect with local companies, startups, and developers in the DEVSA community.",
    images: [`${siteUrl}/api/og/jobs`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
