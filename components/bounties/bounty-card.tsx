import Link from "next/link"
import {
  Clock,
  Building2,
  Tag,
  BadgeCheck,
  Sparkles,
  Calendar,
  Users,
} from "lucide-react"
import type { BountyCategory, BountyStatus } from "@/lib/firebase-admin"

interface BountyCardProps {
  id: string
  title: string
  slug: string
  summary: string
  orgName: string
  orgLogo?: string
  orgVerifiedNonprofit?: boolean
  category: BountyCategory
  tags: string[]
  amountCents: number
  payoutCents: number
  status: BountyStatus
  applicantCount: number
  estimatedHours?: number
  deadlineAt?: string
  createdAt: string
  onTagClick?: (tag: string) => void
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

const categoryClasses: Record<BountyCategory, string> = {
  website: "bg-blue-50 text-blue-700 border-blue-200",
  integration: "bg-purple-50 text-purple-700 border-purple-200",
  automation: "bg-amber-50 text-amber-700 border-amber-200",
  data: "bg-teal-50 text-teal-700 border-teal-200",
  design: "bg-pink-50 text-pink-700 border-pink-200",
  ai: "bg-indigo-50 text-indigo-700 border-indigo-200",
  accessibility: "bg-emerald-50 text-emerald-700 border-emerald-200",
  devops: "bg-slate-100 text-slate-700 border-slate-200",
  mobile: "bg-cyan-50 text-cyan-700 border-cyan-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
}

function formatMoney(cents: number) {
  const dollars = cents / 100
  // Whole dollars when round; one decimal otherwise
  return dollars % 1 === 0
    ? `$${dollars.toLocaleString()}`
    : `$${dollars.toFixed(2)}`
}

function timeAgo(date: string) {
  const posted = new Date(date)
  const diffMs = Date.now() - posted.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

function daysUntil(date?: string) {
  if (!date) return null
  const target = new Date(date)
  const diffDays = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diffDays
}

function isNew(createdAt: string) {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60) < 48
}

export function BountyCard(props: BountyCardProps) {
  const {
    title,
    slug,
    summary,
    orgName,
    orgLogo,
    orgVerifiedNonprofit,
    category,
    tags,
    amountCents,
    payoutCents,
    status,
    applicantCount,
    estimatedHours,
    deadlineAt,
    createdAt,
    onTagClick,
  } = props

  const daysLeft = daysUntil(deadlineAt)
  const deadlineLabel =
    daysLeft === null
      ? null
      : daysLeft < 0
      ? "Deadline passed"
      : daysLeft === 0
      ? "Due today"
      : daysLeft === 1
      ? "Due tomorrow"
      : `${daysLeft} days left`

  return (
    <Link
      href={`/bounties/${slug}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 sm:p-6 hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Org logo */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
          {orgLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={orgLogo} alt={orgName} className="h-full w-full object-contain p-1" />
          ) : (
            <Building2 className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-[#ef426f] transition-colors leading-[1.3] truncate">
              {title}
            </h3>
            {isNew(createdAt) && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                <Sparkles className="h-2.5 w-2.5" />
                New
              </span>
            )}
            {status === "claimed" && (
              <span className="shrink-0 inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                Claimed
              </span>
            )}
            {status === "completed" && (
              <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                Completed
              </span>
            )}
          </div>

          {/* Org line */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm text-gray-500 leading-normal font-normal truncate">{orgName}</p>
            {orgVerifiedNonprofit && (
              <span title="Verified 501(c)(3) nonprofit" className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                <span>Nonprofit</span>
              </span>
            )}
          </div>

          {/* Summary */}
          <p className="mt-3 text-sm text-gray-600 leading-[1.5] line-clamp-2">
            {summary}
          </p>

          {/* Meta row: category + hours + deadline */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryClasses[category]}`}>
              {categoryLabels[category]}
            </span>
            {estimatedHours && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 leading-[1.4] font-normal">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                ~{estimatedHours}h
              </span>
            )}
            {deadlineLabel && (
              <span className={`inline-flex items-center gap-1.5 text-[13px] leading-[1.4] font-medium ${daysLeft !== null && daysLeft <= 3 ? "text-amber-700" : "text-gray-500"}`}>
                <Calendar className="h-3.5 w-3.5" />
                {deadlineLabel}
              </span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    if (onTagClick) {
                      e.preventDefault()
                      e.stopPropagation()
                      onTagClick(tag)
                    }
                  }}
                  className={`inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-normal ${
                    onTagClick ? "hover:bg-[#ef426f]/10 hover:text-[#ef426f] cursor-pointer transition-colors" : ""
                  }`}
                >
                  <Tag className="h-2.5 w-2.5 text-gray-400" />
                  {tag}
                </button>
              ))}
              {tags.length > 5 && <span className="text-xs text-gray-400">+{tags.length - 5}</span>}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100 text-[13px] text-gray-500 leading-[1.4]">
            <span className="flex items-center gap-1.5 font-normal">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              {timeAgo(createdAt)}
            </span>
            <span className="flex items-center gap-1.5 font-normal">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              {applicantCount} interested
            </span>
          </div>
        </div>

        {/* Amount badge — large, anchored right */}
        <div className="flex flex-col items-end text-right shrink-0">
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums leading-none">
            {formatMoney(amountCents)}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 leading-tight">
            Builder gets {formatMoney(payoutCents)}
          </span>
        </div>
      </div>
    </Link>
  )
}
