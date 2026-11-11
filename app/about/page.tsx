import type { Metadata } from "next"
import {
  AboutHero,
  FoundingFacts,
  OriginProse,
  TheRecord,
} from "@/components/about/origin-story"
import { MeetTheTeam } from "@/components/partners/meet-the-team"
import { listCommunities } from "@/lib/communities"
import { listPartners } from "@/lib/partners"
import { calendarRecord } from "@/lib/calendar-record"
import { jsonLdScript } from "@/lib/json-ld"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

// Leads with what DEVSA is (the phrase /about's hero and story introduce),
// then what a funder checks: nonprofit status, since when, and who runs it.
const SHORT =
  "Community infrastructure for San Antonio's learners and builders: one calendar, one directory, one channel and a few rooms a year. A 501(c)(3) since 2024."

export const metadata: Metadata = {
  title: "About DEVSA — For San Antonio's Learners and Builders",
  description: SHORT,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About DEVSA — For San Antonio's Learners and Builders",
    description: SHORT,
    url: `${siteUrl}/about`,
    siteName: "DEVSA",
    type: "website",
    images: [
      {
        url: `${siteUrl}/api/og/about`,
        width: 1200,
        height: 630,
        alt: "About DEVSA — community infrastructure for San Antonio's learners and builders",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About DEVSA — For San Antonio's Learners and Builders",
    description: SHORT,
    images: [`${siteUrl}/api/og/about`],
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
  const [communities, partners, record] = await Promise.all([
    listCommunities(),
    listPartners(),
    calendarRecord(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript({
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
          eventsSince2024={record?.since2024 ?? null}
        />
        <OriginProse communityCount={communities.length} />
        <MeetTheTeam />
        <TheRecord />
      </main>
    </>
  )
}
