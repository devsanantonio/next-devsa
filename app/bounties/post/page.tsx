"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Save,
  Send,
  Clock,
  ExternalLink,
  HandCoins,
  CheckCircle2,
  Info,
} from "lucide-react"
import Link from "next/link"

const categories = [
  { value: "website", label: "Website" },
  { value: "integration", label: "Integration" },
  { value: "automation", label: "Automation" },
  { value: "data", label: "Data" },
  { value: "design", label: "Design" },
  { value: "ai", label: "AI" },
  { value: "accessibility", label: "Accessibility" },
  { value: "devops", label: "DevOps" },
  { value: "mobile", label: "Mobile" },
  { value: "other", label: "Other" },
] as const

const PLATFORM_FEE_RATE = 0.08

export default function PostBountyPage() {
  const router = useRouter()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState("")
  const [orgName, setOrgName] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<typeof categories[number]["value"]>("website")
  const [amountDollars, setAmountDollars] = useState<string>("")
  const [estimatedHours, setEstimatedHours] = useState<string>("")
  const [deadlineAt, setDeadlineAt] = useState<string>("")
  const [deliverables, setDeliverables] = useState<string[]>([])
  const [deliverableInput, setDeliverableInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (!authLoading && !user) router.push("/bounties/signin")
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
        if (data.profile.companyName) setOrgName(data.profile.companyName)
      }
    } catch {
      // ignored
    } finally {
      setIsLoading(false)
    }
  }

  const addDeliverable = () => {
    const trimmed = deliverableInput.trim()
    if (trimmed && deliverables.length < 12) {
      setDeliverables([...deliverables, trimmed])
      setDeliverableInput("")
    }
  }
  const removeDeliverable = (idx: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx))
  }

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  // Fee preview — recomputes as the amount changes
  const feePreview = useMemo(() => {
    const dollars = parseFloat(amountDollars)
    if (!Number.isFinite(dollars) || dollars <= 0) return null
    const cents = Math.round(dollars * 100)
    const fee = Math.floor(cents * PLATFORM_FEE_RATE)
    const payout = cents - fee
    return {
      amount: cents,
      fee,
      payout,
    }
  }, [amountDollars])

  const isValid =
    title.trim().length >= 5 &&
    orgName.trim().length >= 2 &&
    summary.trim().length >= 10 &&
    description.trim().length >= 30 &&
    !!feePreview &&
    feePreview.amount >= 5000 &&
    feePreview.amount <= 1_000_000

  const handleSubmit = async (status: "published" | "draft") => {
    if (!isValid && status === "published") return
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const token = await getIdToken()
      const res = await fetch("/api/bounties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          description,
          deliverables,
          category,
          tags,
          orgName: orgName.trim(),
          amountCents: feePreview?.amount,
          estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
          deadlineAt: deadlineAt || undefined,
          status,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to submit bounty")
        return
      }
      if (status === "published") {
        setPublishedSlug(data.slug)
      } else {
        router.push("/bounties/dashboard")
      }
    } catch {
      setErrorMsg("Network error — please retry.")
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
          <p className="text-slate-500 mb-6 leading-relaxed">
            Only accounts with the &quot;Hiring&quot; role can post bounties. Switch to the hiring role in your profile to continue.
          </p>
          <Link href="/bounties" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Bounties
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (publishedSlug) {
    const bountyUrl = `/bounties/${publishedSlug}`
    return (
      <div className="min-h-dvh bg-white">
        <main className="mx-auto max-w-2xl px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug mb-3">
            Bounty submitted!
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 max-w-md mx-auto">
            It&apos;s pending DEVSA review. Funding (escrow) is handled in the next step before it goes live.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 mb-8 text-left max-w-md mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">What happens next</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-200">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Pending DEVSA review</p>
                  <p className="text-xs text-slate-400">Admin reviews scope and posting fit</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200">
                  <HandCoins className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Fund escrow (coming soon)</p>
                  <p className="text-xs text-slate-400">Once approved, you&apos;ll fund the bounty via Stripe</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Goes live</p>
                  <p className="text-xs text-slate-400">Builders can express interest and pitch</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={bountyUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Your Bounty
            </Link>
            <Link
              href="/bounties/dashboard"
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-2">Post a Bounty</h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Scope a bite-sized project for builders across San Antonio, the I-35 corridor, and the Rio Grande Valley. DEVSA takes 8% on completion to fund workshops, conferences, and the coworking space.
          </p>
        </div>

        <div className="space-y-6">
          {/* Basics */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 leading-tight">Basics</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fix our broken Stripe donate button"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization name *</label>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Your nonprofit or company name"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
                <p className="text-xs text-slate-400 mt-1.5">501(c)(3) status is verified by a DEVSA admin separately.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Summary *</label>
                <input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="One-line pitch (shown on bounty cards)"
                  maxLength={140}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
                <p className="text-xs text-slate-400 mt-1.5">{summary.length}/140 — keep it skimmable.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as typeof category)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm appearance-none"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimated hours (optional)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Scope */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 leading-tight">Scope</h2>
            <p className="text-sm text-slate-400 mb-4">Be specific. Bounty amount is fixed — additional work requires a new bounty.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What needs to be built? Current state, desired outcome, any constraints or stack preferences..."
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">Markdown supported.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Deliverables (what &quot;done&quot; looks like)</label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addDeliverable()
                      }
                    }}
                    placeholder="e.g. Donation button on /donate flows to Stripe"
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                  <button
                    onClick={addDeliverable}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-200 transition-colors"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                {deliverables.length > 0 && (
                  <ul className="space-y-2">
                    {deliverables.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="flex-1 text-sm text-slate-700 leading-relaxed">{d}</span>
                        <button onClick={() => removeDeliverable(idx)} className="text-slate-400 hover:text-red-500 shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-slate-400 mt-2">Up to 12 deliverables. These become the acceptance criteria.</p>
              </div>
            </div>
          </section>

          {/* Money */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 leading-tight">Bounty amount</h2>
            <p className="text-sm text-slate-400 mb-4">$50 minimum, $10,000 maximum. Builder is paid on your approval; DEVSA takes 8%.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bounty amount (USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base font-medium">$</span>
                  <input
                    type="number"
                    min={50}
                    max={10000}
                    step={1}
                    value={amountDollars}
                    onChange={(e) => setAmountDollars(e.target.value)}
                    placeholder="500"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 pl-8 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm tabular-nums"
                  />
                </div>
              </div>

              {/* Fee split preview */}
              {feePreview && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 mb-3">Payment breakdown</p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">You fund</p>
                          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
                            ${(feePreview.amount / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Builder gets</p>
                          <p className="text-lg font-extrabold text-emerald-700 tabular-nums">
                            ${(feePreview.payout / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">DEVSA (8%)</p>
                          <p className="text-lg font-extrabold text-[#ef426f] tabular-nums">
                            ${(feePreview.fee / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                        Funds workshops, conferences, and the downtown coworking space. DEVSA is a 501(c)(3) education nonprofit.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline (optional)</label>
                <input
                  type="date"
                  value={deadlineAt}
                  onChange={(e) => setDeadlineAt(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
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
                placeholder="Add a tag (e.g. react, stripe, supabase)"
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
              />
              <button
                onClick={addTag}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-200 transition-colors"
                type="button"
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
            {tags.length >= 10 && <p className="text-xs text-slate-400 mt-2">Maximum 10 tags.</p>}
          </section>

          {/* Errors */}
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

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
              disabled={isSubmitting || !isValid}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors disabled:opacity-50 flex-1"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit for Review
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
