import Link from "next/link"
import { MapPin, Clock, DollarSign, Building2, Tag, Bookmark, BookmarkCheck } from "lucide-react"

interface JobCardProps {
  id: string
  title: string
  slug: string
  companyName: string
  companyLogo?: string
  type: "w2" | "1099" | "equity" | "internship" | "other"
  locationType: "remote" | "onsite" | "hybrid"
  location?: string
  salaryRange?: string
  tags: string[]
  applicantCount: number
  createdAt: string
  isSaved?: boolean
  hasApplied?: boolean
  onToggleSave?: (jobId: string) => void
}

const typeLabels: Record<string, { label: string; className: string }> = {
  w2: { label: "W-2", className: "bg-blue-100 text-blue-700" },
  "1099": { label: "1099", className: "bg-orange-100 text-orange-700" },
  equity: { label: "Equity", className: "bg-purple-100 text-purple-700" },
  internship: { label: "Internship", className: "bg-emerald-100 text-emerald-700" },
  other: { label: "Other", className: "bg-slate-100 text-slate-600" },
}

const locationLabels: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
}

export function JobCard({
  id,
  title,
  slug,
  companyName,
  companyLogo,
  type,
  locationType,
  location,
  salaryRange,
  tags,
  applicantCount,
  createdAt,
  isSaved,
  hasApplied,
  onToggleSave,
}: JobCardProps) {
  const typeInfo = typeLabels[type] || typeLabels.other

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffMs = now.getTime() - posted.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <Link
      href={`/jobs/${slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 sm:p-6 hover:border-gray-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
          {companyLogo ? (
            <img src={companyLogo} alt={companyName} className="h-full w-full object-contain p-1" />
          ) : (
            <Building2 className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title & Company */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-[#ef426f] transition-colors leading-[1.3] truncate">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 leading-normal font-normal">{companyName}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeInfo.className}`}>
              {typeInfo.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 leading-[1.4] font-normal">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              {locationLabels[locationType]}{location ? ` · ${location}` : ""}
            </span>
            {salaryRange && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 leading-[1.4] font-normal">
                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                {salaryRange}
              </span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-normal leading-normal"
                >
                  <Tag className="h-2.5 w-2.5 text-gray-400" />
                  {tag}
                </span>
              ))}
              {tags.length > 4 && (
                <span className="text-xs text-gray-400 font-normal">+{tags.length - 4}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100 text-[13px] text-gray-400 leading-[1.4]">
            <span className="flex items-center gap-1.5 font-normal">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(createdAt)}
            </span>
            <span className="font-medium text-gray-500">{applicantCount} applicant{applicantCount !== 1 ? "s" : ""}</span>
            {hasApplied && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-semibold text-green-700">
                Applied
              </span>
            )}
            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleSave(id)
                }}
                className="ml-auto p-1 rounded-md hover:bg-slate-100 transition-colors"
                title={isSaved ? "Unsave job" : "Save job"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-[#ef426f]" />
                ) : (
                  <Bookmark className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
