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
  Shield,
  UserCircle,
  LogOut,
  ChevronDown,
  Settings,
  ArrowLeft,
} from "lucide-react"

interface JobListing {
  id: string
  title: string
  slug: string
  companyName: string
  type: string
  locationType: string
  location?: string
  status: string
  applicantCount: number
  createdAt: string
}

interface Application {
  id: string
  jobId: string
  jobTitle: string
  companyName: string
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
}

const statusColors: Record<string, string> = {
  submitted: "text-blue-700 bg-blue-50 border border-blue-200",
  viewed: "text-amber-700 bg-amber-50 border border-amber-200",
  shortlisted: "text-green-700 bg-green-50 border border-green-200",
  rejected: "text-red-700 bg-red-50 border border-red-200",
  published: "text-green-700 bg-green-50 border border-green-200",
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
  const { user, getIdToken, signOut, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [myJobs, setMyJobs] = useState<JobListing[]>([])
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [allJobs, setAllJobs] = useState<JobListing[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/jobs/signin")
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
        router.push("/jobs/signin")
        return
      }
      setProfile(verifyData.profile)

      const isSuperAdmin = verifyData.isSuperAdmin === true

      if (isSuperAdmin) {
        // Super admin: load ALL jobs and ALL applications
        setProfile({ ...verifyData.profile, isSuperAdmin: true, email: verifyData.profile.email || user?.email })

        const allJobsRes = await fetch("/api/jobs?status=all", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const allJobsData = await allJobsRes.json()
        setAllJobs(allJobsData.listings || [])

        const allAppsRes = await fetch("/api/jobs/applications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const allAppsData = await allAppsRes.json()
        setAllApplications(allAppsData.applications || [])
      } else if (verifyData.profile.role === "hiring") {
        // Load my posted jobs
        const jobsRes = await fetch(`/api/jobs?authorUid=${verifyData.profile.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const jobsData = await jobsRes.json()
        setMyJobs(jobsData.listings || [])
      } else {
        // Load my applications
        const appsRes = await fetch("/api/jobs/applications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const appsData = await appsRes.json()
        setMyApplications(appsData.applications || [])
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

      <main className="mx-auto max-w-5xl px-5 sm:px-6 py-8 sm:py-12 mt-6">
        {/* Back to Jobs */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {(profile.role === "hiring" || profile.isSuperAdmin) && (
              <Link
                href="/jobs/post"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Post a Job
              </Link>
            )}

            {/* User Profile Dropdown — matches admin page style */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden shrink-0">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 leading-tight">Hello, {profile.displayName || profile.firstName || "there"}</p>
                  <p className={`text-xs ${
                    profile.isSuperAdmin ? "text-purple-600" :
                    profile.role === "hiring" ? "text-blue-600" : "text-emerald-600"
                  }`}>
                    {profile.isSuperAdmin ? "Super Admin" : profile.role === "hiring" ? "Hiring" : "Open to Work"}
                  </p>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden shrink-0">
                          {profile.profileImage ? (
                            <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <UserCircle className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User"}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{profile.email || user?.email}</p>
                          <span className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            profile.isSuperAdmin
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : profile.role === "hiring"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {profile.isSuperAdmin ? "Super Admin" : profile.role === "hiring" ? "Hiring" : "Open to Work"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        href="/jobs/dashboard/profile"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Edit Profile
                      </Link>
                      <Link
                        href="/jobs"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        Browse Jobs
                      </Link>
                      {profile.isSuperAdmin && (
                        <Link
                          href="/jobs/admin"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          Jobs Admin
                        </Link>
                      )}
                      {(profile.role === "hiring" || profile.isSuperAdmin) && (
                        <Link
                          href="/jobs/post"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors sm:hidden"
                        >
                          <Plus className="h-4 w-4 text-slate-400" />
                          Post a Job
                        </Link>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={async () => {
                          setMenuOpen(false)
                          await signOut()
                          router.push("/jobs")
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Super Admin: All Jobs Overview */}
        {profile.isSuperAdmin && (
          <div className="space-y-6 sm:space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">All Job Listings</h2>
                <p className="text-sm text-slate-500 mt-0.5">{allJobs.length} total</p>
              </div>
              {allJobs.length === 0 ? (
                <div className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">No job listings exist on the platform.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {allJobs.map((job) => (
                    <div key={job.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/jobs/${job.slug}`}
                            className="text-base font-semibold text-slate-900 hover:text-[#ef426f] truncate transition-colors"
                          >
                            {job.title}
                          </Link>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>{job.companyName}</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.locationType}
                            {job.location ? ` · ${job.location}` : ""}
                          </span>
                          <span>{timeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Users className="h-4 w-4" />
                          {job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}
                        </span>
                        <Link
                          href={`/jobs/${job.slug}`}
                          className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline font-medium"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
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

        {/* Hiring: Job Listings */}
        {profile.role === "hiring" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Your Job Listings</h2>
                <p className="text-sm text-slate-500 mt-0.5">{myJobs.length} listing{myJobs.length !== 1 ? "s" : ""}</p>
            </div>
            {myJobs.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">Create your first job listing to start finding talent.</p>
                <Link
                  href="/jobs/post"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93a60]"
                >
                  <Plus className="h-4 w-4" />
                  Post a Job
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {myJobs.map((job) => (
                  <div key={job.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/jobs/${job.slug}`}
                          className="text-base font-semibold text-slate-900 hover:text-[#ef426f] truncate transition-colors"
                        >
                          {job.title}
                        </Link>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{job.companyName}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.locationType}
                          {job.location ? ` · ${job.location}` : ""}
                        </span>
                        <span>{timeAgo(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <Users className="h-4 w-4" />
                        {job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}
                      </span>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Open to Work: Applications */}
        {profile.role === "open-to-work" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Your Applications</h2>
                <p className="text-sm text-slate-500 mt-0.5">{myApplications.length} application{myApplications.length !== 1 ? "s" : ""}</p>
            </div>
            {myApplications.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">Browse job listings to find your next opportunity.</p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93a60]"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {myApplications.map((app) => (
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
        )}
      </main>
    </div>
  )
}
