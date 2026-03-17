"use client"

import { useState, useEffect } from "react"
import { JobCard } from "@/components/jobs/job-card"
import { JobFilters } from "@/components/jobs/job-filters"
import { Briefcase, PenSquare, Globe, CheckCircle } from "lucide-react"
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

interface JobBoardProfile {
  uid: string
  role: "hiring" | "open-to-work"
  firstName: string
  lastName: string
  profileImage?: string
  companyName?: string
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
  const [profile, setProfile] = useState<JobBoardProfile | null>(null)

  useEffect(() => {
    if (user) {
      fetchSavedJobs()
      fetchMyApplications()
      loadProfile()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadProfile = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      })
      const data = await res.json()
      if (data.hasProfile) {
        setProfile(data.profile)
      }
    } catch {
      // silently fail
    }
  }

  const fetchSavedJobs = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/jobs/saved", {
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
      const res = await fetch("/api/jobs/applications", {
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
      const res = await fetch("/api/jobs/saved", {
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

  const isSignedIn = !!user && !!profile

  return (
    <div>
      {/* Hero — only visible when not signed in */}
      {!isSignedIn && (
        <section className="w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-10 sm:pb-14">
          <div className="mx-auto max-w-7xl">
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                The Opportunity Pipeline
              </p>
              <h1 className="text-balance font-sans text-gray-900 leading-none text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Post Once.{" "}
                <span className="text-gray-600 font-light italic">Reach Every</span>{" "}
                Member in our Community.
              </h1>
            </div>
            <div className="max-w-3xl mt-8 space-y-3">
              <p className="text-balance tracking-tight md:tracking-normal text-xl md:text-2xl text-gray-700 leading-[1.4] font-normal">
                Your listing is automatically pushed to our {" "}
                <strong className="font-semibold text-gray-900">website</strong>,{" "}
                <strong className="font-semibold text-gray-900">Discord</strong>, and{" "}
                <strong className="font-semibold text-gray-900">LinkedIn</strong> — connecting with developers, designers, and engineers across San Antonio, the I-35 corridor, and the Rio Grande Valley.
              </p>
              <p className="text-base md:text-lg text-gray-500 leading-[1.6]">
                Free for a limited time during our Community Launch. Support DEVSA, a 501(c)(3) nonprofit bridging the gap between 20+ tech community groups, industry partners, and local talent.
              </p>
            </div>

            {/* Distribution channels */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Globe className="h-4 w-4 text-gray-500" />
                <span>devsa.community</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <svg className="h-4 w-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>800+ Community Members</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <svg className="h-4 w-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <span>600+ LinkedIn Followers</span>
              </div>
            </div>

            {/* How it works */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="leading-[1.4] font-medium">Create your listing</span>
              </div>
              <span className="hidden sm:inline text-gray-300">→</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="leading-[1.4] font-medium">Auto-shared to 3 channels</span>
              </div>
              <span className="hidden sm:inline text-gray-300">→</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="leading-[1.4] font-medium">Hire local talent</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-10">
              <a
                href="#open-positions"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                View Open Positions
              </a>
              <Link
                href="/jobs/signin?role=hiring"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                <PenSquare className="h-4 w-4" />
                Post a Job — It&apos;s Free
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Job Listings */}
      <section id="open-positions" className={`w-full px-4 sm:px-6 scroll-mt-4 ${isSignedIn ? "pt-6 lg:pt-20 lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto" : ""}`}>
        <div className="mx-auto max-w-7xl pb-16 sm:pb-24">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 leading-[1.2]">
              Open Positions
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
