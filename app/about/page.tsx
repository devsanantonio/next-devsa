import type { Metadata } from "next"
import {
  AboutHero,
  FoundingFacts,
  OriginProse,
} from "@/components/about/origin-story"
import { MeetTheTeam } from "@/components/partners/meet-the-team"
import { listCommunities } from "@/lib/communities"
import { listPartners } from "@/lib/partners"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const SHORT =
  "DEVSA began as a Discord server in September 2023 and became a 501(c)(3) six months later. The story, the board, and what the organization actually runs."

export const metadata: Metadata = {
  title: "About DEVSA — How It Started and Who Runs It",
  description: SHORT,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About DEVSA — How It Started and Who Runs It",
    description: SHORT,
    url: `${siteUrl}/about`,
    siteName: "DEVSA",
    type: "website",
    images: [
      {
        url: `${siteUrl}/api/og/home`,
        width: 1200,
        height: 630,
        alt: "DEVSA — the community calendar for San Antonio tech",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About DEVSA — How It Started and Who Runs It",
    description: SHORT,
    images: [`${siteUrl}/api/og/home`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

/**
 * The page the site did not have.
 *
 * Three things had no parent. The board lived mid-way down /buildingtogether,
 * which is the page about the groups and the partners, so a grantmaker or a
 * sponsor asking "who runs this" had to be sent to an anchor inside an
 * argument aimed at somebody else. The founder's story was nowhere — the
 * homepage carries a quote from him and never says where any of it came from.
 * And /coworking-space has been an orphan since the room closed: nothing in
 * the nav, the footer or any page body links to it, which left a live URL that
 * only search could reach.
 *
 * `async`, so the group count in the story is read from Firestore rather than
 * written down. This file is the sixth place that number would have been
 * hardcoded.
 */
export default async function AboutPage() {
  const [communities, partners] = await Promise.all([
    listCommunities(),
    listPartners(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About DEVSA",
            url: `${siteUrl}/about`,
            description: SHORT,
            mainEntity: {
              "@type": "Organization",
              name: "DEVSA",
              foundingDate: "2024-03",
              nonprofitStatus: "501(c)(3)",
              url: siteUrl,
              founder: {
                "@type": "Person",
                name: "Jesse Hernandez",
                jobTitle: "Founder & Executive Director",
              },
            },
          }),
        }}
      />
      <main className="min-h-screen bg-white">
        <AboutHero />
        <FoundingFacts
          communityCount={communities.length}
          partnerCount={partners.length}
        />
        <OriginProse />
        <MeetTheTeam />
      </main>
    </>
  )
}
