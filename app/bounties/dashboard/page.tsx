"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  Loader2,
  Briefcase,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  MapPin,
  ExternalLink,
  FileText,
  Pencil,
  MessageSquare,
  ChevronDown,
  UserCircle,
  Heart,
  Search,
  Send,
  Trash2,
} from "lucide-react"

// Hiring users' "my listings" surface now loads Bounty docs (Slice 2 migration).
// We retain the JobListing type name for now to minimize churn in this dashboard;
// it maps to Bounty fields via orgName (preferred) or legacy companyName fallback.
interface JobListing {
  id: string
  title: string
  slug: string
  companyName?: string
  orgName?: string
  type?: string
  locationType?: string
  location?: string
  status: string
  applicantCount: number
  amountCents?: number
  createdAt: string
}

interface Application {
  id: string
  jobId: string
  jobTitle: string
  companyName: string
  applicantName?: string
  applicantEmail?: string
  applicantUid?: string
  status: string
  coverNote?: string
  createdAt: string
}

interface UserProfile {
  uid: string
  email?: string
  role: "hiring" | "open-to-work"
  displayName: string
  firstName?: string
  lastName?: string
  profileImage?: string
  companyName?: string
  isSuperAdmin?: boolean
  bio?: string
  workHistory?: { company: string; title: string }[]
  education?: { institution: string; degree: string }[]
  projectSpotlights?: { title: string }[]
  linkedin?: string
  github?: string
  website?: string
  phone?: string
}

interface SavedJob {
  id: string
  jobId: string
  savedAt: string
  title?: string
  slug?: string
  companyName?: string
  type?: string
  locationType?: string
  location?: string
  status?: string
}

const statusColors: Record<string, string> = {
  submitted: "text-blue-700 bg-blue-50 border border-blue-200",
  viewed: "text-amber-700 bg-amber-50 border border-amber-200",
  shortlisted: "text-green-700 bg-green-50 border border-green-200",
  rejected: "text-red-700 bg-red-50 border border-red-200",
  published: "text-green-700 bg-green-50 border border-green-200",
  pending: "text-amber-700 bg-amber-50 border border-amber-200",
  draft: "text-slate-600 bg-slate-100 border border-slate-200",
  closed: "text-red-700 bg-red-50 border border-red-200",
}

const statusIcons: Record<string, React.ReactNode> = {
  submitted: <Clock className="h-3.5 w-3.5" />,
  viewed: <Eye className="h-3.5 w-3.5" />,
  shortlisted: <CheckCircle className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [myJobs, setMyJobs] = useState<JobListing[]>([])
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [allJobs, setAllJobs] = useState<JobListing[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [expandedCoverNote, setExpandedCoverNote] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [fullProfile, setFullProfile] = useState<UserProfile | null>(null)
  const [applicationFilter, setApplicationFilter] = useState<string>("all")
  const [removingSavedJob, setRemovingSavedJob] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/bounties/signin")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) loadDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadDashboardData = async () => {
    try {
      const token = await getIdToken()
      if (!token) return

      // Verify and get profile
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.hasProfile) {
        router.push("/bounties/signin")
        return
      }
      setProfile(verifyData.profile)

      const isSuperAdmin = verifyData.isSuperAdmin === true

      if (isSuperAdmin) {
        // Super admin: load ALL jobs and ALL applications
        setProfile({ ...verifyData.profile, isSuperAdmin: true, email: verifyData.profile.email || user?.email })

        const allJobsRes = await fetch("/api/bounties?status=all", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const allJobsData = await allJobsRes.json()
        setAllJobs(allJobsData.bounties || allJobsData.listings || [])

        const allAppsRes = await fetch("/api/bounties/applications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const allAppsData = await allAppsRes.json()
        setAllApplications(allAppsData.applications || [])
      } else if (verifyData.profile.role === "hiring") {
        // Load my posted jobs and all applications for my jobs
        const [jobsRes, appsRes] = await Promise.all([
          fetch(`/api/bounties?authorUid=${verifyData.profile.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/bounties/applications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        const jobsData = await jobsRes.json()
        const appsData = await appsRes.json()
        setMyJobs(jobsData.bounties || jobsData.listings || [])
        setMyApplications(appsData.applications || [])
      } else {
        // Load my applications, saved jobs, and full profile
        const [appsRes, savedRes, profileRes] = await Promise.all([
          fetch("/api/bounties/applications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/bounties/saved", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/job-board/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        const appsData = await appsRes.json()
        setMyApplications(appsData.applications || [])

        const savedData = await savedRes.json()
        const savedJobsList = savedData.savedJobs || []
        // Enrich saved jobs with listing details
        if (savedJobsList.length > 0) {
          const jobsRes = await fetch("/api/bounties?status=all", {
            headers: { Authorization: `Bearer ${token}` },
          })
          const jobsData = await jobsRes.json()
          const jobsMap = new Map((jobsData.bounties || jobsData.listings || []).map((j: JobListing) => [j.id, j]))
          const enriched = savedJobsList.map((s: SavedJob) => {
            const job = jobsMap.get(s.jobId) as JobListing | undefined
            return {
              ...s,
              title: job?.title,
              slug: job?.slug,
              companyName: job?.companyName,
              type: job?.type,
              locationType: job?.locationType,
              location: job?.location,
              status: job?.status,
            }
          }).filter((s: SavedJob) => s.title)
          setSavedJobs(enriched)
        }

        const profileData = await profileRes.json()
        if (profileData.profile) setFullProfile(profileData.profile)
      }
    } catch {
      console.error("Failed to load dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const d = new Date(date)
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 30) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(applicationId)
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/bounties/applications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, status: newStatus }),
      })
      if (res.ok) {
        setMyApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        )
        setAllApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        )
      }
    } catch {
      console.error("Failed to update status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const removeSavedJob = async (jobId: string) => {
    setRemovingSavedJob(jobId)
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/bounties/saved", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      })
      if (res.ok) {
        setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId))
      }
    } catch {
      console.error("Failed to remove saved job")
    } finally {
      setRemovingSavedJob(null)
    }
  }

  const filteredApplications = applicationFilter === "all"
    ? myApplications
    : myApplications.filter((app) => app.status === applicationFilter)

  if (authLoading || isLoading) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-dvh bg-white">

      <main className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-12 md:pt-20 lg:pt-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 md:pt-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {(profile.role === "hiring" || profile.isSuperAdmin) && (
              <Link
                href="/bounties/post"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Post a Bounty
              </Link>
            )}
          </div>
        </div>

        {/* Super Admin: All Bounties Overview */}
        {profile.isSuperAdmin && (
          <div className="space-y-6 sm:space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">All Bounties</h2>
                <p className="text-sm text-slate-500 mt-0.5">{allJobs.length} total</p>
              </div>
              {allJobs.length === 0 ? (
                <div className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No bounties posted yet</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">No bounties exist on the platform.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {allJobs.map((job) => (
                    <div key={job.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/bounties/${job.slug}`}
                            className="text-base font-semibold text-slate-900 hover:text-[#ef426f] truncate transition-colors"
                          >
                            {job.title}
                          </Link>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>{job.orgName || job.companyName}</span>
                          {job.amountCents && (
                            <span className="font-medium text-emerald-700 tabular-nums">
                              ${(job.amountCents / 100).toLocaleString()}
                            </span>
                          )}
                          <span>{timeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Users className="h-4 w-4" />
                          {job.applicantCount} interested
                        </span>
                        <Link
                          href={`/bounties/${job.slug}`}
                          className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline font-medium"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                        <Link
                          href={`/bounties/edit?id=${job.id}`}
                          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 hover:underline font-medium"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">All Applications</h2>
                <p className="text-sm text-slate-500 mt-0.5">{allApplications.length} total</p>
              </div>
              {allApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">No applications have been submitted on the platform.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {allApplications.map((app) => (
                    <div key={app.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-slate-900 truncate">{app.jobTitle}</p>
                        <p className="text-sm text-slate-500">{app.companyName}</p>
                        <p className="text-xs text-slate-400 mt-1">Applied {timeAgo(app.createdAt)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[app.status]}`}>
                        {statusIcons[app.status]}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hiring: Stats + Job Listings + Applicants */}
        {profile.role === "hiring" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Overview */}
            {myJobs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{myJobs.length}</p>
                      <p className="text-xs text-slate-500">Total Listings</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                      <Eye className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{myJobs.filter(j => j.status === "published").length}</p>
                      <p className="text-xs text-slate-500">Active</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef426f]/10">
                      <Users className="h-5 w-5 text-[#ef426f]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{myApplications.length}</p>
                      <p className="text-xs text-slate-500">Applicants</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{myApplications.filter(a => a.status === "submitted").length}</p>
                      <p className="text-xs text-slate-500">Pending Review</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bounties with expandable claims (claims wiring lands in Slice 3) */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Your Bounties</h2>
                <p className="text-sm text-slate-500 mt-0.5">{myJobs.length} bount{myJobs.length !== 1 ? "ies" : "y"}</p>
              </div>
              {myJobs.length === 0 ? (
                <div className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No bounties posted yet</h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">Post your first bounty to start matching with local builders.</p>
                  <Link
                    href="/bounties/post"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93a60]"
                  >
                    <Plus className="h-4 w-4" />
                    Post a Bounty
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {myJobs.map((job) => {
                    const jobApps = myApplications.filter((a) => a.jobId === job.id)
                    const isExpanded = expandedJob === job.id
                    return (
                      <div key={job.id}>
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/bounties/${job.slug}`}
                                className="text-base font-semibold text-slate-900 hover:text-[#ef426f] truncate transition-colors"
                              >
                                {job.title}
                              </Link>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                                {job.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                              <span>{job.orgName || job.companyName}</span>
                              {job.amountCents && (
                                <span className="font-medium text-emerald-700 tabular-nums">
                                  ${(job.amountCents / 100).toLocaleString()}
                                </span>
                              )}
                              <span>{timeAgo(job.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                              className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition-colors ${
                                jobApps.length > 0
                                  ? "text-[#ef426f] bg-[#ef426f]/5 hover:bg-[#ef426f]/10"
                                  : "text-slate-400 bg-slate-50"
                              }`}
                            >
                              <Users className="h-4 w-4" />
                              {jobApps.length} applicant{jobApps.length !== 1 ? "s" : ""}
                              {jobApps.length > 0 && (
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              )}
                            </button>
                            <Link
                              href={`/bounties/${job.slug}`}
                              className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline font-medium"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </Link>
                            <Link
                              href={`/bounties/edit?id=${job.id}`}
                              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 hover:underline font-medium"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </div>
                        </div>

                        {/* Expanded Applicants */}
                        {isExpanded && jobApps.length > 0 && (
                          <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-6 py-4">
                            <div className="space-y-3">
                              {jobApps.map((app) => (
                                <div
                                  key={app.id}
                                  className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    {/* Applicant Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2.5 mb-1">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 shrink-0">
                                          <UserCircle className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-slate-900">{app.applicantName || "Applicant"}</p>
                                          {app.applicantEmail && (
                                            <p className="text-xs text-slate-500">{app.applicantEmail}</p>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-xs text-slate-400 mt-2">Applied {timeAgo(app.createdAt)}</p>

                                      {/* Cover Note */}
                                      {app.coverNote && (
                                        <div className="mt-3">
                                          <button
                                            onClick={() => setExpandedCoverNote(expandedCoverNote === app.id ? null : app.id)}
                                            className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                                          >
                                            <FileText className="h-3 w-3" />
                                            Cover Note
                                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedCoverNote === app.id ? "rotate-180" : ""}`} />
                                          </button>
                                          {expandedCoverNote === app.id && (
                                            <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 p-3">
                                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{app.coverNote}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Status + Actions */}
                                    <div className="flex flex-col items-end gap-2.5 shrink-0">
                                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[app.status]}`}>
                                        {statusIcons[app.status]}
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {app.status === "submitted" && (
                                          <button
                                            onClick={() => updateApplicationStatus(app.id, "viewed")}
                                            disabled={updatingStatus === app.id}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                          >
                                            <Eye className="h-3 w-3" />
                                            Mark Viewed
                                          </button>
                                        )}
                                        {(app.status === "submitted" || app.status === "viewed") && (
                                          <button
                                            onClick={() => updateApplicationStatus(app.id, "shortlisted")}
                                            disabled={updatingStatus === app.id}
                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                          >
                                            <CheckCircle className="h-3 w-3" />
                                            Shortlist
                                          </button>
                                        )}
                                        {app.status !== "rejected" && (
                                          <button
                                            onClick={() => updateApplicationStatus(app.id, "rejected")}
                                            disabled={updatingStatus === app.id}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                                          >
                                            <XCircle className="h-3 w-3" />
                                            Reject
                                          </button>
                                        )}
                                      </div>
                                      {/* Message applicant */}
                                      {app.applicantUid && (
                                        <Link
                                          href={`/bounties/dashboard/messages?startWith=${app.applicantUid}&jobId=${app.jobId}`}
                                          className="inline-flex items-center gap-1 text-xs font-medium text-[#ef426f] hover:underline"
                                        >
                                          <MessageSquare className="h-3 w-3" />
                                          Message
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {isExpanded && jobApps.length === 0 && (
                          <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-6 py-6 text-center">
                            <p className="text-sm text-slate-400">No applications received yet for this listing.</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Open to Work: Full Dashboard */}
        {profile.role === "open-to-work" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Send className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{myApplications.length}</p>
                    <p className="text-xs text-slate-500">Applied</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                    <Eye className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {myApplications.filter((a) => a.status === "submitted" || a.status === "viewed").length}
                    </p>
                    <p className="text-xs text-slate-500">Under Review</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {myApplications.filter((a) => a.status === "shortlisted").length}
                    </p>
                    <p className="text-xs text-slate-500">Shortlisted</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef426f]/10">
                    <Heart className="h-5 w-5 text-[#ef426f]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{savedJobs.length}</p>
                    <p className="text-xs text-slate-500">Saved Jobs</p>
                  </div>
                </div>
              </div>
            </div>



            {/* Saved Jobs */}
            {savedJobs.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Saved Jobs</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{savedJobs.length} saved</p>
                  </div>
                  <Link
                    href="/bounties#open-positions"
                    className="text-sm font-medium text-[#ef426f] hover:underline"
                  >
                    Find More
                  </Link>
                </div>
                <div className="divide-y divide-slate-200">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/bounties/${job.slug}`}
                            className="text-base font-semibold text-slate-900 hover:text-[#ef426f] truncate transition-colors"
                          >
                            {job.title}
                          </Link>
                          {job.status === "closed" && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200">
                              Closed
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>{job.companyName}</span>
                          {job.locationType && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.locationType}
                              {job.location ? ` · ${job.location}` : ""}
                            </span>
                          )}
                          {job.type && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {job.type.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/bounties/${job.slug}`}
                          className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline font-medium"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                        <button
                          onClick={() => removeSavedJob(job.jobId)}
                          disabled={removingSavedJob === job.jobId}
                          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-red-500 font-medium transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications with filters */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Your Applications</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{myApplications.length} application{myApplications.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {/* Status filter tabs */}
                {myApplications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {[
                      { key: "all", label: "All", count: myApplications.length },
                      { key: "submitted", label: "Submitted", count: myApplications.filter((a) => a.status === "submitted").length },
                      { key: "viewed", label: "Viewed", count: myApplications.filter((a) => a.status === "viewed").length },
                      { key: "shortlisted", label: "Shortlisted", count: myApplications.filter((a) => a.status === "shortlisted").length },
                      { key: "rejected", label: "Rejected", count: myApplications.filter((a) => a.status === "rejected").length },
                    ].filter((tab) => tab.key === "all" || tab.count > 0).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setApplicationFilter(tab.key)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          applicationFilter === tab.key
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tab.label}
                        <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          applicationFilter === tab.key
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {myApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">Browse job listings to find your next opportunity.</p>
                  <Link
                    href="/bounties#open-positions"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93a60]"
                  >
                    <Search className="h-4 w-4" />
                    Browse Jobs
                  </Link>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400">No applications with this status.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredApplications.map((app) => (
                    <div key={app.id} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-base font-semibold text-slate-900 truncate">{app.jobTitle}</p>
                          </div>
                          <p className="text-sm text-slate-500">{app.companyName}</p>
                          <p className="text-xs text-slate-400 mt-1">Applied {timeAgo(app.createdAt)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[app.status]}`}>
                            {statusIcons[app.status]}
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/bounties/${app.jobId}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Job
                            </Link>
                            <Link
                              href={`/bounties/dashboard/messages?jobId=${app.jobId}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#ef426f] hover:underline"
                            >
                              <MessageSquare className="h-3 w-3" />
                              Message
                            </Link>
                          </div>
                        </div>
                      </div>
                      {/* Expandable cover note */}
                      {app.coverNote && (
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedCoverNote(expandedCoverNote === app.id ? null : app.id)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            Your Cover Note
                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedCoverNote === app.id ? "rotate-180" : ""}`} />
                          </button>
                          {expandedCoverNote === app.id && (
                            <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 p-3">
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{app.coverNote}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
