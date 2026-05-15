"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { BountyCard } from "@/components/bounties/bounty-card"
import { BountyFilters } from "@/components/bounties/bounty-filters"
import { Briefcase, ArrowRight, HandCoins } from "lucide-react"
import Link from "next/link"
import type { BountyCategory, BountyStatus } from "@/lib/firebase-admin"

export interface BountyListItem {
  id: string
  title: string
  slug: string
  summary: string
  orgName: string
  orgLogo?: string
  orgVerifiedNonprofit?: boolean
  category: BountyCategory
  tags: string[]
  amountCents: number
  payoutCents: number
  status: BountyStatus
  applicantCount: number
  estimatedHours?: number
  deadlineAt?: string
  createdAt: string
}

function amountBucket(cents: number): string {
  const d = cents / 100
  if (d < 250) return "under-250"
  if (d < 500) return "250-500"
  if (d < 1000) return "500-1000"
  if (d < 2500) return "1000-2500"
  return "over-2500"
}

export function BountyListingsClient({
  initialBounties,
}: {
  initialBounties: BountyListItem[]
}) {
  const [bounties] = useState<BountyListItem[]>(initialBounties)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAmount, setSelectedAmount] = useState("all")
  const [selectedDatePosted, setSelectedDatePosted] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const filtered = bounties
    .filter((b) => {
      if (selectedCategory !== "all" && b.category !== selectedCategory) return false
      if (selectedAmount !== "all" && amountBucket(b.amountCents) !== selectedAmount) return false
      if (selectedDatePosted !== "all") {
        const daysAgo = parseInt(selectedDatePosted)
        const cutoff = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        if (new Date(b.createdAt) < cutoff) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          b.title.toLowerCase().includes(q) ||
          b.orgName.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "amount-high":
          return b.amountCents - a.amountCents
        case "amount-low":
          return a.amountCents - b.amountCents
        case "deadline": {
          // Items without a deadline sink to the bottom
          const aT = a.deadlineAt ? new Date(a.deadlineAt).getTime() : Number.POSITIVE_INFINITY
          const bT = b.deadlineAt ? new Date(b.deadlineAt).getTime() : Number.POSITIVE_INFINITY
          return aT - bT
        }
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  return (
    <div>
      {/* Hero — bounty-led copy */}
      <section
        className="relative overflow-hidden bg-black min-h-[85vh] flex flex-col items-center justify-center"
        data-bg-type="dark"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://devsa-assets.s3.us-east-2.amazonaws.com/replay13.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-right md:object-center grayscale"
        />

        <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/85 to-transparent z-10" />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-950/70 via-transparent to-neutral-950/70 z-10" />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.15) 65%, transparent 100%)",
          }}
        />

        <div className="relative z-20 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28 lg:py-32 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
                Bounty Board
              </p>
              <h1 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Local Work.{" "}
                <span className="text-white/55 font-light italic">Local</span>{" "}
                Talent.
              </h1>
            </div>

            <div className="space-y-5 max-w-3xl mt-8">
              <p className="text-xl md:text-2xl text-white/75 leading-[1.4] font-light">
                Bite-sized dev projects posted by{" "}
                <strong className="font-semibold text-white">local nonprofits</strong>{" "}
                and{" "}
                <strong className="font-semibold text-white">startups</strong>{" "}
                — claimed by builders across San Antonio, the I-35 corridor, and the Rio Grande Valley.
              </p>

              <p className="text-base md:text-lg text-white/55 leading-relaxed">
                Fund the bounty, pick a builder, pay on delivery. DEVSA holds payment in escrow and takes 8% to fund workshops, conferences, and the downtown coworking space — a 501(c)(3) bridging 20+ tech community groups across South Texas.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs max-w-3xl">
              <span className="font-semibold uppercase tracking-[0.18em] text-white/35">
                How it works
              </span>
              <span className="font-medium text-white/70">Post + fund</span>
              <span className="text-white/20">·</span>
              <span className="font-medium text-white/70">Match a builder</span>
              <span className="text-white/20">·</span>
              <span className="font-medium text-white/70">Approve work</span>
              <span className="text-white/20">·</span>
              <span className="font-medium text-white/70">Builder gets paid</span>
            </div>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-white/85">Free to post</span>
              <span className="text-sm text-white/30">·</span>
              <span className="text-sm text-white/60">8% on completed bounties funds DEVSA</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Link
                href="/bounties/post"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                <HandCoins className="h-4 w-4" />
                Post a Bounty
              </Link>
              <a
                href="#open-bounties"
                className="group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 hover:border-white/30 transition-colors"
              >
                Browse Open Bounties
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Listings */}
      <section id="open-bounties" className="w-full bg-white px-4 sm:px-6 pt-12 sm:pt-16 scroll-mt-4">
        <div className="mx-auto max-w-7xl pb-16 sm:pb-24">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 leading-[1.2]">
              Open Bounties
            </h2>
            <span className="text-sm font-medium text-gray-400 leading-normal tabular-nums">
              {filtered.length}
            </span>
          </div>

          <div className="mb-6 sm:mb-8">
            <BountyFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedAmount={selectedAmount}
              onAmountChange={setSelectedAmount}
              selectedDatePosted={selectedDatePosted}
              onDatePostedChange={setSelectedDatePosted}
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={filtered.length}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Briefcase className="h-10 w-10 text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 leading-[1.3]">
                {searchQuery || selectedCategory !== "all" || selectedAmount !== "all" || selectedDatePosted !== "all"
                  ? "No bounties match your filters"
                  : "No bounties posted yet"}
              </h3>
              <p className="text-gray-500 text-sm leading-normal max-w-sm font-normal">
                {searchQuery || selectedCategory !== "all" || selectedAmount !== "all" || selectedDatePosted !== "all"
                  ? "Try adjusting your search criteria or clearing filters."
                  : "Be the first to post a bounty. Local nonprofits and startups are most welcome."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((b) => (
                <BountyCard
                  key={b.id}
                  {...b}
                  onTagClick={(t) => setSearchQuery(t)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
