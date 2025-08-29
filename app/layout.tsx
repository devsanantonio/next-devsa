import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "DEVSA - Activating the Tech Community in San Antonio",
  description:
    "Activating the tech community in San Antonio through collaboration, strategic partnerships and video. DEVSA connects developers, designers, and tech professionals through partnerships with local organizations, providing a platform for growth and innovation.",
  keywords: [
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
    title: "DEVSA - Your Direct Connection to the Tech Community",
    description:
      "Activating the tech community in San Antonio through collaboration, strategic partnerships and video. DEVSA connects developers, designers, and tech professionals through partnerships with local organizations.",
    url: siteUrl,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "DEVSA - Your Direct Connection to the Tech Community in San Antonio",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVSA - Your Direct Connection to the Tech Community",
    description:
      "Activating the tech community in San Antonio through collaboration, strategic partnerships and video. Connect with local tech groups and professionals.",
    images: [`${siteUrl}/opengraph-image.png`],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DEVSA",
              alternateName: "Developer San Antonio",
              description:
                "Activating the tech community in San Antonio through collaboration, strategic partnerships and video. DEVSA connects people, shares knowledge, and celebrates innovation.",
              url: "https://devsa.community",
              logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg",
              foundingDate: "2020",
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
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
