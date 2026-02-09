import Link from "next/link"
import { MapPin, Clock, DollarSign, Building2, Tag } from "lucide-react"

interface JobCardProps {
  id: string
  title: string
  slug: string
  companyName: string
  companyLogo?: string
  type: "w2" | "1099" | "equity" | "other"
  locationType: "remote" | "onsite" | "hybrid"
  location?: string
  salaryRange?: string
  tags: string[]
  applicantCount: number
  createdAt: string
}

const typeLabels: Record<string, { label: string; className: string }> = {
  w2: { label: "W-2", className: "bg-blue-100 text-blue-700" },
  "1099": { label: "1099", className: "bg-orange-100 text-orange-700" },
  equity: { label: "Equity", className: "bg-purple-100 text-purple-700" },
  other: { label: "Other", className: "bg-slate-100 text-slate-600" },
}

const locationLabels: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
}

export function JobCard({
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
      className="block rounded-xl border border-slate-200 bg-white p-5 sm:p-6 hover:border-slate-300 hover:shadow-md transition-all group shadow-sm"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
          {companyLogo ? (
            <img src={companyLogo} alt={companyName} className="h-full w-full object-contain p-1" />
          ) : (
            <Building2 className="h-6 w-6 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title & Company */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#ef426f] transition-colors leading-snug truncate">
            {title}
          </h3>
          <p className="text-sm text-slate-500 mt-1 leading-normal">{companyName}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeInfo.className}`}>
              {typeInfo.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {locationLabels[locationType]}{location ? ` · ${location}` : ""}
            </span>
            {salaryRange && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <DollarSign className="h-3 w-3" />
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
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
              {tags.length > 4 && (
                <span className="text-xs text-slate-400">+{tags.length - 4}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(createdAt)}
            </span>
            <span className="font-medium">{applicantCount} applicant{applicantCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
