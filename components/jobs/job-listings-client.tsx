"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { JobCard } from "@/components/jobs/job-card"
import { JobFilters } from "@/components/jobs/job-filters"
import { Briefcase, ArrowRight, HandCoins } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface JobListingItem {
  id: string
  title: string
  slug: string
  companyName: string
  companyLogo?: string
  type: "w2" | "1099" | "equity" | "internship" | "other"
  locationType: "remote" | "onsite" | "hybrid"
  location?: string
  salaryRange?: string
  tags: string[]
  applicantCount: number
  createdAt: string
}

export function JobListingsClient({
  initialListings,
}: {
  initialListings: JobListingItem[]
}) {
  const { user, getIdToken } = useAuth()
  const [listings] = useState<JobListingItem[]>(initialListings)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedDatePosted, setSelectedDatePosted] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      fetchSavedJobs()
      fetchMyApplications()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchSavedJobs = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/bounties/saved", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const ids = new Set<string>((data.savedJobs || []).map((s: { jobId: string }) => s.jobId))
      setSavedJobIds(ids)
    } catch {
      // silently fail
    }
  }

  const fetchMyApplications = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/bounties/applications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const ids = new Set<string>((data.applications || []).map((a: { jobId: string }) => a.jobId))
      setAppliedJobIds(ids)
    } catch {
      // silently fail
    }
  }

  const handleToggleSave = async (jobId: string) => {
    if (!user) return
    try {
      const token = await getIdToken()
      const isSaved = savedJobIds.has(jobId)
      const res = await fetch("/api/bounties/saved", {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      })
      if (res.ok) {
        setSavedJobIds((prev) => {
          const next = new Set(prev)
          if (isSaved) next.delete(jobId)
          else next.add(jobId)
          return next
        })
      }
    } catch {
      // silently fail
    }
  }

  // Client-side filtering & sorting
  const filteredListings = listings
    .filter((listing) => {
      if (selectedType !== "all" && listing.type !== selectedType) return false
      if (selectedLocation !== "all" && listing.locationType !== selectedLocation) return false
      if (selectedDatePosted !== "all") {
        const daysAgo = parseInt(selectedDatePosted)
        const cutoff = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        if (new Date(listing.createdAt) < cutoff) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          listing.title.toLowerCase().includes(q) ||
          listing.companyName.toLowerCase().includes(q) ||
          listing.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === "applicants") return b.applicantCount - a.applicantCount
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
  }

  return (
    <div>
      {/* Hero — visible to everyone, matches Building Together platform pattern */}
      <section
        className="relative overflow-hidden bg-black min-h-[85vh] flex flex-col items-center justify-center"
        data-bg-type="dark"
      >
        {/* Background image */}
        <img
          src="https://devsa-assets.s3.us-east-2.amazonaws.com/replay13.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-right md:object-center grayscale"
        />

        {/* Dark overlays — heavy left for text readability, fading right to reveal photo */}
        <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/85 to-transparent z-10" />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-950/70 via-transparent to-neutral-950/70 z-10" />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.15) 65%, transparent 100%)",
          }}
        />

        {/* Foreground content */}
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

            {/* How it works strip */}
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

            {/* Pricing anchor */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-white/85">
                Free to post
              </span>
              <span className="text-sm text-white/30">·</span>
              <span className="text-sm text-white/60">
                8% on completed bounties funds DEVSA
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Link
                href="/bounties/signin?role=hiring"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                <HandCoins className="h-4 w-4" />
                Post a Bounty
              </Link>
              <a
                href="#open-positions"
                className="group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 hover:border-white/30 transition-colors"
              >
                Browse Open Bounties
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Job Listings */}
      <section id="open-positions" className="w-full bg-white px-4 sm:px-6 pt-12 sm:pt-16 scroll-mt-4">
        <div className="mx-auto max-w-7xl pb-16 sm:pb-24">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 leading-[1.2]">
              Open Bounties
            </h2>
            <span className="text-sm font-medium text-gray-400 leading-normal tabular-nums">
              {filteredListings.length}
            </span>
          </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8">
          <JobFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            selectedDatePosted={selectedDatePosted}
            onDatePostedChange={setSelectedDatePosted}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={filteredListings.length}
          />
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase className="h-10 w-10 text-gray-300 mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 leading-[1.3]">
              {searchQuery || selectedType !== "all" || selectedLocation !== "all" || selectedDatePosted !== "all"
                ? "No jobs match your filters"
                : "No jobs posted yet"}
            </h3>
            <p className="text-gray-500 text-sm leading-normal max-w-sm font-normal">
              {searchQuery || selectedType !== "all" || selectedLocation !== "all" || selectedDatePosted !== "all"
                ? "Try adjusting your search criteria or clearing filters."
                : "Be the first to post a job and reach the DEVSA network across San Antonio and South Texas."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => (
              <JobCard
                key={listing.id}
                {...listing}
                isSaved={savedJobIds.has(listing.id)}
                hasApplied={appliedJobIds.has(listing.id)}
                onToggleSave={user ? handleToggleSave : undefined}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </div>
    </section>
    </div>
  )
}
