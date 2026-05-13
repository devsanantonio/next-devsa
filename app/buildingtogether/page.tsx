import { Metadata } from "next"
import { GroupsHero } from "@/components/partners/groups-hero"
import { LogoShowcase } from "@/components/partners/logo-showcase"
import { MeetTheTeam } from "@/components/partners/meet-the-team"
import { PartnerCta } from "@/components/partners/partner-cta"
import { DonationCta } from "@/components/partners/donation-cta"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

export const metadata: Metadata = {
  title: "San Antonio Tech Communities & Partners | DEVSA",
  description: "Explore 20+ tech community groups and strategic partners in San Antonio. From Python and JavaScript meetups to AI, cybersecurity, and game dev — find your tribe in the SA tech ecosystem.",
  keywords: [
    "San Antonio tech communities",
    "tech groups San Antonio",
    "developer communities SA",
    "tech partners San Antonio",
    "Python community San Antonio",
    "JavaScript community SA",
    "AI community San Antonio",
    "cybersecurity community SA",
    "game dev San Antonio",
    "tech networking groups",
    "DEVSA partners",
    "San Antonio tech organizations",
    "tech nonprofits San Antonio",
    "join tech community SA",
    "Alamo City developers",
    "South Texas tech community",
  ],
  alternates: {
    canonical: "/buildingtogether",
  },
  openGraph: {
    title: "San Antonio Tech Communities & Partners | DEVSA",
    description: "Explore 20+ tech community groups and strategic partners building the San Antonio tech ecosystem together.",
    url: `${siteUrl}/buildingtogether`,
    siteName: "DEVSA",
    images: [
      {
        url: `${siteUrl}/api/og/buildingtogether`,
        width: 1200,
        height: 630,
        alt: "San Antonio Tech Communities & Partners - DEVSA",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "San Antonio Tech Communities & Partners | DEVSA",
    description: "Explore 20+ tech community groups and strategic partners building the San Antonio tech ecosystem together.",
    images: [`${siteUrl}/api/og/buildingtogether`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

export default function GroupsPage() {
  const siteUrlValue = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "San Antonio Tech Communities & Partners",
            description: "Explore 20+ tech community groups and strategic partners in San Antonio building the tech ecosystem together.",
            url: `${siteUrlValue}/buildingtogether`,
            isPartOf: {
              "@type": "WebSite",
              name: "DEVSA",
              url: siteUrlValue,
            },
            about: {
              "@type": "Thing",
              name: "Technology Communities in San Antonio",
            },
            provider: {
              "@type": "Organization",
              name: "DEVSA",
              url: siteUrlValue,
            },
          }),
        }}
      />
      <main className="min-h-screen bg-black">
      <GroupsHero />
      <LogoShowcase />
      <MeetTheTeam />
      <PartnerCta />
      <DonationCta />
      </main>
    </>
  )
}
