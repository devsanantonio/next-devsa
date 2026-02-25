"use client"

import { useState, useEffect, useRef } from "react"
import { JobCard } from "@/components/jobs/job-card"
import { JobFilters } from "@/components/jobs/job-filters"
import {
  Briefcase,
  User,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  Bell,
  PenSquare,
  FileText,
  Bookmark,
  LogOut,
} from "lucide-react"
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
  const { user, getIdToken, signOut } = useAuth()
  const [listings] = useState<JobListingItem[]>(initialListings)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [profile, setProfile] = useState<JobBoardProfile | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchSavedJobs()
      fetchMyApplications()
      loadProfile()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

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

  const handleSignOut = async () => {
    await signOut()
    setProfile(null)
    setShowUserMenu(false)
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
          <div className="flex items-center gap-3">
            {user && profile ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ef426f] overflow-hidden">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="hidden sm:block font-medium text-gray-900">
                    {profile.firstName}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-semibold text-gray-900">{profile.firstName} {profile.lastName}</p>
                        <span className={`inline-flex items-center mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          profile.role === "hiring"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {profile.role === "hiring" ? "Hiring" : "Open to Work"}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/jobs/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/jobs/dashboard/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          Edit Profile
                        </Link>
                        <Link
                          href="/jobs/dashboard/messages"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          Messages
                        </Link>
                        <Link
                          href="/jobs/dashboard/notifications"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Bell className="h-4 w-4 text-gray-400" />
                          Notifications
                        </Link>
                      </div>
                      <div className="p-1.5 border-t border-gray-100">
                        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {profile.role === "hiring" ? "Hiring Tools" : "Job Seeker"}
                        </p>
                        {profile.role === "hiring" && (
                          <>
                            <Link
                              href="/jobs/post"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-[#ef426f] font-medium hover:bg-pink-50 rounded-lg transition-colors"
                            >
                              <PenSquare className="h-4 w-4" />
                              Post a Job
                            </Link>
                            <Link
                              href="/jobs/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              My Listings
                            </Link>
                          </>
                        )}
                        {profile.role === "open-to-work" && (
                          <>
                            <Link
                              href="/jobs/dashboard?tab=applications"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <FileText className="h-4 w-4 text-gray-400" />
                              My Applications
                            </Link>
                            <Link
                              href="/jobs"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Bookmark className="h-4 w-4 text-gray-400" />
                              Saved Jobs
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="p-1.5 border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/jobs/signin"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
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
