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
} from "lucide-react"
import Link from "next/link"

const jobTypes = [
  { value: "w2", label: "W-2 Employment" },
  { value: "1099", label: "1099 Contract" },
  { value: "equity", label: "Equity / Startup" },
  { value: "other", label: "Other" },
]

const locationTypes = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
]

export default function PostJobPage() {
  const router = useRouter()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [type, setType] = useState("w2")
  const [locationType, setLocationType] = useState("remote")
  const [location, setLocation] = useState("")
  const [salaryRange, setSalaryRange] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

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
          tags,
          status,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push("/jobs/dashboard")
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

  return (
    <div className="min-h-dvh bg-white">

      <main className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-12">
        <Link
          href="/jobs/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-6 sm:mb-8">Post a Job</h1>

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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Type</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location Type</label>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Antonio, TX"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Range</label>
                  <input
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. $80k - $120k"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 leading-tight">Job Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">HTML formatting supported.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="List skills, qualifications, and experience required..."
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                />
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 leading-tight">Tags</h2>
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
