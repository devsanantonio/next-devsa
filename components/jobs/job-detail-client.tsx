"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { CommentSection } from "@/components/jobs/comment-section"
import { sanitizeHtml } from "@/lib/sanitize"
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Tag,
  ExternalLink,
  MessageSquare,
  Loader2,
  CheckCircle,
  User,
  Bookmark,
  BookmarkCheck,
  Share2,
  Link2,
  Check,
  Pencil,
  XCircle,
  BarChart3,
  CalendarClock,
  Users,
} from "lucide-react"

interface JobDetail {
  id: string
  authorUid: string
  authorName: string
  companyName: string
  companyLogo?: string
  title: string
  slug: string
  type: "w2" | "1099" | "equity" | "internship" | "other"
  locationType: string
  location?: string
  salaryRange?: string
  description: string
  requirements?: string
  applicationUrl?: string
  equityRange?: string
  startupStage?: string
  tags: string[]
  applicantCount: number
  status: string
  createdAt: string
  expiresAt?: string
}

interface Comment {
  id: string
  jobId: string
  authorUid: string
  authorName: string
  authorImage?: string
  authorRole: "hiring" | "open-to-work"
  content: string
  mentions: string[]
  parentCommentId?: string
  createdAt: string
}

const typeLabels: Record<string, string> = {
  w2: "W-2 Employment",
  "1099": "1099 Contract",
  equity: "Co-founder / Equity",
  internship: "Internship / Apprenticeship",
  other: "Other",
}

const locationLabels: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
}

export function JobDetailClient({ job }: { job: JobDetail }) {
  const { user, getIdToken } = useAuth()

  const [comments, setComments] = useState<Comment[]>([])
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverNote, setCoverNote] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [userProfile, setUserProfile] = useState<{ uid: string; role: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showStickyApply, setShowStickyApply] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadComments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id])

  useEffect(() => {
    if (user) {
      loadUserProfile()
      checkSavedStatus()
      checkAppliedStatus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Sticky apply bar: show when the header CTA scrolls out of view
  useEffect(() => {
    if (!headerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyApply(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/bounties/comments?jobId=${job.id}`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {
      console.error("Failed to load comments")
    }
  }

  const loadUserProfile = async () => {
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
        setUserProfile({ uid: data.profile.uid, role: data.profile.role })
      }
    } catch {
      // Silently fail
    }
  }

  const checkSavedStatus = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/bounties/saved", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const saved = (data.savedJobs || []).some((s: { jobId: string }) => s.jobId === job.id)
      setIsSaved(saved)
    } catch {
      // silently fail
    }
  }

  const checkAppliedStatus = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch(`/api/bounties/applications?jobId=${job.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.applications?.some((a: { jobId: string }) => a.jobId === job.id)) {
        setHasApplied(true)
      }
    } catch {
      // silently fail
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleSave = async () => {
    if (!user) return
    try {
      const token = await getIdToken()
      const res = await fetch("/api/bounties/saved", {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: job.id }),
      })
      if (res.ok) setIsSaved(!isSaved)
    } catch {
      // silently fail
    }
  }

  const handleApply = async () => {
    if (!job.id) return
    setIsApplying(true)
    try {
      const token = await getIdToken()
      const res = await fetch("/api/bounties/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: job.id, coverNote }),
      })
      const data = await res.json()
      if (data.success) {
        setHasApplied(true)
        setShowApplyModal(false)
      }
    } catch {
      console.error("Failed to apply")
    } finally {
      setIsApplying(false)
    }
  }

  const handleAddComment = async (content: string, mentions: string[]) => {
    if (!job.id) return
    const token = await getIdToken()
    const res = await fetch("/api/bounties/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jobId: job.id, content, mentions }),
    })
    if (res.ok) {
      await loadComments()
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const token = await getIdToken()
    await fetch("/api/bounties/comments", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ commentId }),
    })
    await loadComments()
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 30) return `${diffDays} days ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="min-h-dvh bg-white pt-20 lg:pt-6">
      <main className="mx-auto max-w-4xl px-5 sm:px-6 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          href="/bounties#open-positions"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 mb-5 shadow-sm">
          {/* Status banner for closed/expired listings */}
          {(job.status === "closed" || (job.expiresAt && new Date(job.expiresAt) < new Date())) && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 mb-5 text-sm font-medium text-amber-700">
              <XCircle className="h-4 w-4 shrink-0" />
              {job.status === "closed" ? "This listing has been closed by the employer." : "This listing has expired."}
            </div>
          )}

          <div className="flex items-start gap-4 mb-5 sm:mb-6">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 overflow-hidden">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-contain p-2" />
              ) : (
                <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">{job.title}</h1>
              <p className="text-base sm:text-lg text-slate-500 mt-1 leading-relaxed">{job.companyName}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Share button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Share job"
                >
                  <Share2 className="h-5 w-5 text-slate-400" />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1">
                    <button
                      onClick={() => { copyLink(); setShowShareMenu(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.companyName}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Share on X
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Share on LinkedIn
                    </a>
                  </div>
                )}
              </div>
              {/* Bookmark button */}
              {user && (
                <button
                  onClick={handleToggleSave}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  title={isSaved ? "Unsave job" : "Save job"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-5 w-5 text-[#ef426f]" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-5 sm:mb-6">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold ${
              job.type === "w2" ? "bg-blue-50 text-blue-700 border border-blue-200" :
              job.type === "1099" ? "bg-orange-50 text-orange-700 border border-orange-200" :
              job.type === "equity" ? "bg-purple-50 text-purple-700 border border-purple-200" :
              job.type === "internship" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
              "bg-slate-100 text-slate-600 border border-slate-200"
            }`}>
              {typeLabels[job.type] || job.type}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs sm:text-sm text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              {locationLabels[job.locationType]}{job.location ? ` · ${job.location}` : ""}
            </span>
            {job.salaryRange && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs sm:text-sm text-slate-600">
                <DollarSign className="h-3.5 w-3.5" />
                {job.salaryRange}
              </span>
            )}
            {job.equityRange && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs sm:text-sm text-emerald-700">
                {job.equityRange} equity
              </span>
            )}
            {job.startupStage && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs sm:text-sm text-violet-700">
                {{
                  idea: "Idea / Pre-product",
                  mvp: "MVP / Prototype",
                  "pre-seed": "Pre-seed",
                  seed: "Seed",
                  "series-a": "Series A+",
                  revenue: "Revenue / Bootstrapped",
                }[job.startupStage] || job.startupStage}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs sm:text-sm text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Posted {timeAgo(job.createdAt)}
            </span>
            {job.expiresAt && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-medium ${
                new Date(job.expiresAt) < new Date()
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}>
                <CalendarClock className="h-3.5 w-3.5" />
                {new Date(job.expiresAt) < new Date()
                  ? "Expired"
                  : `Expires ${new Date(job.expiresAt).toLocaleDateString()}`}
              </span>
            )}
          </div>

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
              {job.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-500 font-medium">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Apply CTA */}
          <div ref={headerRef} className="flex flex-wrap items-center gap-3">
            {hasApplied ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-6 py-3 text-sm font-semibold text-green-700">
                <CheckCircle className="h-4 w-4" />
                Applied
              </div>
            ) : job.status === "closed" || (job.expiresAt && new Date(job.expiresAt) < new Date()) ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-400">
                No longer accepting applications
              </div>
            ) : userProfile?.role === "open-to-work" ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                Apply Now
              </button>
            ) : !user ? (
              <Link
                href="/bounties/signin"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                Sign in to Apply
              </Link>
            ) : null}

            {user && userProfile && job.authorUid !== userProfile.uid && (
              <Link
                href={`/bounties/dashboard/messages?startWith=${job.authorUid}&jobId=${job.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </Link>
            )}

            <span className="text-sm text-slate-500">
              <Users className="inline h-3.5 w-3.5 mr-1" />
              {job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Hiring Manager Actions - only visible to the job owner */}
        {userProfile && job.authorUid === userProfile.uid && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-8 mb-5 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 leading-snug flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-400" />
              Manage Listing
            </h2>
            <p className="text-sm text-slate-500 mb-4">You posted this job. Here are quick actions.</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/bounties/edit?id=${job.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit Listing
              </Link>
              <Link
                href="/bounties/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Users className="h-4 w-4" />
                View Applicants ({job.applicantCount})
              </Link>
              <Link
                href="/bounties/dashboard/messages"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 mb-5 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 leading-snug">About this role</h2>
          <div
            className="prose prose-sm max-w-none text-slate-600 prose-headings:text-slate-900 prose-a:text-[#ef426f]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }}
          />

          {job.requirements && (
            <>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-8 mb-4 leading-snug">Requirements</h2>
              <div
                className="prose prose-sm max-w-none text-slate-600 prose-headings:text-slate-900 prose-a:text-[#ef426f]"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.requirements) }}
              />
            </>
          )}

          {job.applicationUrl && (
            <div className="mt-8 rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
              <p className="text-sm font-semibold text-slate-900 mb-1">Apply Externally</p>
              <p className="text-xs text-slate-500 mb-3">This company also accepts applications through their own careers page.</p>
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Apply on Company Site
              </a>
            </div>
          )}
        </div>

        {/* About the Poster */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 mb-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 leading-snug">Posted by</h2>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{job.authorName}</p>
              <p className="text-xs text-slate-500">{job.companyName}</p>
            </div>
            {user && userProfile && job.authorUid !== userProfile.uid && (
              <Link
                href={`/bounties/dashboard/messages?startWith=${job.authorUid}&jobId=${job.id}`}
                className="ml-auto text-sm text-[#ef426f] hover:underline flex items-center gap-1 font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Message
              </Link>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
          <CommentSection
            jobId={job.id}
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            currentUserUid={userProfile?.uid}
          />
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 leading-snug">Apply to {job.title}</h3>
              <p className="text-sm text-slate-500 mb-6">at {job.companyName}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cover Note (optional)
                  </label>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Share why you're interested in this role..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                  />
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Your name, email, and cover note will be shared with the hiring manager.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="flex-1 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] disabled:opacity-50 transition-colors"
                  >
                    {isApplying ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Apply Bar - shown when CTA scrolls out of view */}
      {showStickyApply && !hasApplied && userProfile?.role === "open-to-work" && job.status !== "closed" && !(job.expiresAt && new Date(job.expiresAt) < new Date()) && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 z-40">
          <div className="mx-auto max-w-4xl flex items-center justify-between px-5 py-3">
            <div className="min-w-0 mr-4">
              <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
              <p className="text-xs text-slate-500 truncate">{job.companyName}</p>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
