"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "lucide-react"
import type { BountyCategory, BountyStatus } from "@/lib/firebase-admin"

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
  const { user } = useAuth()
  const [showInterestNote, setShowInterestNote] = useState(false)

  const isPoster = user?.uid === bounty.posterUid
  const isClaimant = user?.uid === bounty.claimantUid
  const isOpen = bounty.status === "open"
  const deadline = deadlineLabel(bounty.deadlineAt)

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

            {/* Primary action */}
            {isPoster ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                You posted this bounty. Manage it from your{" "}
                <Link href="/bounties/dashboard" className="font-semibold text-[#ef426f] hover:underline">
                  dashboard
                </Link>
                .
              </div>
            ) : isClaimant ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 py-3 text-sm text-indigo-700">
                You&apos;re working on this bounty. Submit your deliverable from your dashboard when ready.
              </div>
            ) : isOpen ? (
              <button
                disabled
                onClick={() => setShowInterestNote(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                title="Coming in Slice 3"
              >
                {showInterestNote ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Express Interest (coming soon)
              </button>
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
