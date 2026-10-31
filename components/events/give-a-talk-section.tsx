"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { CommunityNetwork, type Community } from "@/components/community-network"

type Group = Community & { speakersOpen?: boolean }

/**
 * "Have a Talk in You?", its own section between the calendar and the
 * conferences. The people reading the calendar are the people who come to the
 * rooms, and some of them are the next speakers; the network beside it is every
 * group they could speak to, the same picture as the homepage and the poster.
 *
 * Light, with the network in a dark panel as on the homepage: ConferencePortfolio
 * opens on #0a0a0a immediately below, and two dark bands back to back is the
 * repeat the calendar's own closing band was built to avoid. The eyebrow and
 * heading are that band's idiom ("The Calendar Is Open"), so the page reads as
 * one system.
 *
 * Read client-side, like every surface that shows groups: the count of open calls
 * and the network both move the moment an organizer changes something.
 */
export function GiveATalkSection() {
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setGroups((d.communities || []) as Group[]))
      .catch(() => {})
  }, [])

  const open = groups.filter((g) => g.speakersOpen).length

  return (
    <section id="give-a-talk" className="scroll-mt-20 bg-white pb-16 sm:pb-24" data-bg-type="light">
      <div className="page-shell">
        <div className="grid items-center gap-10 border-t border-gray-200 pt-12 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
              Call for Speakers
            </p>
            <h2 className="mt-5 text-balance font-sans text-gray-900 leading-none text-3xl md:text-4xl lg:text-5xl font-black tracking-[-0.02em]">
              Have a Talk <span className="text-gray-600 font-light italic">in</span> You?
            </h2>
            <p className="mt-5 text-lg md:text-xl font-light leading-[1.45] text-gray-600">
              {groups.length > 0 ? `${groups.length} groups meet on this calendar, and every one of them needs speakers.` : "Every group on this calendar needs speakers."}{" "}
              {open > 0
                ? `${open} ${open === 1 ? "is" : "are"} looking right now. `
                : ""}
              Tell us about your talk and we&apos;ll find the group it fits. First talks welcome.
            </p>
            <Link
              href="/give-a-talk"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760]"
            >
              Give a talk <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <CommunityNetwork communities={groups} tone="light" className="w-full" />
        </div>
      </div>
    </section>
  )
}
