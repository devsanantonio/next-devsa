import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/auth-provider"
import { JobsLayoutShell } from "@/components/jobs/jobs-layout-shell"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "Bounties — Local Work, Local Talent | DEVSA",
  description:
    "Bite-sized dev projects posted by local nonprofits and startups — claimed by builders across San Antonio, the I-35 corridor, and the Rio Grande Valley. Fund the bounty, pick a builder, pay on delivery. 8% supports DEVSA programming.",
  keywords: [
    "San Antonio dev bounties",
    "nonprofit dev help San Antonio",
    "tech bounty board",
    "South Texas freelance dev",
    "local nonprofit tech projects",
    "DEVSA bounties",
    "I-35 corridor freelance",
    "Rio Grande Valley tech work",
    "startup project marketplace",
    "fund developer projects San Antonio",
    "501(c)(3) bounty program",
    "claim dev work San Antonio",
  ],
  alternates: {
    canonical: "/bounties",
  },
  openGraph: {
    title: "Local Work. Local Talent. DEVSA Bounties.",
    description:
      "Bite-sized dev projects from local nonprofits and startups, claimed by builders across South Texas. Escrow at posting; pay on delivery. 8% funds DEVSA workshops, conferences, and the downtown coworking space.",
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
      "Bite-sized dev projects from local nonprofits and startups, claimed by builders across South Texas. 8% funds DEVSA programming.",
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
            description: "Bite-sized dev projects posted by local nonprofits and startups, claimed by builders across San Antonio, the I-35 corridor, and the Rio Grande Valley.",
            url: `${siteUrlValue}/bounties`,
            isPartOf: {
              "@type": "WebSite",
              name: "DEVSA",
              url: siteUrlValue,
            },
            about: {
              "@type": "Thing",
              name: "Dev bounties and local tech projects in South Texas",
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
