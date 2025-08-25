import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DEVSA - Your Connection to the Tech Community in San Antonio",
  description:
    "Where is the tech community in San Antonio? DEVSA is your direct connection to the tech community in San Antonio. Join developers, designers, and tech professionals in SA.",
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
    "technology events",
    "tech community events",
    "developer events San Antonio",
    "tech events San Antonio",
    "San Antonio tech events",
    "San Antonio developer events",
    "San Antonio programming events",
    "San Antonio tech community",
    "San Antonio tech meetups",
  ],
  authors: [{ name: "DEVSA Community" }],
  creator: "DEVSA",
  publisher: "DEVSA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DEVSA - Your Connection to the Tech Community in San Antonio",
    description:
      "Where is the tech community in San Antonio? DEVSA is your direct connection to the tech community in San Antonio. Join developers, designers, and tech professionals in SA.",
    url: "/",
    siteName: "DEVSA",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "DEVSA - San Antonio Tech Community",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVSA - Your Connection to the Tech Community in San Antonio",
    description:
      "Where is the tech community in San Antonio? DEVSA is your direct connection to the tech community in San Antonio.",
    images: ["/opengraph.png"],
    creator: "@devsa_community",
    site: "@devsa_community",
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
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
