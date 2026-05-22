"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  Loader2,
  ArrowLeft,
  Users,
  Briefcase,
  FileText,
  Shield,
  UserCircle,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react"

interface AdminUser {
  uid: string
  email: string
  role: "hiring" | "open-to-work"
  displayName: string
  firstName: string
  lastName: string
  profileImage?: string
  companyName?: string
  isActive: boolean
  createdAt: string
}

interface AdminJob {
  id: string
  title: string
  slug: string
  companyName: string
  authorUid: string
  authorName: string
  type: string
  locationType: string
  location?: string
  status: string
  applicantCount: number
  createdAt: string
}

interface AdminApplication {
  id: string
  jobId: string
  jobTitle: string
  applicantUid: string
  applicantName: string
  applicantEmail: string
  status: string
  createdAt: string
}

interface AdminStats {
  totalUsers: number
  hiringUsers: number
  openToWorkUsers: number
  totalJobs: number
  publishedJobs: number
  pendingJobs: number
  draftJobs: number
  closedJobs: number
  totalApplications: number
}

type Tab = "pending" | "users" | "jobs" | "applications"

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
  submitted: <Clock className="h-3 w-3" />,
  viewed: <Eye className="h-3 w-3" />,
  shortlisted: <CheckCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
}

export default function JobsAdminPage() {
  const router = useRouter()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("pending")
  const [reviewingJob, setReviewingJob] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  // Track which job is showing the inline rejection-reason form + the typed reason
  const [rejectingJobId, setRejectingJobId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/bounties/signin")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadAdminData = async () => {
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch("/api/bounties/admin", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 403) {
        setError("Access denied. Super admin privileges required.")
        setIsLoading(false)
        return
      }

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setUsers(data.users || [])
        setJobs(data.jobs || [])
        setApplications(data.applications || [])
        setStats(data.stats || null)
      }
    } catch {
      setError("Failed to load admin data")
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

  const handleReview = async (jobId: string, action: "approve" | "reject", reason?: string) => {
    setReviewingJob(jobId)
    try {
      const token = await getIdToken()
      const res = await fetch("/api/bounties/admin/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, action, reason }),
      })
      const data = await res.json()
      if (data.success) {
        setRejectingJobId(null)
        setRejectionReason("")
        await loadAdminData()
      } else {
        setError(data.error || "Review action failed")
      }
    } catch {
      setError("Failed to process review")
    } finally {
      setReviewingJob(null)
    }
  }

  // Reset search whenever the active tab changes — avoids confusing
  // "no results" states left over from another tab's query.
  useEffect(() => {
    setSearchQuery("")
  }, [activeTab])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3 leading-[1.2]">Access Restricted</h1>
          <p className="text-slate-500 mb-6 leading-relaxed">{error}</p>
          <Link href="/bounties/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const pendingJobs = jobs.filter((j) => j.status === "pending")

  // Per-tab filtering. One shared search input that targets the active tab's data.
  const q = searchQuery.trim().toLowerCase()
  const filteredPendingJobs = q
    ? pendingJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.authorName.toLowerCase().includes(q)
      )
    : pendingJobs
  const filteredUsers = q
    ? users.filter(
        (u) =>
          (u.displayName || "").toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.companyName || "").toLowerCase().includes(q)
      )
    : users
  const filteredJobs = q
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.authorName.toLowerCase().includes(q)
      )
    : jobs
  const filteredApplications = q
    ? applications.filter(
        (a) =>
          a.jobTitle.toLowerCase().includes(q) ||
          a.applicantName.toLowerCase().includes(q) ||
          a.applicantEmail.toLowerCase().includes(q)
      )
    : applications

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "pending", label: "Pending Review", icon: <AlertCircle className="h-4 w-4" />, count: pendingJobs.length },
    { key: "users", label: "Users & Profiles", icon: <Users className="h-4 w-4" />, count: stats?.totalUsers || 0 },
    { key: "jobs", label: "Job Listings", icon: <Briefcase className="h-4 w-4" />, count: stats?.totalJobs || 0 },
    { key: "applications", label: "Applications", icon: <FileText className="h-4 w-4" />, count: stats?.totalApplications || 0 },
  ]

  const searchPlaceholder: Record<Tab, string> = {
    pending: "Search pending by title, company, or author...",
    users: "Search users by name, email, or company...",
    jobs: "Search listings by title, company, or author...",
    applications: "Search applications by job, applicant, or email...",
  }

  return (
    <div className="min-h-dvh bg-white">
      <main className="mx-auto max-w-5xl px-5 sm:px-6 py-8 sm:py-12">
        <Link
          href="/bounties/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
              Bounties Admin
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-xs font-semibold">
              <Shield className="h-3 w-3" />
              Super Admin
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Review pending listings, manage users, and track activity across the platform.
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{stats.totalUsers}</p>
              <div className="flex gap-3 mt-1.5">
                <span className="text-xs text-slate-400">{stats.hiringUsers} hiring</span>
                <span className="text-xs text-slate-400">{stats.openToWorkUsers} seeking</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Jobs</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{stats.totalJobs}</p>
              <div className="flex gap-3 mt-1.5">
                <span className="text-xs text-green-600">{stats.publishedJobs} live</span>
                <span className="text-xs text-amber-600">{stats.pendingJobs} pending</span>
                <span className="text-xs text-slate-400">{stats.draftJobs} draft</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Applications</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{stats.totalApplications}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{stats.publishedJobs}</p>
              <div className="flex gap-3 mt-1.5">
                <span className="text-xs text-red-500">{stats.closedJobs} closed</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-4 sm:mb-5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-[#ef426f] text-[#ef426f]"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-xs rounded-full px-2 py-0.5 font-semibold tabular-nums ${
                activeTab === tab.key
                  ? "bg-[#ef426f]/10 text-[#ef426f]"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick search for the active tab — Linear-style fast filter. */}
        <div className="relative mb-5 sm:mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder[activeTab]}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Clear search"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "pending" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {pendingJobs.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">All caught up</h3>
                <p className="text-sm text-slate-500 leading-relaxed">No listings pending review.</p>
              </div>
            ) : filteredPendingJobs.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No pending listings match &ldquo;{searchQuery}&rdquo;.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
                  <p className="text-sm font-semibold text-amber-800">
                    {filteredPendingJobs.length} of {pendingJobs.length} awaiting review
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Approve to publish and share to Discord &amp; LinkedIn, or reject with a note so the poster knows what to fix.
                  </p>
                </div>
                {filteredPendingJobs.map((job) => {
                  const isRejecting = rejectingJobId === job.id
                  return (
                    <div key={job.id} className="p-4 sm:p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/bounties/${job.slug}`}
                                className="text-sm sm:text-base font-semibold text-slate-900 hover:text-[#ef426f] truncate transition-colors leading-tight"
                              >
                                {job.title}
                              </Link>
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 shrink-0">
                                pending
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 leading-normal">
                              <span className="font-medium text-slate-600">{job.companyName}</span>
                              <span>by {job.authorName}</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.locationType}{job.location ? ` · ${job.location}` : ""}
                              </span>
                              <span>{job.type.toUpperCase()}</span>
                              <span>{timeAgo(job.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Inline rejection-reason form — Linear pattern: expand in-place rather than open a modal. */}
                        {isRejecting ? (
                          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 sm:p-4">
                            <label className="block text-xs font-semibold text-red-900 mb-1.5">
                              Reason for rejection
                              <span className="font-normal text-red-700/70 ml-1">(sent to the poster)</span>
                            </label>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="e.g. Scope is too vague — please define deliverables. Or: doesn't match our community guidelines."
                              rows={3}
                              maxLength={500}
                              autoFocus
                              className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                              <span className="text-[11px] text-red-700/70">
                                {rejectionReason.length}/500 — leave blank to send a generic notice.
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setRejectingJobId(null)
                                    setRejectionReason("")
                                  }}
                                  disabled={reviewingJob === job.id}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleReview(job.id, "reject", rejectionReason.trim() || undefined)}
                                  disabled={reviewingJob === job.id}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                >
                                  {reviewingJob === job.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                  Confirm rejection
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 sm:ml-auto">
                            <button
                              onClick={() => handleReview(job.id, "approve")}
                              disabled={reviewingJob === job.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                              {reviewingJob === job.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingJobId(job.id)
                                setRejectionReason("")
                              }}
                              disabled={reviewingJob === job.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">No users yet</h3>
                <p className="text-sm text-slate-500 leading-relaxed">No one has created a profile on the job board.</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No users match &ldquo;{searchQuery}&rdquo;.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {/* Table header */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>User</span>
                  <span className="w-24 text-center">Role</span>
                  <span className="w-24 text-center">Status</span>
                  <span className="w-24 text-right">Joined</span>
                </div>
                {filteredUsers.map((u) => (
                  <div key={u.uid} className="px-4 sm:px-6 py-4 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                          {u.displayName || `${u.firstName} ${u.lastName}`.trim() || "Unnamed"}
                        </p>
                        <p className="text-xs text-slate-400 truncate leading-normal mt-0.5">{u.email}</p>
                        {u.companyName && (
                          <p className="text-xs text-slate-500 truncate leading-normal">{u.companyName}</p>
                        )}
                      </div>
                    </div>
                    <div className="w-24 flex justify-center mt-2 sm:mt-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "hiring"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {u.role === "hiring" ? "Hiring" : "Seeking"}
                      </span>
                    </div>
                    <div className="w-24 flex justify-center mt-1 sm:mt-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="w-24 text-right mt-1 sm:mt-0">
                      <span className="text-xs text-slate-400">{timeAgo(u.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {jobs.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">No listings</h3>
                <p className="text-sm text-slate-500 leading-relaxed">No listings have been posted on the platform yet.</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No listings match &ldquo;{searchQuery}&rdquo;.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/bounties/${job.slug}`}
                            className="text-sm sm:text-base font-semibold text-slate-900 hover:text-[#ef426f] truncate transition-colors leading-tight"
                          >
                            {job.title}
                          </Link>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${statusColors[job.status]}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 leading-normal">
                          <span className="font-medium text-slate-600">{job.companyName}</span>
                          <span>by {job.authorName}</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.locationType}{job.location ? ` · ${job.location}` : ""}
                          </span>
                          <span>{job.type.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Users className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{job.applicantCount}</span>
                        </span>
                        <span className="text-xs text-slate-400">{timeAgo(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">No applications</h3>
                <p className="text-sm text-slate-500 leading-relaxed">No one has applied yet.</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No applications match &ldquo;{searchQuery}&rdquo;.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {/* Table header */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto] gap-4 px-6 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Applicant</span>
                  <span>Job</span>
                  <span className="w-24 text-center">Status</span>
                  <span className="w-24 text-right">Applied</span>
                </div>
                {filteredApplications.map((app) => (
                  <div key={app.id} className="px-4 sm:px-6 py-4 sm:grid sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{app.applicantName}</p>
                      <p className="text-xs text-slate-400 truncate leading-normal mt-0.5">{app.applicantEmail}</p>
                    </div>
                    <div className="min-w-0 mt-1 sm:mt-0">
                      <p className="text-sm text-slate-700 truncate leading-tight">{app.jobTitle}</p>
                    </div>
                    <div className="w-24 flex justify-center mt-2 sm:mt-0">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[app.status]}`}>
                        {statusIcons[app.status]}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div className="w-24 text-right mt-1 sm:mt-0">
                      <span className="text-xs text-slate-400">{timeAgo(app.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
