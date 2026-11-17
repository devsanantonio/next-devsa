import type { Metadata } from "next"
import { listCommunities, listCommunityProfiles } from "@/lib/communities"
import { calendarRecord } from "@/lib/calendar-record"
import { topicFilters } from "@/lib/community-topics"
import { SponsorPage } from "@/components/sponsor/sponsor-page"

/**
 * The 2027 sponsor packet, on the web: link-only.
 *
 * It is sent to sponsors by link (outreach emails, follow-ups), so it carries prices and a commit-by date that
 * the public site does not. Nothing links to it: not the nav, the footer or the sitemap, and its metadata is
 * noindex. It is not in robots.txt's disallow list on purpose, because a crawler that cannot fetch the page
 * cannot see its noindex either.
 *
 * Its figures read the live directory and calendar where the site has them (the group count, the network,
 * the stack, events since 2024), so the page does not go stale the way the PDF did; the rest are dated in
 * place. The printable PDF is rendered from design/sponsor-packet/packet.html.
 */

export const metadata: Metadata = {
  title: "Sponsor the Bridge · DEVSA 2027",
  description: "DEVSA's 2027 sponsorship: four conferences, one a quarter, and the bridge to San Antonio's learners and builders.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "Sponsor the Bridge · DEVSA 2027",
    description: "Four conferences, one a quarter, and the bridge to San Antonio's learners and builders.",
    images: [{ url: "/api/og/home", width: 1200, height: 630 }],
  },
}

/** The DEVSA Discord's member count, from its invite; the packet's Nov 10 figure if Discord doesn't answer. */
async function discordMembers(): Promise<number> {
  try {
    const r = await fetch("https://discord.com/api/v10/invites/cvHHzThrEw?with_counts=true", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2500),
    })
    const n = (await r.json()).approximate_member_count
    if (Number.isFinite(n) && n > 0) return n
  } catch {}
  return 896
}

export default async function Page() {
  const [communities, profiles, record, discord] = await Promise.all([
    listCommunities(),
    listCommunityProfiles(),
    calendarRecord(),
    discordMembers(),
  ])
  const network = communities.filter((c) => c.logo).map((c) => ({ id: c.id, name: c.name, logo: c.logo! }))
  const stack = topicFilters(profiles).map((t) => ({
    label: t.name,
    groups: t.ids.map((id) => profiles.find((p) => p.id === id)?.name.trim() ?? "").filter(Boolean),
  }))
  return (
    <SponsorPage
      groupCount={communities.length}
      network={network}
      stack={stack}
      since2024={record?.since2024 ?? "600+"}
      thisYear={record?.thisYear ?? null}
      discord={discord}
    />
  )
}
