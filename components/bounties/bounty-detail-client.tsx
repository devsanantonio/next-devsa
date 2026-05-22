"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  ArrowLeft,
  Building2,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  Loader2,
  HandCoins,
  Users,
  AlertTriangle,
  Send,
  ExternalLink,
  XCircle,
  User as UserIcon,
} from "lucide-react"
import type { BountyCategory, BountyStatus } from "@/lib/firebase-admin"

// Mirrors BountyClaim but with dates serialized as ISO strings (we transit
// them as JSON from the API).
interface ClaimItem {
  id: string
  bountyId: string
  bountyTitle: string
  claimantUid: string
  claimantName: string
  claimantEmail?: string
  claimantImage?: string
  pitchNote: string
  proposedTimelineDays?: number
  portfolioLinks?: string[]
  status: "pending" | "accepted" | "declined" | "withdrawn"
  createdAt?: string
  decidedAt?: string
}

interface ClaimsResponse {
  claims: ClaimItem[]
  myClaim: ClaimItem | null
  totalCount: number
  viewer: "poster" | "claimant"
}

export interface BountyDetail {
  id: string
  title: string
  slug: string
  summary: string
  description: string // sanitized HTML or markdown-as-HTML
  deliverables: string[]
  category: BountyCategory
  tags: string[]
  orgName: string
  orgLogo?: string
  orgVerifiedNonprofit?: boolean
  posterUid: string
  posterName: string
  amountCents: number
  payoutCents: number
  platformFeeCents: number
  status: BountyStatus
  applicantCount: number
  estimatedHours?: number
  deadlineAt?: string
  createdAt: string
  escrowStatus: "unfunded" | "funded" | "released" | "refunded"
  claimantUid?: string
  claimantName?: string
}

const categoryLabels: Record<BountyCategory, string> = {
  website: "Website",
  integration: "Integration",
  automation: "Automation",
  data: "Data",
  design: "Design",
  ai: "AI",
  accessibility: "Accessibility",
  devops: "DevOps",
  mobile: "Mobile",
  other: "Other",
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

function timeAgo(date: string) {
  const posted = new Date(date)
  const diffMs = Date.now() - posted.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 30) return `${diffDays}d ago`
  return posted.toLocaleDateString()
}

function deadlineLabel(deadlineAt?: string) {
  if (!deadlineAt) return null
  const target = new Date(deadlineAt)
  const days = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { text: "Deadline passed", tone: "danger" as const }
  if (days === 0) return { text: "Due today", tone: "urgent" as const }
  if (days <= 3) return { text: `${days} day${days === 1 ? "" : "s"} left`, tone: "urgent" as const }
  return { text: `${days} days left`, tone: "normal" as const }
}

export function BountyDetailClient({ bounty }: { bounty: BountyDetail }) {
  const { user, getIdToken } = useAuth()
  const router = useRouter()

  const isPoster = user?.uid === bounty.posterUid
  const isClaimant = user?.uid === bounty.claimantUid
  const isOpen = bounty.status === "open"
  const deadline = deadlineLabel(bounty.deadlineAt)

  // Claims state — fetched on mount when signed in. Visibility is decided
  // server-side: posters get the full list, claimants get only their own.
  const [claims, setClaims] = useState<ClaimItem[]>([])
  const [myClaim, setMyClaim] = useState<ClaimItem | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [claimsLoading, setClaimsLoading] = useState(false)

  // Pitch form state
  const [showPitchForm, setShowPitchForm] = useState(false)
  const [pitchNote, setPitchNote] = useState("")
  const [proposedDays, setProposedDays] = useState<string>("")
  const [portfolioInput, setPortfolioInput] = useState("")
  const [pitchSubmitting, setPitchSubmitting] = useState(false)
  const [pitchError, setPitchError] = useState<string | null>(null)

  // Accept-pitch state — keyed by claimId so multiple loaders don't collide.
  const [acceptingClaimId, setAcceptingClaimId] = useState<string | null>(null)
  const [acceptError, setAcceptError] = useState<string | null>(null)

  const loadClaims = useCallback(async () => {
    if (!user) return
    setClaimsLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch(`/api/bounties/${bounty.slug}/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = (await res.json()) as ClaimsResponse
      setClaims(data.claims || [])
      setMyClaim(data.myClaim || null)
      setTotalCount(data.totalCount || 0)
    } catch {
      // silent — claims UI just stays empty
    } finally {
      setClaimsLoading(false)
    }
  }, [bounty.slug, user, getIdToken])

  useEffect(() => {
    loadClaims()
  }, [loadClaims])

  const handleSubmitPitch = async () => {
    setPitchError(null)
    if (pitchNote.trim().length < 10) {
      setPitchError("Pitch note must be at least 10 characters")
      return
    }
    setPitchSubmitting(true)
    try {
      const token = await getIdToken()
      if (!token) {
        setPitchError("Sign-in expired. Please refresh.")
        return
      }
      const portfolioLinks = portfolioInput
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
      const proposedTimelineDays = proposedDays ? Number(proposedDays) : undefined
      const res = await fetch(`/api/bounties/${bounty.slug}/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pitchNote: pitchNote.trim(),
          proposedTimelineDays,
          portfolioLinks,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPitchError(data?.error || "Failed to submit pitch")
        return
      }
      // Optimistically slot the new claim into state so the UI updates without
      // a second fetch round-trip. Then re-fetch for canonical data.
      if (data.claim) {
        setMyClaim(data.claim)
        setClaims((prev) => [data.claim, ...prev])
        setTotalCount((prev) => prev + 1)
      }
      setShowPitchForm(false)
      setPitchNote("")
      setProposedDays("")
      setPortfolioInput("")
      loadClaims()
    } catch {
      setPitchError("Network error. Try again.")
    } finally {
      setPitchSubmitting(false)
    }
  }

  const handleAcceptPitch = async (claimId: string) => {
    setAcceptError(null)
    setAcceptingClaimId(claimId)
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch(
        `/api/bounties/${bounty.slug}/claims/${claimId}/accept`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setAcceptError(data?.error || "Failed to accept pitch")
        return
      }
      // The bounty itself just transitioned to 'claimed'. Server revalidates
      // /bounties/[slug], so a hard refresh gets us the new bounty state.
      router.refresh()
      loadClaims()
    } catch {
      setAcceptError("Network error. Try again.")
    } finally {
      setAcceptingClaimId(null)
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      <main className="mx-auto max-w-4xl px-5 sm:px-6 py-8 sm:py-12 pt-20 lg:pt-8">
        <Link
          href="/bounties"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bounties
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 overflow-hidden">
              {bounty.orgLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bounty.orgLogo} alt={bounty.orgName} className="h-full w-full object-contain p-1.5" />
              ) : (
                <Building2 className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                  {bounty.title}
                </h1>
                {bounty.status === "claimed" && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                    Claimed
                  </span>
                )}
                {bounty.status === "completed" && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Completed
                  </span>
                )}
                {bounty.status === "pending_review" && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700 uppercase tracking-wide">
                    Pending review
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-base text-slate-500">{bounty.orgName}</p>
                {bounty.orgVerifiedNonprofit && (
                  <span title="Verified 501(c)(3) nonprofit" className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="h-4 w-4" />
                    <span>Nonprofit</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-3xl">
            {bounty.summary}
          </p>

          {/* Meta strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              Posted {timeAgo(bounty.createdAt)}
            </span>
            {bounty.estimatedHours && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                ~{bounty.estimatedHours}h estimated
              </span>
            )}
            {deadline && (
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  deadline.tone === "danger"
                    ? "text-red-600"
                    : deadline.tone === "urgent"
                    ? "text-amber-700"
                    : "text-slate-500"
                }`}
              >
                <Calendar className="h-4 w-4" />
                {deadline.text}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              {bounty.applicantCount} interested
            </span>
          </div>
        </div>

        {/* Two-column layout: scope on left, pay panel on right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Scope */}
          <div className="space-y-8">
            {/* Pitches received — poster-only. Surfaces the actionable
                "accept one" decision right above the description. */}
            {isPoster && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    Pitches received
                    {totalCount > 0 && (
                      <span className="ml-2 text-sm font-semibold text-slate-400 tabular-nums">
                        {totalCount}
                      </span>
                    )}
                  </h2>
                  {claimsLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                </div>
                {acceptError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                    {acceptError}
                  </p>
                )}
                {claims.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                    No pitches yet. Builders who pitch will show up here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {claims.map((claim) => (
                      <PitchCard
                        key={claim.id}
                        claim={claim}
                        canAccept={isOpen && claim.status === "pending"}
                        accepting={acceptingClaimId === claim.id}
                        onAccept={() => handleAcceptPitch(claim.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Description */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3 leading-tight">Description</h2>
              <div
                className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&_p]:my-3 [&_ul]:my-3 [&_li]:my-1"
                dangerouslySetInnerHTML={{ __html: bounty.description }}
              />
            </section>

            {/* Deliverables */}
            {bounty.deliverables.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-3 leading-tight">
                  Deliverables ({bounty.deliverables.length})
                </h2>
                <ul className="space-y-2">
                  {bounty.deliverables.map((d, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 mt-3">
                  Approval of the bounty requires all deliverables to be met.
                </p>
              </section>
            )}

            {/* Tags */}
            {bounty.tags.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {bounty.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-sm text-slate-600"
                    >
                      <Tag className="h-3 w-3 text-slate-400" />
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right rail — payment + claim */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Amount card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bounty</p>
              <p className="text-4xl font-extrabold text-slate-900 tabular-nums leading-none">
                {formatMoney(bounty.amountCents)}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Builder gets</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">{formatMoney(bounty.payoutCents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">DEVSA (8%)</span>
                  <span className="font-semibold text-[#ef426f] tabular-nums">{formatMoney(bounty.platformFeeCents)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500 leading-relaxed">
                  <HandCoins className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    Category: <span className="font-medium text-slate-700">{categoryLabels[bounty.category]}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Funding state pill */}
            <div
              className={`rounded-xl border px-4 py-3 text-xs ${
                bounty.escrowStatus === "funded"
                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                  : bounty.escrowStatus === "released"
                  ? "border-slate-200 bg-slate-50 text-slate-600"
                  : "border-amber-200 bg-amber-50/50 text-amber-800"
              }`}
            >
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                {bounty.escrowStatus === "funded" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                {bounty.escrowStatus === "funded"
                  ? "Funded in escrow"
                  : bounty.escrowStatus === "released"
                  ? "Paid out"
                  : "Not yet funded"}
              </p>
              <p className="leading-relaxed">
                {bounty.escrowStatus === "funded"
                  ? "Payment is held by DEVSA until the bounty is approved as complete."
                  : bounty.escrowStatus === "released"
                  ? "This bounty has been completed and paid."
                  : "Once the poster funds the bounty, claims open up."}
              </p>
            </div>

            {/* Primary action — varies by viewer + bounty state */}
            {isPoster ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                You posted this bounty.{" "}
                {totalCount > 0 ? (
                  <span>
                    <span className="font-semibold text-slate-900">{totalCount}</span>{" "}
                    {totalCount === 1 ? "pitch" : "pitches"} received — review below.
                  </span>
                ) : (
                  <span>No pitches yet. Share the link or wait for builders to find you.</span>
                )}
              </div>
            ) : isClaimant ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 py-3 text-sm text-indigo-700">
                You&apos;re working on this bounty. Submit your deliverable from your dashboard when ready.
              </div>
            ) : !user ? (
              <Link
                href={`/bounties/signin?next=/bounties/${bounty.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                Sign in to claim
              </Link>
            ) : myClaim ? (
              <ClaimStatusCard claim={myClaim} />
            ) : isOpen ? (
              <>
                {!showPitchForm ? (
                  <button
                    onClick={() => setShowPitchForm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
                  >
                    <HandCoins className="h-4 w-4" />
                    Claim this bounty
                  </button>
                ) : (
                  <PitchForm
                    pitchNote={pitchNote}
                    setPitchNote={setPitchNote}
                    proposedDays={proposedDays}
                    setProposedDays={setProposedDays}
                    portfolioInput={portfolioInput}
                    setPortfolioInput={setPortfolioInput}
                    submitting={pitchSubmitting}
                    error={pitchError}
                    onCancel={() => {
                      setShowPitchForm(false)
                      setPitchError(null)
                    }}
                    onSubmit={handleSubmitPitch}
                  />
                )}
              </>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                This bounty isn&apos;t accepting claims right now.
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}

// =============================================================================
// Pitch form — inline, replaces the "Claim this bounty" CTA when expanded.
// =============================================================================

function PitchForm({
  pitchNote,
  setPitchNote,
  proposedDays,
  setProposedDays,
  portfolioInput,
  setPortfolioInput,
  submitting,
  error,
  onCancel,
  onSubmit,
}: {
  pitchNote: string
  setPitchNote: (v: string) => void
  proposedDays: string
  setProposedDays: (v: string) => void
  portfolioInput: string
  setPortfolioInput: (v: string) => void
  submitting: boolean
  error: string | null
  onCancel: () => void
  onSubmit: () => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Your pitch
          <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">(visible to the poster)</span>
        </label>
        <textarea
          value={pitchNote}
          onChange={(e) => setPitchNote(e.target.value)}
          placeholder="Why you're a good fit. Relevant work, approach, anything that helps the poster pick you."
          rows={5}
          maxLength={2000}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 resize-none"
        />
        <p className="text-[11px] text-slate-400 mt-1 tabular-nums">{pitchNote.length}/2000</p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Estimated timeline
          <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">(optional)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={365}
            value={proposedDays}
            onChange={(e) => setProposedDays(e.target.value)}
            placeholder="7"
            className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 tabular-nums"
          />
          <span className="text-sm text-slate-500">days</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Portfolio links
          <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">(optional, up to 5)</span>
        </label>
        <textarea
          value={portfolioInput}
          onChange={(e) => setPortfolioInput(e.target.value)}
          placeholder="https://github.com/you/project&#10;https://your-site.com&#10;..."
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 resize-none font-mono"
        />
        <p className="text-[11px] text-slate-400 mt-1">One per line, or comma-separated.</p>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || pitchNote.trim().length < 10}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#ef426f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit pitch
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// Claim status card — what a claimant sees once they've pitched.
// =============================================================================

function ClaimStatusCard({ claim }: { claim: ClaimItem }) {
  const isPending = claim.status === "pending"
  const isAccepted = claim.status === "accepted"
  const isDeclined = claim.status === "declined"

  const tone = isAccepted
    ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
    : isDeclined
    ? "border-slate-200 bg-slate-50 text-slate-600"
    : "border-amber-200 bg-amber-50/40 text-amber-900"

  const label = isAccepted
    ? "Your pitch was accepted"
    : isDeclined
    ? "Your pitch wasn't picked this time"
    : "Your pitch is in"

  const sub = isAccepted
    ? "Coordinate with the poster and submit your deliverable when ready."
    : isDeclined
    ? "Another builder was picked. Browse open bounties to find your next match."
    : "The poster has been notified. You'll get an update when they decide."

  return (
    <div className={`rounded-xl border px-4 py-3 ${tone}`}>
      <p className="font-semibold mb-1 flex items-center gap-1.5 text-sm">
        {isAccepted ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : isDeclined ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        {label}
      </p>
      <p className="text-xs leading-relaxed">{sub}</p>
      {isPending && (
        <p className="mt-2 text-[11px] text-amber-700/70 italic line-clamp-2">
          &ldquo;{claim.pitchNote}&rdquo;
        </p>
      )}
    </div>
  )
}

// =============================================================================
// Pitch card — what a poster sees for each pitch.
// =============================================================================

function PitchCard({
  claim,
  canAccept,
  accepting,
  onAccept,
}: {
  claim: ClaimItem
  canAccept: boolean
  accepting: boolean
  onAccept: () => void
}) {
  const statusToneClass: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    declined: "bg-slate-100 text-slate-600 border-slate-200",
    withdrawn: "bg-slate-100 text-slate-600 border-slate-200",
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
          {claim.claimantImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={claim.claimantImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{claim.claimantName}</p>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                statusToneClass[claim.status] || statusToneClass.pending
              }`}
            >
              {claim.status}
            </span>
          </div>
          {claim.claimantEmail && (
            <p className="text-xs text-slate-400 leading-normal mt-0.5">{claim.claimantEmail}</p>
          )}
          {claim.proposedTimelineDays && (
            <p className="text-xs text-slate-500 mt-1">
              Estimated timeline:{" "}
              <span className="font-semibold text-slate-700">
                {claim.proposedTimelineDays} day{claim.proposedTimelineDays === 1 ? "" : "s"}
              </span>
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {claim.pitchNote}
      </p>

      {claim.portfolioLinks && claim.portfolioLinks.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Portfolio</p>
          {claim.portfolioLinks.map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ef426f] hover:underline truncate max-w-full"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{link}</span>
            </a>
          ))}
        </div>
      )}

      {canAccept && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onAccept}
            disabled={accepting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {accepting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Accept this pitch
          </button>
        </div>
      )}
    </div>
  )
}
