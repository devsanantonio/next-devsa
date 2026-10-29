"use client"

import { ChevronRight, ExternalLink, Mail } from "lucide-react"
import type React from "react"
import { Pill } from "@/components/admin/data-table"

/**
 * The organizer directory, on the Communities tab: every group as a row that
 * opens to show who runs it, where it talks, and when it's next on the
 * calendar. Read-only for every signed-in admin; editing stays in the drawers.
 *
 * Organizers come from /api/admin/data's `directory`, which only carries people
 * who opted in on their own profile. Channels are the group's own link fields.
 */

export interface DirectoryEntry {
  communityId: string | null
  /** Every group they run, including an admin's own groups. */
  groups: string[]
  role: "superadmin" | "admin" | "organizer"
  name: string
  /** Their uploaded profile photo, or null. Only ever a profiles/ blob (lib/profile-photo.ts). */
  photo: string | null
  title: string | null
  email: string
  linkedin: string | null
  gradTerm: string | null
  confirmedAt: string | null
}

export interface DirectoryCommunity {
  id: string
  name: string
  logo: string
  description: string
  website?: string | null
  discord?: string | null
  meetup?: string | null
  luma?: string | null
  instagram?: string | null
  twitter?: string | null
  linkedin?: string | null
  youtube?: string | null
  twitch?: string | null
  facebook?: string | null
  github?: string | null
  kind?: "tech" | "student"
  school?: string | null
  pastLeads?: { name: string; title?: string | null; until: string }[]
}

export interface DirectoryEvent {
  id: string
  title: string
  slug: string
  date: string
  communityId?: string | null
  partnerId?: string | null
  status?: string
  unlisted?: boolean
}

export type KindFilter = "all" | "tech" | "student"

const CHANNELS: [keyof DirectoryCommunity, string][] = [
  ["website", "Website"],
  ["meetup", "Meetup"],
  ["luma", "Luma"],
  ["discord", "Discord"],
  ["linkedin", "LinkedIn"],
  ["instagram", "Instagram"],
  ["twitter", "X"],
  ["youtube", "YouTube"],
  ["twitch", "Twitch"],
  ["facebook", "Facebook"],
  ["github", "GitHub"],
]

const ids = (stored?: string | null) => (stored || "").split(",").map((s) => s.trim()).filter(Boolean)

export const kindLabel = (c: DirectoryCommunity) =>
  c.kind === "student" ? ["Student org", c.school].filter(Boolean).join(" · ") : "Tech group"

/** The opted-in organizers of one group. */
export function organizersOf(communityId: string, directory: DirectoryEntry[]) {
  return directory.filter((e) => e.groups.includes(communityId))
}

/** Search matches the group, its school, and the people who run it. */
export function matchesDirectory(c: DirectoryCommunity, organizers: DirectoryEntry[], query: string, kind: KindFilter) {
  if (kind !== "all" && (c.kind === "student" ? "student" : "tech") !== kind) return false
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hay = [c.name, c.id, c.school, ...organizers.flatMap((o) => [o.name, o.title, o.email])]
  return hay.some((s) => s?.toLowerCase().includes(q))
}

/** The group's next and last listed events: what a co-hosting conversation starts from. */
function calendarFor(communityId: string, events: DirectoryEvent[]) {
  const now = Date.now()
  const mine = events
    .filter((e) => e.status !== "draft" && !e.unlisted && (ids(e.communityId).includes(communityId) || ids(e.partnerId).includes(communityId)))
    .map((e) => ({ ...e, t: new Date(e.date).getTime() }))
    .filter((e) => !Number.isNaN(e.t))
  const next = mine.filter((e) => e.t >= now).sort((a, b) => a.t - b.t)[0]
  const last = mine.filter((e) => e.t < now).sort((a, b) => b.t - a.t)[0]
  return { next, last }
}

/** Over six months since someone confirmed their profile. */
export const isStale = (at: string | null) => !!at && Date.now() - new Date(at).getTime() > 1000 * 60 * 60 * 24 * 183

/** "confirmed Oct 2026"; amber once it's over six months old, because a stale contact is worse than none. */
function Confirmed({ at }: { at: string | null }) {
  if (!at) return null
  const d = new Date(at)
  const stale = isStale(at)
  const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  return (
    <span className={`whitespace-nowrap text-xs ${stale ? "text-amber-300" : "text-neutral-400"}`}>
      {stale ? `confirmed ${label} · may be out of date` : `confirmed ${label}`}
    </span>
  )
}

/** A person's photo, or their initials on the neutral ground when they haven't added one. */
export function Avatar({ name, photo, size = 32 }: { name: string; photo?: string | null; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700 font-semibold text-neutral-200"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden
    >
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  )
}

/** One organizer: who they are, how to reach them, and how current that is. */
function OrganizerCard({ o, you }: { o: DirectoryEntry; you: boolean }) {
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={o.name} photo={o.photo} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">
            {o.name}
            {you && <span className="font-normal text-neutral-400"> (you)</span>}
          </p>
          <p className="truncate text-sm text-neutral-400">{o.title || "Organizer"}</p>
        </div>
      </div>
      {o.gradTerm && (
        <div>
          <Pill tone="violet">Graduates {o.gradTerm}</Pill>
        </div>
      )}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <a href={`mailto:${o.email}`} title={o.email} className={`${chipClass} min-w-0 max-w-full`}>
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{o.email}</span>
        </a>
        {o.linkedin && (
          <a href={o.linkedin} target="_blank" rel="noopener noreferrer" className={chipClass}>
            LinkedIn <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      {o.confirmedAt && (
        <div className="mt-auto">
          <Confirmed at={o.confirmedAt} />
        </div>
      )}
    </li>
  )
}

export function OrganizerList({ organizers, youEmail }: { organizers: DirectoryEntry[]; youEmail?: string | null }) {
  if (!organizers.length) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-800 p-4 text-sm text-neutral-400">
        No organizers listed yet. They appear here once they add themselves to the directory from their profile.
      </p>
    )
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {organizers.map((o) => (
        <OrganizerCard key={o.email} o={o} you={!!youEmail && o.email.toLowerCase() === youEmail.toLowerCase()} />
      ))}
    </ul>
  )
}

const sectionLabel = "mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400"
const chipClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900/60 px-2.5 py-1.5 text-sm text-neutral-200 transition-colors hover:border-neutral-600 hover:text-white"

/** A calendar-page date: month over day, pink for what's next, grey for what's past. */
function DateBadge({ iso, upcoming }: { iso: string; upcoming: boolean }) {
  const d = new Date(iso)
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "America/Chicago" })
  const day = d.toLocaleDateString("en-US", { day: "numeric", timeZone: "America/Chicago" })
  return (
    <span
      className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border leading-none ${
        upcoming ? "border-[#ef426f]/40 bg-[#ef426f]/10" : "border-neutral-700 bg-neutral-900/60"
      }`}
    >
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${upcoming ? "text-[#ef426f]" : "text-neutral-400"}`}>{month}</span>
      <span className="mt-1 text-lg font-bold text-white">{day}</span>
    </span>
  )
}

function CalendarLine({ event, upcoming }: { event: DirectoryEvent; upcoming: boolean }) {
  return (
    <a
      href={`/events/${event.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group -mx-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-800/60"
    >
      <DateBadge iso={event.date} upcoming={upcoming} />
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{upcoming ? "Next" : "Last"}</span>
        <span className="line-clamp-2 text-sm font-medium text-white group-hover:underline">{event.title}</span>
      </span>
    </a>
  )
}

/**
 * What a row opens to. The people are the point, so they get the main column
 * as cards (most groups have one to three); the calendar and the group's
 * channels sit in a side column, beside on wide screens and below on narrow.
 */
export function DirectoryPanel({
  community,
  organizers,
  events,
  youEmail,
  hideCalendar,
}: {
  community: DirectoryCommunity
  organizers: DirectoryEntry[]
  events: DirectoryEvent[]
  youEmail?: string | null
  hideCalendar?: boolean
}) {
  const channels = CHANNELS.filter(([field]) => typeof community[field] === "string" && community[field])
  const { next, last } = calendarFor(community.id, events)
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <section className="min-w-0">
        <p className={sectionLabel}>
          Organizers{organizers.length > 1 && <span className="ml-1.5 tabular-nums text-neutral-400">{organizers.length}</span>}
        </p>
        <OrganizerList organizers={organizers} youEmail={youEmail} />
        {community.pastLeads && community.pastLeads.length > 0 && (
          <div className="mt-4">
            <p className={sectionLabel}>Past leads</p>
            <p className="text-sm text-neutral-300">
              {community.pastLeads.map((l) => `${l.name}${l.title ? `, ${l.title}` : ""} (until ${l.until})`).join(" · ")}
            </p>
          </div>
        )}
      </section>
      <aside className="min-w-0 space-y-5 lg:border-l lg:border-neutral-800 lg:pl-6">
        {!hideCalendar && (
          <div>
            <p className={sectionLabel}>On the calendar</p>
            {next || last ? (
              <div className="space-y-1">
                {next && <CalendarLine event={next} upcoming />}
                {last && <CalendarLine event={last} upcoming={false} />}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">Nothing listed yet.</p>
            )}
          </div>
        )}
        <div>
          <p className={sectionLabel}>Channels</p>
          {channels.length ? (
            <div className="flex flex-wrap gap-2">
              {channels.map(([field, label]) => (
                <a key={field} href={community[field] as string} target="_blank" rel="noopener noreferrer" className={chipClass}>
                  {label} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">None listed.</p>
          )}
        </div>
      </aside>
    </div>
  )
}

/**
 * One group in the list: a header that opens and closes, with slots for the
 * admin's drag handle (`lead`) and Edit/Delete (`trailing`).
 */
export function DirectoryRow({
  community,
  organizers,
  events,
  open,
  onToggle,
  youEmail,
  lead,
  trailing,
  rowProps,
  highlight,
  label,
  hideCalendar,
}: {
  community: DirectoryCommunity
  organizers: DirectoryEntry[]
  events: DirectoryEvent[]
  open: boolean
  onToggle: () => void
  youEmail?: string | null
  lead?: React.ReactNode
  trailing?: React.ReactNode
  rowProps?: React.HTMLAttributes<HTMLDivElement>
  highlight?: string
  label?: string
  hideCalendar?: boolean
}) {
  return (
    <div {...rowProps} className={`rounded-xl border bg-neutral-800/30 transition-colors ${highlight ?? "border-neutral-800 hover:bg-neutral-800/50"}`}>
      <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        {lead}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
        >
          <ChevronRight className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? "rotate-90" : ""}`} />
          {community.logo && (
            <img src={community.logo} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-neutral-900 object-contain p-1" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-white">{community.name}</span>
            <span className="block truncate text-sm text-neutral-400">
              {label ?? kindLabel(community)}
              {organizers.length > 0 && ` · ${organizers.length} ${organizers.length === 1 ? "organizer" : "organizers"} listed`}
            </span>
          </span>
        </button>
        {trailing}
      </div>
      {open && (
        <div className="border-t border-neutral-800 px-4 py-4 sm:pl-14">
          <DirectoryPanel community={community} organizers={organizers} events={events} youEmail={youEmail} hideCalendar={hideCalendar} />
        </div>
      )}
    </div>
  )
}

/** The group's type in the community drawers: a tech group, or a student org and its school. */
export function GroupTypeFields({
  kind,
  school,
  onChange,
}: {
  kind?: "tech" | "student"
  school?: string | null
  onChange: (next: { kind: "tech" | "student"; school: string }) => void
}) {
  const current = kind === "student" ? "student" : "tech"
  const option = (value: "tech" | "student", text: string) => (
    <button
      type="button"
      onClick={() => onChange({ kind: value, school: school ?? "" })}
      aria-pressed={current === value}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        current === value ? "bg-[#ef426f] text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
      }`}
    >
      {text}
    </button>
  )
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-neutral-300">Type</label>
      <div className="flex gap-2">
        {option("tech", "Tech group")}
        {option("student", "Student org")}
      </div>
      {current === "student" && (
        <input
          type="text"
          value={school ?? ""}
          onChange={(e) => onChange({ kind: "student", school: e.target.value })}
          placeholder="School: UTSA, Trinity, St. Mary's…"
          maxLength={80}
          className="mt-3 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
        />
      )}
    </div>
  )
}
