import type React from "react"
import type { Metadata } from "next"
import { Oswald, Space_Grotesk } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine,
} from "geist/font/pixel"
import "./globals.css"
import { SiteAnalytics } from "@/components/site-analytics"
import { Suspense } from "react"
import { LayoutChrome } from "@/components/layout-chrome"
import { listCommunities } from "@/lib/communities"
import { CartProvider } from "@/components/shop/cart-context"
import { CartSlideOut } from "@/components/shop/cart-slide-out"

/**
 * Oswald — the display face the Startup + Tech Week activations are set in.
 *
 * Added so the brands ported from sasw-geekdom/next-sasw look like themselves.
 * Access Granted's wordmark is specified as Oswald bold uppercase; without the
 * face it fell back to Geist Sans black, which is a different letterform at a
 * similar weight and reads as "nearly right".
 *
 * Deliberately NOT applied to bare h1/h2/h3 the way next-sasw applies it.
 * There it is the site's display face; here the site's headings are Geist Sans
 * black by design, on every page. This is an opt-in utility for the two
 * surfaces whose brand asks for it.
 */
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

/**
 * One description, used by <meta>, Open Graph, Twitter and the Organization
 * JSON-LD. It was four separate string literals until the coworking space
 * closed and every one of them went on advertising it, along with a job board
 * that had been deleted months earlier. A single const is the only thing that
 * makes the next correction a one-line change.
 */
/**
 * One description, used by the metadata, the OpenGraph card, Twitter and the
 * Organization JSON-LD.
 *
 * It used to open on "DEVSA bridges the gap between passionate builders, local
 * partners, and the growing tech ecosystem" — true, and indistinguishable from
 * any other community organization's description. It named no technology, so a
 * search for "python meetup san antonio" or "san antonio AI group" had nothing
 * to match on, even though DEVSA lists groups for both.
 *
 * Verticals first, and the whole thing fits. 154 characters against a ~155
 * ceiling before Google truncates — an earlier draft ended on "If it's
 * happening here, it's here", which pushed it to 185 and would have cut the
 * group names, which are the half worth having. That claim lives on the page
 * instead, in the hero and the closing section.
 */
const SITE_DESCRIPTION =
  "San Antonio tech meetups, workshops and conferences in one calendar — Python, Linux, .NET, AI, agents, game dev, UX, design, data, security, AWS, Google."

export const metadata: Metadata = {
  title: {
    /* Names the thing a reader is searching for rather than describing the
       organization. "Your Direct Connection to the Tech Community" said
       nothing a search engine or a human could match against. */
    default: "DEVSA — San Antonio Tech Meetups, Workshops and Conferences",
    template: "%s | DEVSA",
  },
  description: SITE_DESCRIPTION,
  /*
   * Verticals first.
   *
   * This list had twenty entries and named no technology — "programming
   * community", "coding community", "tech networking". Generic enough that it
   * could belong to any city's tech org, and matching nothing a person
   * actually types. Somebody looking for a group searches "python meetup san
   * antonio", not "developer community".
   *
   * Each term below is backed by a live group in the admin; the mapping is in
   * components/audience-lanes.tsx. Worth saying that `keywords` carries little
   * weight with Google now — the title, the description and the on-page copy
   * do the work, and all three name these too. This is for the crawlers and
   * engines that still read it, and costs nothing.
   */
  keywords: [
    "Python meetup San Antonio",
    "Linux user group San Antonio",
    "AI meetup San Antonio",
    "AI agents San Antonio",
    "creative technologists San Antonio",
    "cybersecurity meetup San Antonio",
    "game development San Antonio",
    "UX community San Antonio",
    "data engineering San Antonio",
    "AWS user group San Antonio",
    "Google Developer Group San Antonio",
    ".NET user group San Antonio",
    "San Antonio tech community",
    "DEVSA",
    "developers San Antonio",
    "tech meetups SA",
    "programming community",
    "software developers",
    "tech networking",
    "San Antonio startups",
    "coding community",
    "tech events San Antonio",
    "tech collaboration",
    "strategic partnerships",
    "video content",
    "innovation San Antonio",
    "tech groups SA",
    "developer community",
    "technology partnerships",
    "Alamo City tech",
    "SA tech scene",
    "tech ecosystem San Antonio",
  ],
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  publisher: "DEVSA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DEVSA — San Antonio Tech Meetups, Workshops and Conferences",
    description: SITE_DESCRIPTION,
    url: siteUrl,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/home`,
        width: 1200,
        height: 630,
        alt: "DEVSA — the community calendar for San Antonio tech",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVSA — San Antonio Tech Meetups, Workshops and Conferences",
    description: SITE_DESCRIPTION,
    images: [`${siteUrl}/api/og/home`],
    creator: "@devsatx",
    site: "@devsatx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "technology",
}

/**
 * `async`, so the footer's community list can be read on the server and land in
 * the HTML rather than appearing after hydration — see LayoutChrome for why
 * that matters for this particular list.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const communities = await listCommunities()

  return (
    <html lang="en">
      <head>
        <link rel="author" href="https://www.devsa.community" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DEVSA",
              alternateName: "DEV San Antonio",
              description: SITE_DESCRIPTION,
              url: "https://www.devsa.community",
              logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg",
              foundingDate: "2020",
              nonprofitStatus: "501(c)(3)",
              areaServed: {
                "@type": "City",
                name: "San Antonio",
                addressRegion: "TX",
                addressCountry: "US",
              },
              knowsAbout: [
                "Software Development",
                "Web Development",
                "Mobile Development",
                "Data Science",
                "Artificial Intelligence",
                "Cybersecurity",
                "Cloud Computing",
                "DevOps",
                "UX/UI Design",
                "Game Development",
              ],
              sameAs: [
                "https://twitter.com/devsatx",
                "https://linkedin.com/company/devsa",
                "https://instagram.com/devsatx",
                "https://github.com/devsanantonio",
                "https://discord.gg/cvHHzThrEw",
                "https://www.facebook.com/p/DEVSA-61558461121201/",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Community Support",
                availableLanguage: "English",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DEVSA",
              alternateName: "DEV San Antonio",
              url: "https://www.devsa.community",
              /* The same sentence the rest of the site uses, rather than a
                 third description with a hand-counted group total in it. */
              description: SITE_DESCRIPTION,
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.devsa.community/events?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} ${GeistPixelGrid.variable} ${GeistPixelCircle.variable} ${GeistPixelTriangle.variable} ${GeistPixelLine.variable} ${spaceGrotesk.variable} ${oswald.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <CartProvider>
            <LayoutChrome communities={communities}>{children}</LayoutChrome>
            <CartSlideOut />
          </CartProvider>
          <SiteAnalytics />
        </Suspense>
      </body>
    </html>
  )
}
