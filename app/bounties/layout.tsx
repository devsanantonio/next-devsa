import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/auth-provider"
import { JobsLayoutShell } from "@/components/jobs/jobs-layout-shell"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "Bounties — Local Work, Local Talent | DEVSA",
  description:
    "Bite-sized dev projects from community groups and partners — claimed by builders in the DEVSA network. Fund the bounty, pick a builder, pay on delivery. 8% supports DEVSA programming.",
  keywords: [
    "DEVSA bounties",
    "tech bounty board",
    "dev projects for builders",
    "community group developer projects",
    "partner sponsored dev work",
    "nonprofit tech bounties",
    "claim a dev bounty",
    "fund a developer project",
    "developer community marketplace",
    "501(c)(3) bounty program",
    "Building Together",
  ],
  alternates: {
    canonical: "/bounties",
  },
  openGraph: {
    title: "Local Work. Local Talent. DEVSA Bounties.",
    description:
      "Bite-sized dev projects from community groups and partners, claimed by builders in the DEVSA network. Escrow at posting; pay on delivery. 8% funds DEVSA workshops, conferences, and the downtown coworking space.",
    url: `${siteUrl}/bounties`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/bounties`,
        width: 1200,
        height: 630,
        alt: "DEVSA Bounties — Local Work, Local Talent",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Work. Local Talent. DEVSA Bounties.",
    description:
      "Bite-sized dev projects from community groups and partners, claimed by builders in the DEVSA network. 8% funds DEVSA programming.",
    images: [`${siteUrl}/api/og/bounties`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrlValue = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"
  return (
    <AuthProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "DEVSA Bounties — Local Work, Local Talent",
            description: "Bite-sized dev projects from community groups and partners, claimed by builders in the DEVSA network.",
            url: `${siteUrlValue}/bounties`,
            isPartOf: {
              "@type": "WebSite",
              name: "DEVSA",
              url: siteUrlValue,
            },
            about: {
              "@type": "Thing",
              name: "Dev bounties for community groups, partners, and builders",
            },
            provider: {
              "@type": "Organization",
              name: "DEVSA",
              url: siteUrlValue,
              nonprofitStatus: "501(c)(3)",
            },
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrlValue}/bounties?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <JobsLayoutShell>{children}</JobsLayoutShell>
    </AuthProvider>
  )
}
