"use client"

import { useState, useEffect } from "react"
import { JobCard } from "@/components/jobs/job-card"
import { JobFilters } from "@/components/jobs/job-filters"
import { Briefcase, Search } from "lucide-react"
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
                Find your next build
              </p>
              <h1 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Where San Antonio{" "}
                <span className="text-gray-600 font-light italic">Tech Talent</span>{" "}
                Connects.
              </h1>
            </div>
            <div className="max-w-3xl mt-8">
              <p className="text-balance tracking-tight md:tracking-normal text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
                No middleman and no noise. DEVSA is the direct bridge between passionate builders and the local companies shaping our tech ecosystem.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-10">
              <Link
                href="/jobs/signin?role=hiring"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                I&apos;m Hiring
              </Link>
              <Link
                href="/jobs/signin?role=open-to-work"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                <Search className="h-4 w-4" />
                Open to Work
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
                : "Be the first to post a job opportunity for the San Antonio tech community."}
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
