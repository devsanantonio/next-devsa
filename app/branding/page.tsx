import type { Metadata } from "next"
import { BrandingKitPage } from "@/components/branding/branding-kit-page"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

// The root template appends " | DEVSA" to the <title>; share cards get the full name.
const TITLE = "Branding Kit — Logos, Colors and Conference Wordmarks"
const SHARE_TITLE = "DEVSA Branding Kit — Logos, Colors and Conference Wordmarks"
const DESCRIPTION =
  "The DEVSA logo and how to use it, brand colors, type and voice, plus downloadable wordmarks for PySanAntonio, More Human Than Human, Access Granted and The Model. For press, partners and community use."

/*
 * This had a title and a description and nothing else, so it inherited the
 * root layout's canonical ("/") and the homepage's share card: search engines
 * read it as a copy of the homepage, and a link to it unfurled as the calendar.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/branding" },
  openGraph: {
    title: SHARE_TITLE,
    description: DESCRIPTION,
    url: `${siteUrl}/branding`,
    siteName: "DEVSA",
    type: "website",
    images: [
      {
        url: `${siteUrl}/api/og/branding`,
        width: 1200,
        height: 630,
        alt: "DEVSA branding kit: the logo and how to use it",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: DESCRIPTION,
    images: [`${siteUrl}/api/og/branding`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

export default function BrandingPage() {
  return <BrandingKitPage />
}
