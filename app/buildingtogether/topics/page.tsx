import type { Metadata } from "next"
import { listCommunities, listCommunityProfiles } from "@/lib/communities"
import { GroupsByTopic } from "@/components/partners/groups-by-topic"

/**
 * Every topic, with its groups: the index the topic pages hang from (/buildingtogether/topics/<topic>),
 * and the "Find a group by topic" rows that used to sit under the logo wall on /buildingtogether. Each
 * topic name links to its page, each group to its own. Rendered per request from the live directory.
 */

const SITE = "https://www.devsa.community"
const title = "Tech Groups in San Antonio by Topic"
const description =
  "San Antonio's tech community groups by what they cover: Linux, Python, .NET, AI, cybersecurity, cloud, data, game development and design. Each runs itself; open one for when it meets and how to join."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE}/buildingtogether/topics` },
  openGraph: { title, description, url: `${SITE}/buildingtogether/topics`, type: "website" },
}

export default async function TopicsPage() {
  const [profiles, communities] = await Promise.all([listCommunityProfiles(), listCommunities()])
  const logos = communities
    .filter((c) => c.logo)
    .map((c) => ({ id: c.id, name: c.name, logo: c.logo!, type: "community" as const }))
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-black" data-bg-type="dark">
        <div className="page-shell pb-14 pt-28 md:pb-20 md:pt-36">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/55 md:text-base">Find a group by topic</p>
          <h1 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl xl:text-7xl">
            What do you want <span className="font-light italic text-white/55">to learn?</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
            San Antonio&apos;s tech groups by what they cover. Each runs itself; open one for when it meets and how to join.
          </p>
        </div>
      </section>
      <div className="pt-12 md:pt-16">
        <GroupsByTopic groups={profiles} logos={logos} bare />
      </div>
    </main>
  )
}
