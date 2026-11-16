import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { listCommunities, listCommunityProfiles } from "@/lib/communities"
import { groupsByTopic, topicBySlug, topicFilters, TOPIC_CONFERENCES } from "@/lib/community-topics"
import { listPublishedEvents, hostedBy } from "@/lib/group-events"
import { logoOnLight, logoSrcOnLight } from "@/lib/logo-invert"
import { jsonLdScript } from "@/lib/json-ld"

/**
 * A topic's page: "Python in San Antonio", "Cybersecurity in San Antonio".
 *
 * Search for "python san antonio" lands on a page about exactly that: the directory's groups that cover
 * it, their upcoming meetups from the calendar, and DEVSA's own conference on the subject where there is
 * one. The groups and topics come from lib/community-topics.ts, the same matching /llms.txt uses, and the
 * group pages link back here, so the two kinds of page point at each other.
 *
 * Rendered per request, like the group pages and for the same reason (CLAUDE.md, "Real time is the
 * contract"): a group added in the admin is on its topic's page at once. No generateStaticParams. An
 * unknown topic, or one with no groups today, renders not-found, and its metadata is noindex.
 */

const SITE = "https://www.devsa.community"

type Props = { params: Promise<{ topic: string }> }

async function load(slug: string) {
  const topic = topicBySlug(slug)
  if (!topic) return null
  const [profiles, communities] = await Promise.all([listCommunityProfiles(), listCommunities()])
  const groups = groupsByTopic(profiles).find(([name]) => name === topic.name)?.[1] ?? []
  if (!groups.length) return null
  const logos = new Map(communities.map((c) => [c.id, c]))
  return { topic, groups, logos, profiles }
}

/** The first sentence of a description, or its first ~170 characters cut on a word. */
function teaser(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim()
  const sentence = flat.match(/^.{20,200}?[.!?](\s|$)/)?.[0]?.trim()
  if (sentence) return sentence
  if (flat.length <= 170) return flat
  return flat.slice(0, 170).replace(/\s+\S*$/, "") + "…"
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic: slug } = await params
  const data = await load(slug)
  if (!data) return { title: "Topic not found", robots: { index: false, follow: false } }
  const { topic, groups } = data
  const names = groups.map((g) => g.name.trim())
  const title = `${topic.label} in San Antonio: Groups and Meetups`
  const description = `${names.slice(0, 4).join(", ")}${names.length > 4 ? " and more" : ""}: San Antonio's ${topic.name} ${
    groups.length === 1 ? "group" : "groups"
  }, and their upcoming meetups on DEVSA's community calendar.`
  const url = `${SITE}/buildingtogether/topics/${topic.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function TopicPage({ params }: Props) {
  const { topic: slug } = await params
  const data = await load(slug)
  if (!data) notFound()
  const { topic, groups, logos, profiles } = data

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const ids = groups.map((g) => g.id)
  const upcoming = (await listPublishedEvents())
    .filter((e) => ids.some((id) => hostedBy(e, id)) && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8)
  const nameOf = (communityId: string) =>
    communityId
      .split(",")
      .map((id) => id.trim())
      .filter((id) => ids.includes(id))
      .map((id) => logos.get(id)?.name ?? groups.find((g) => g.id === id)?.name ?? "")
      .filter(Boolean)
      .join(" + ")
  const conferences = TOPIC_CONFERENCES[topic.slug] ?? []
  const others = topicFilters(profiles).filter((t) => t.slug !== topic.slug)
  const when = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { timeZone: "America/Chicago", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${topic.label} in San Antonio`,
    url: `${SITE}/buildingtogether/topics/${topic.slug}`,
    isPartOf: { "@type": "WebSite", name: "DEVSA", url: SITE },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: groups.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Organization", name: g.name.trim(), url: `${SITE}/buildingtogether/${g.id}` },
      })),
    },
  }

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <section className="bg-black" data-bg-type="dark">
        <div className="page-shell pb-14 pt-28 md:pb-20 md:pt-36">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/55 md:text-base">
            <Link href="/buildingtogether/topics" className="transition-colors hover:text-white">
              Find a group by topic
            </Link>
          </p>
          <h1 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl xl:text-7xl">
            {topic.label} <span className="font-light italic text-white/55">in San Antonio.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
            {groups.length === 1 ? "One community group" : `${groups.length} community groups`} on DEVSA&apos;s public directory{" "}
            {groups.length === 1 ? "covers" : "cover"} {topic.name}. Each runs itself; open one for when it meets and how to join.
          </p>
        </div>
      </section>

      <section data-bg-type="light">
        <div className="page-shell py-14 md:py-20">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">The groups</h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {groups.map((g) => {
              const logo = logos.get(g.id)
              return (
                <li key={g.id}>
                  <Link
                    href={`/buildingtogether/${g.id}`}
                    className="group flex h-full items-start gap-5 rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span className="relative h-14 w-14 shrink-0 rounded-xl border border-gray-100 bg-white">
                      {logo?.logo ? (
                        <Image
                          src={logoSrcOnLight({ id: g.id, name: g.name, type: "community" }, logo.logo)}
                          alt=""
                          fill
                          unoptimized
                          sizes="56px"
                          className={`object-contain p-2 ${logoOnLight({ id: g.id, name: g.name, type: "community" })}`}
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-xl font-black tracking-[-0.01em] text-gray-900">{g.name.trim()}</span>
                        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                      {g.description ? <span className="mt-2 block text-base leading-relaxed text-gray-600">{teaser(g.description)}</span> : null}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-14 border-t border-gray-200 pt-12 md:mt-16">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">Upcoming meetups</h2>
            {upcoming.length === 0 ? (
              <p className="mt-5 text-[17px] leading-[1.7] text-gray-600">
                Nothing on the calendar from these groups yet. Their pages say how to follow them, or see{" "}
                <Link href="/events" className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4">
                  everything on the community calendar
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <Link href={`/events/${e.slug}`} className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6">
                      <span className="w-48 shrink-0 font-mono text-sm text-gray-500">{when(e.date)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-semibold text-gray-900 group-hover:underline group-hover:decoration-gray-300 group-hover:underline-offset-4">
                          {e.title}
                        </span>
                        <span className="block text-sm text-gray-600">
                          {nameOf(e.communityId)}
                          {e.location ? ` · ${e.location.split(",")[0]}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {conferences.length > 0 && (
            <div className="mt-14 border-t border-gray-200 pt-12 md:mt-16">
              <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">
                DEVSA&apos;s {conferences.length === 1 ? "conference" : "conferences"} on it
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {conferences.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="group block h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-neutral-700"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-xl font-black text-white">{c.name}</span>
                        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-2 block text-base leading-relaxed text-white/70">{c.line}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {others.length > 0 && (
            <div className="mt-14 border-t border-gray-200 pt-12 md:mt-16">
              <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">Other topics</h2>
              <p className="mt-5 text-base leading-8 text-gray-500 md:text-lg md:leading-9">
                {others.map((t, i) => (
                  <span key={t.slug}>
                    {i > 0 && " "}
                    <span className="whitespace-nowrap">
                      {i > 0 && <span aria-hidden className="mr-2 text-gray-300">·</span>}
                      <Link
                        href={`/buildingtogether/topics/${t.slug}`}
                        className="font-medium text-gray-800 underline decoration-gray-300 underline-offset-[6px] hover:text-gray-900 hover:decoration-gray-500"
                      >
                        {t.label}
                      </Link>
                      <span className="ml-1 font-mono text-xs text-gray-500">{t.ids.length}</span>
                    </span>
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
