import { Metadata } from "next"
import { GroupsHero } from "@/components/partners/groups-hero"
import {
  LogoShowcase,
  type LogoItem,
} from "@/components/partners/logo-showcase"
import { listCommunities } from "@/lib/communities"
import { listPartners } from "@/lib/partners"
import { StayConnected } from "@/components/partners/stay-connected"
import { HowWeHelp } from "@/components/partners/how-we-help"
import { PartnerCta } from "@/components/partners/partner-cta"
import { PartnerWays } from "@/components/partners/partner-ways"
import { PARTNER_WAY_KEYS, type GetInvolvedPath } from "@/lib/get-involved"
import { DonationCta } from "@/components/partners/donation-cta"
import { toCampaignKey } from "@/lib/campaigns"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

export const metadata: Metadata = {
  title: "San Antonio Tech Communities & Partners",
  description: "San Antonio's tech groups and the partners behind them, in one directory, and the ways in: partner with DEVSA, host with a group, sponsor or donate.",
  keywords: [
    "San Antonio tech communities",
    "tech groups San Antonio",
    "developer communities SA",
    "tech partners San Antonio",
    "Python community San Antonio",
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
    // For partners, sponsors, students and parents, who reach this page
    // looking for a way in rather than a meetup.
    "partner with DEVSA",
    "sponsor a tech event San Antonio",
    "tech partnership San Antonio",
    "student tech groups San Antonio",
    "UTSA tech student groups",
    "cybersecurity groups San Antonio",
    "civic tech San Antonio",
  ],
  alternates: {
    canonical: "/buildingtogether",
  },
  openGraph: {
    title: "San Antonio Tech Communities & Partners | DEVSA",
    description: "San Antonio's tech groups and the partners behind them, in one directory, and the ways in: partner with DEVSA, host with a group, sponsor or donate.",
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
    description: "San Antonio's tech groups and the partners behind them, in one directory, and the ways in: partner with DEVSA, host with a group, sponsor or donate.",
    images: [`${siteUrl}/api/og/buildingtogether`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

/**
 * Read here rather than in LogoShowcase, which used to fetch both lists in an
 * effect. That kept the wall live but meant this page — the ecosystem
 * directory — server-rendered none of the links to the detail pages it exists
 * to send people to. Reading them in the page keeps the data exactly as live,
 * since nothing is cached between requests, and puts every href in the HTML.
 */
export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string | string[]; path?: string; way?: string }>
}) {
  // A campaign page links here with ?campaign=<key> so the gift is designated.
  const params = await searchParams
  const campaign = toCampaignKey(params.campaign)
  // ?path= and ?way= open the Get Involved form with a choice made — from
  // the footer, PartnerCta, or the old /get-involved URL that redirects here.
  const giPath: GetInvolvedPath = params.path === "general" ? "general" : "partner"
  const giWay = PARTNER_WAY_KEYS.includes(params.way ?? "") ? (params.way as string) : ""

  const [communities, partners] = await Promise.all([
    listCommunities(),
    listPartners(),
  ])

  /* Communities first, matching the order the wall rendered in before. A
     record with no logo is dropped rather than rendered as a gap. */
  const logos: LogoItem[] = [
    ...communities
      .filter((c) => c.logo)
      .map((c) => ({
        id: c.id,
        name: c.name,
        logo: c.logo!,
        type: "community" as const,
      })),
    ...partners
      .filter((p) => p.logo)
      .map((p) => ({
        id: p.id,
        name: p.name,
        logo: p.logo,
        type: "partner" as const,
      })),
  ]

  const siteUrlValue = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "San Antonio Tech Communities & Partners",
            description: "San Antonio's tech groups and the partners behind them, in one directory, and the ways in: partner with DEVSA, host with a group, sponsor or donate.",
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
      <GroupsHero communityCount={communities.length} />
      <LogoShowcase logos={logos} />
      {/* Between the gap and the ask. The hero states the problem and the
          limit; StayConnected asks the reader to act. The mechanism — and one
          instance of it having worked — belongs between them. */}
      <HowWeHelp />
      <StayConnected />
      <PartnerCta communityCount={communities.length} />
      <PartnerWays initialPath={giPath} initialWay={giWay} />
      {/* MeetTheTeam moved to /about.

          It sat between the partner ask and the donation ask on a page arguing
          what DEVSA does for the groups, which made "who runs this" a
          digression inside somebody else's pitch. On /about it is the answer to
          the question the page exists for, and the flow here runs straight from
          the partner ask to the donation ask, which is the order a reader is
          already in. */}
      <DonationCta campaign={campaign} />
      </main>
    </>
  )
}
