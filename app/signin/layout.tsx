import type React from "react"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const title = "Organizer Access"
const description =
  "One platform for everyone building San Antonio. Publish to the DEVSA community calendar, run your community page, and see who's coming — free for San Antonio tech communities."

/**
 * noindex, but the share card still matters: this is the link an organizer
 * passes to someone else running a group, so it gets unfurled in Slack and
 * iMessage far more often than it gets crawled.
 */
export const metadata: Metadata = {
  title,
  description,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: `${title} | DEVSA`,
    description,
    url: `${siteUrl}/signin`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/signin`,
        width: 1200,
        height: 630,
        alt: "One platform for everyone building San Antonio — DEVSA organizer access",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | DEVSA`,
    description,
    images: [`${siteUrl}/api/og/signin`],
  },
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
