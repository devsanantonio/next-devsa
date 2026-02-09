"use client"

import { useState, useEffect } from "react"
import { JobCard } from "@/components/jobs/job-card"
import { JobFilters } from "@/components/jobs/job-filters"
import { Briefcase, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface JobListingItem {
  id: string
  title: string
  slug: string
  companyName: string
  companyLogo?: string
  type: "w2" | "1099" | "equity" | "other"
  locationType: "remote" | "onsite" | "hybrid"
  location?: string
  salaryRange?: string
  tags: string[]
  applicantCount: number
  createdAt: string
}

export default function JobsPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<JobListingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/jobs")
      const data = await res.json()
      setListings(data.listings || [])
    } catch {
      console.error("Failed to load listings")
    } finally {
      setIsLoading(false)
    }
  }

  // Client-side filtering
  const filteredListings = listings.filter((listing) => {
    if (selectedType !== "all" && listing.type !== selectedType) return false
    if (selectedLocation !== "all" && listing.locationType !== selectedLocation) return false
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

  return (
    <div className="w-full min-h-dvh bg-white">
      <main className="relative w-full">
        {/* Hero Section — bg video fades from white to black */}
        <section className="w-full min-h-dvh flex flex-col items-center justify-center px-5 sm:px-6 py-24 sm:py-16 relative overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://devsa-assets.s3.us-east-2.amazonaws.com/jobs-bg.mp4" type="video/mp4" />
          </video>

          {/* Dark overlay for WCAG text contrast */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content overlay */}
          <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
              <div className="h-1 w-8 rounded-full bg-[#ef426f]" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#ef426f]">
                DEVSA Community
              </span>
              <div className="h-1 w-8 rounded-full bg-[#ef426f]" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95] mb-6 sm:mb-8">
              Where San Antonio{" "}
              <span className="text-[#ef426f]">Tech Talent</span>{" "}
              Connects
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-white/80 leading-[1.8] max-w-2xl mx-auto mb-10 sm:mb-12 font-medium">
              Connecting passionate builders with local companies and the growing tech ecosystem.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/jobs/signin"
                className="group w-full sm:w-auto relative inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-black text-slate-900 hover:bg-[#ef426f] hover:text-white transition-all duration-300 overflow-hidden"
              >
                <span className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-4">
                  I&apos;m Hiring
                </span>
                <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 font-black">
                  Open to Work
                </span>
              </Link>
              <a
                href="#open-positions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/50 px-7 py-4 text-sm font-bold text-white hover:border-white hover:bg-white/10 transition-all duration-200"
              >
                View Opportunities
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          {listings.length > 0 && (
            <div className="absolute z-10 bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/50 animate-bounce">
              <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase">Browse Jobs</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          )}
        </section>

        {/* Job Listings Section */}
        <section id="open-positions" className="w-full bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-10 sm:py-16 scroll-mt-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
                Open Positions
              </h2>
              {user && (
                <Link
                  href="/jobs/post"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
                >
                  Post a Job
                </Link>
              )}
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
              />
            </div>

            {/* Listings */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-snug">
                  {searchQuery || selectedType !== "all" || selectedLocation !== "all"
                    ? "No jobs match your filters"
                    : "No jobs posted yet"}
                </h3>
                <p className="text-slate-500 text-[13px] sm:text-sm leading-relaxed max-w-md">
                  {searchQuery || selectedType !== "all" || selectedLocation !== "all"
                    ? "Try adjusting your search criteria or clearing filters."
                    : "Be the first to post a job opportunity for the San Antonio tech community."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  {filteredListings.length} job{filteredListings.length !== 1 ? "s" : ""} found
                </p>
                {filteredListings.map((listing) => (
                  <JobCard key={listing.id} {...listing} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
