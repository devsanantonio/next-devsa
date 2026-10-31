"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { logoOnDark } from "@/lib/logo-invert"
import { type TechCommunity } from "@/data/communities"
import { getCfsPhase } from "@/data/pysa/2026"
import { getAgCfsPhase } from "@/data/access-granted/2026"
import { SpeakerCallForm } from "@/components/speak/speaker-call-form"
import { CommunityNetwork } from "@/components/community-network"

/**
 * A DEVSA conference's call, listed only on the days it is open. Each owns its
 * own form and closing date; add one here when its call opens.
 */
const CONFERENCE_CALLS = [
  { name: "PySanAntonio", href: "/events/pysanantonio", isOpen: () => getCfsPhase() === "open" },
  { name: "Access Granted", href: "/events/access-granted", isOpen: () => getAgCfsPhase() === "open" },
]

export function GiveATalkClient() {
  const [allGroups, setAllGroups] = useState<TechCommunity[] | null>(null)
  const groups = allGroups && allGroups.filter((c) => c.speakersOpen)
  const [failed, setFailed] = useState(false)
  const conferences = CONFERENCE_CALLS.filter((c) => c.isOpen())

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setAllGroups((d.communities || []) as TechCommunity[]))
      .catch(() => setFailed(true))
  }, [])

  return (
    <main className="min-h-screen bg-white">
      {/* The hero: the headline beside the community network, the same picture as the
          poster and the homepage's "Orgs Behind the Movement", drawn live from the groups. */}
      <section className="relative overflow-hidden bg-[#0a0a0a]" data-bg-type="dark">
        <div className="page-shell grid items-center gap-10 pb-12 pt-24 md:pb-16 md:pt-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/55">Call for speakers</p>
            <h1 className="mt-4 text-balance font-sans text-4xl font-black leading-[0.98] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
              Give a talk in San Antonio.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-[1.7] text-white/70">
              Pick a group that&apos;s looking for speakers, or tell us about your talk and we&apos;ll find the group it
              fits. Lightning talks, full talks and workshops; first talks welcome.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[560px] lg:max-w-none">
            <CommunityNetwork communities={allGroups ?? []} className="w-full" />
          </div>
        </div>
      </section>

      <section data-bg-type="light">
        <div className="page-shell grid gap-14 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* Left: the groups with an open call, and any conference that's open today. */}
          <div className="min-w-0">
            {conferences.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-gray-400">
                  Conferences
                  <span aria-hidden className="h-px flex-1 bg-gray-200" />
                </h2>
                <ul className="divide-y divide-gray-200 border-y border-gray-200">
                  {conferences.map((c) => (
                    <li key={c.name}>
                      <Link href={c.href} className="group flex items-center justify-between gap-6 py-5">
                        <span className="text-lg font-semibold text-gray-900">{c.name}</span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 group-hover:text-gray-900">
                          Submit a talk <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h2 className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-gray-400">
              Groups looking for speakers
              <span aria-hidden className="h-px flex-1 bg-gray-200" />
            </h2>

            {!groups && !failed && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}
            {failed && <p className="py-6 text-gray-600">The list didn&apos;t load. Refresh to try again.</p>}
            {groups && groups.length === 0 && (
              <p className="py-6 text-[17px] leading-[1.7] text-gray-600">
                No group has an open call right now. You can still tell us about your talk, and we&apos;ll find the group
                it fits.
              </p>
            )}
            {groups && groups.length > 0 && (
              <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {groups.map((g) => (
                  <li key={g.id}>
                    <Link href={`/buildingtogether/${g.id}#speak`} className="group flex items-start gap-5 py-6">
                      {/* The group's own artwork, on the dark ground it was drawn for. */}
                      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0a0a0a]">
                        <span className="relative h-10 w-10">
                          <Image src={g.logo} alt="" fill sizes="40px" className={`object-contain ${logoOnDark(g)}`} />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-semibold text-gray-900">{g.name}</span>
                        {g.speakersNote && (
                          <span className="mt-1 line-clamp-2 block text-[15px] leading-relaxed text-gray-600">{g.speakersNote}</span>
                        )}
                        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 group-hover:text-gray-900">
                          Speak at {g.name} <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-10 text-sm leading-relaxed text-gray-500">
              Run one of the groups?{" "}
              <Link href="/admin" className="font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-700">
                Open a call for speakers
              </Link>{" "}
              from your group&apos;s page in the DEVSA admin.
            </p>
          </div>

          {/* Right: the open pool, for a talk without a home yet. It stays in view while the
              list scrolls, and the form is kept short enough to fit one screen. Only admins
              see these talks, and share each with the groups it fits (lib/speaker-calls.ts). */}
          <div id="open-pool" className="min-w-0 scroll-mt-24">
            <div className="lg:sticky lg:top-20">
              <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Open to any group</p>
              <h2 className="mt-3 text-balance font-sans text-2xl font-black leading-[1.1] tracking-[-0.02em] text-gray-900">
                Not sure where your talk fits?
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                Tell us about it. DEVSA knows the organizers of every group on the calendar, and we&apos;ll share your talk
                with the ones it fits.
              </p>
              <div className="mt-6">
                <SpeakerCallForm pool />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
