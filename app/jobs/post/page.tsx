"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Save,
  Send,
  Globe,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

const jobTypes = [
  { value: "w2", label: "W-2 Employment" },
  { value: "1099", label: "1099 Contract" },
  { value: "equity", label: "Co-founder / Equity" },
  { value: "internship", label: "Internship / Apprenticeship" },
  { value: "other", label: "Other" },
]

const locationTypes = [
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
]

const regionOptions = [
  "San Antonio, TX",
  "New Braunfels, TX",
  "San Marcos, TX",
  "Austin, TX (IH-35 Corridor)",
  "McAllen, TX (RGV)",
  "Brownsville, TX (RGV)",
  "Edinburg, TX (RGV)",
  "Laredo, TX",
  "Other",
]

export default function PostJobPage() {
  const router = useRouter()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [type, setType] = useState("w2")
  const [locationType, setLocationType] = useState("onsite")
  const [location, setLocation] = useState("")
  const [salaryRange, setSalaryRange] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [applicationUrl, setApplicationUrl] = useState("")
  const [equityRange, setEquityRange] = useState("")
  const [startupStage, setStartupStage] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [expiresInDays, setExpiresInDays] = useState(60)

  useEffect(() => {
    if (!authLoading && !user) router.push("/jobs/signin")
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) checkRole()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const checkRole = async () => {
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
        setUserRole(data.profile.role)
        if (data.profile.companyName) setCompanyName(data.profile.companyName)
      }
    } catch {
      // ignored
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const handleSubmit = async (status: "published" | "draft") => {
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      const token = await getIdToken()
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          companyName,
          type,
          locationType,
          location: location || undefined,
          salaryRange: salaryRange || undefined,
          description: description || "<p>No description provided.</p>",
          requirements: requirements || undefined,
          applicationUrl: applicationUrl || undefined,
          equityRange: type === "equity" ? equityRange || undefined : undefined,
          startupStage: type === "equity" ? startupStage || undefined : undefined,
          tags,
          status,
          expiresInDays,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (status === "published") {
          setPublishedSlug(data.slug)
        } else {
          router.push("/jobs/dashboard")
        }
      }
    } catch {
      console.error("Failed to post job")
    } finally {
      setIsSubmitting(false)
    }
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

  if (userRole !== "hiring") {
    return (
      <div className="min-h-dvh bg-white">
        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4">Access Restricted</h1>
          <p className="text-slate-500 mb-6 leading-relaxed">Only accounts with the &quot;Hiring&quot; role can post job listings.</p>
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  // Success state after publishing
  if (publishedSlug) {
    const jobUrl = `/jobs/${publishedSlug}`
    return (
      <div className="min-h-dvh bg-white">
        <main className="mx-auto max-w-2xl px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug mb-3">
            Your job is live!
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 max-w-md mx-auto">
            It&apos;s being shared to the DEVSA Discord and will be visible on our website right now.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 mb-8 text-left max-w-md mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Shared to</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200">
                  <Globe className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">DEVSA Website</p>
                  <p className="text-xs text-slate-400">Live at devsa.community/jobs</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20">
                  <svg className="h-4 w-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">DEVSA Discord</p>
                  <p className="text-xs text-slate-400">Posted to #jobs channel</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/20">
                  <svg className="h-4 w-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">DEVSA LinkedIn</p>
                  <p className="text-xs text-slate-400">Shared to organization page</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={jobUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Your Listing
            </Link>
            <Link
              href="/jobs/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white">

      <main className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-12 pt-20 lg:pt-8">

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-2">Post a Job</h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Reach developers, designers, and engineers across San Antonio, the IH-35 corridor, and the Rio Grande Valley.
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 leading-tight">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Developer"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name *</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company or organization name"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Employment Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm appearance-none"
                  >
                    {jobTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Arrangement *</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm appearance-none"
                  >
                    {locationTypes.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            {type === "equity" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Equity Range</label>
                  <input
                    value={equityRange}
                    onChange={(e) => setEquityRange(e.target.value)}
                    placeholder="e.g. 5-15%"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Startup Stage</label>
                  <select
                    value={startupStage}
                    onChange={(e) => setStartupStage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm appearance-none"
                  >
                    <option value="">Select stage...</option>
                    <option value="idea">Idea / Pre-product</option>
                    <option value="mvp">MVP / Prototype</option>
                    <option value="pre-seed">Pre-seed</option>
                    <option value="seed">Seed</option>
                    <option value="series-a">Series A+</option>
                    <option value="revenue">Revenue / Bootstrapped</option>
                  </select>
                </div>
              </div>
            )}
            </div>
          </section>

          {/* Location & Compensation */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 leading-tight">Location & Compensation</h2>
            <p className="text-sm text-slate-400 mb-4">This board serves San Antonio, the IH-35 corridor (New Braunfels, San Marcos), and the Rio Grande Valley.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Region / City</label>
                <select
                  value={regionOptions.includes(location) ? location : (location ? "Other" : "")}
                  onChange={(e) => {
                    if (e.target.value === "Other") {
                      setLocation("")
                    } else {
                      setLocation(e.target.value)
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm appearance-none"
                >
                  <option value="">Select a region...</option>
                  {regionOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              {(!regionOptions.includes(location) && location !== "") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Seguin, TX"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Salary / Compensation Range</label>
                <input
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. $80k - $120k / year"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
                <p className="text-xs text-slate-400 mt-1.5">Listings with salary ranges get significantly more visibility.</p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 leading-tight">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, day-to-day responsibilities, team structure, and what makes this opportunity unique..."
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">HTML formatting supported. Be specific — candidates want to know what they&apos;ll actually be working on.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="List must-have skills, preferred qualifications, years of experience, and any certifications..."
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Application URL</label>
                <input
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://your-company.com/careers/apply"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
                <p className="text-xs text-slate-400 mt-1.5">Link to your external application page (optional). Candidates can also apply directly through DEVSA.</p>
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 leading-tight">Tags & Expiration</h2>

            {/* Expiration */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Listing Duration</label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm appearance-none"
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days (default)</option>
                <option value={90}>90 days</option>
              </select>
              <p className="text-xs text-slate-400 mt-1.5">Listing will auto-expire after this period. You can re-publish from your dashboard.</p>
            </div>

            {/* Tags input */}
            <div className="flex items-center gap-2 mb-3">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add a tag (e.g. React, Python, DevOps)"
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
              />
              <button
                onClick={addTag}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-sm text-slate-600"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {tags.length >= 10 && (
              <p className="text-xs text-slate-400 mt-2">Maximum 10 tags reached</p>
            )}
          </section>

          {/* Distribution Preview */}
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1 leading-tight">Where your job will be shared</h2>
            <p className="text-sm text-slate-500 mb-4">Publishing reaches the entire DEVSA network automatically.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                  <Globe className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">DEVSA Website</p>
                  <p className="text-xs text-slate-400">Listed on devsa.community/jobs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 shadow-sm">
                  <svg className="h-4 w-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">DEVSA Discord</p>
                  <p className="text-xs text-slate-400">Auto-posted to #jobs channel</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/20 shadow-sm">
                  <svg className="h-4 w-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">DEVSA LinkedIn</p>
                  <p className="text-xs text-slate-400">Shared to DEVSA organization page</p>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors disabled:opacity-50 flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish Job
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
