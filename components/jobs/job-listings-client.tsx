"use client"

import { useState, useEffect } from "react"
import { JobCard } from "@/components/jobs/job-card"
import { JobFilters } from "@/components/jobs/job-filters"
import { Briefcase } from "lucide-react"
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
    <section id="open-positions" className="w-full bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-12 sm:py-20 scroll-mt-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[-0.02em] text-gray-900 leading-[1.1]">
              Open Positions
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed font-normal">
              Browse opportunities from the San Antonio tech community
            </p>
          </div>
          <Link
            href={user ? "/jobs/post" : "/jobs/signin"}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Post a Job
          </Link>
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
        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mb-5" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-[1.3]">
              {searchQuery || selectedType !== "all" || selectedLocation !== "all"
                ? "No jobs match your filters"
                : "No jobs posted yet"}
            </h3>
            <p className="text-gray-500 text-sm leading-[1.6] max-w-md font-normal">
              {searchQuery || selectedType !== "all" || selectedLocation !== "all"
                ? "Try adjusting your search criteria or clearing filters."
                : "Be the first to post a job opportunity for the San Antonio tech community."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium leading-normal">
              {filteredListings.length} job{filteredListings.length !== 1 ? "s" : ""} found
            </p>
            {filteredListings.map((listing) => (
              <JobCard
                key={listing.id}
                {...listing}
                isSaved={savedJobIds.has(listing.id)}
                hasApplied={appliedJobIds.has(listing.id)}
                onToggleSave={user ? handleToggleSave : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
