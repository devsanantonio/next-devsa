import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/auth-provider"
import { JobsLayoutShell } from "@/components/jobs/jobs-layout-shell"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "The Opportunity Pipeline — Post Once, Reach Every Developer",
  description:
    "Post once and your listing is automatically shared across our website, Discord, and LinkedIn — reaching developers, designers, and engineers across San Antonio, the I-35 corridor, and the Rio Grande Valley. Free during our Community Launch.",
  keywords: [
    "San Antonio tech jobs",
    "DEVSA jobs",
    "post tech jobs San Antonio",
    "hire developers San Antonio",
    "tech hiring South Texas",
    "I-35 corridor jobs",
    "Rio Grande Valley tech jobs",
    "startup jobs San Antonio",
    "New Braunfels tech jobs",
    "San Marcos tech jobs",
    "local job board Texas",
    "free job posting San Antonio",
  ],
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    title: "Post Once. Reach Every Developer in South Texas.",
    description:
      "Your listing is automatically shared across our website, Discord, and LinkedIn. Free during our Community Launch. DEVSA is a 501(c)(3) nonprofit bridging 20+ tech community groups and local talent.",
    url: `${siteUrl}/jobs`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/jobs`,
        width: 1200,
        height: 630,
        alt: "DEVSA — Post Once, Reach Every Developer in South Texas",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Post Once. Reach Every Developer in South Texas.",
    description:
      "Your listing is automatically shared across our website, Discord, and LinkedIn. Free during our Community Launch. DEVSA is a 501(c)(3) nonprofit bridging 20+ tech community groups and local talent.",
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
  return (
    <AuthProvider>
      <JobsLayoutShell>{children}</JobsLayoutShell>
    </AuthProvider>
  )
}
