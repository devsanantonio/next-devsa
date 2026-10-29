"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { Pill } from "@/components/admin/data-table"
import { isHostedBy } from "@/lib/event-hosts"

/**
 * "Is this group healthy?" for admins, from data the dashboard already holds:
 * each group's events and RSVPs over the last 90 days against the 90 before,
 * turnout where organizers checked people in, when it last met, and whether
 * anyone who runs it has signed in lately.
 *
 * Quiet groups sort first: no event in 90 days and nothing coming up. Those
 * are the ones to call. Having nobody in the portal is shown separately: plenty
 * of active groups have their events posted by DEVSA.
 *
 * RSVPs and turnout count only events that took RSVPs on devsa.community. Most
 * groups use Meetup or Luma, and a 0 there would read as "nobody came".
 *
 * Its header carries the people checks too (organizers not signed in, not in
 * the directory, student leads graduating). They used to be a separate
 * "Groups and organizers" tile that counted staffing its own way, so the
 * Overview could give two different answers to "which groups have nobody?".
 *
 * Collapsed, it shows the quiet groups and the five busiest; "Show all" opens
 * the rest.
 */

export interface HealthCommunity {
  id: string
  name: string
  logo?: string
}
export interface HealthEvent {
  id: string
  date: string
  status?: string
  communityId?: string | null
  partnerId?: string | null
  rsvpEnabled?: boolean
}
export interface HealthRsvp {
  eventId: string
  waitlisted?: boolean
  checkedInAt?: string | null
}
export interface HealthAdmin {
  role: string
  communityId?: string
  organizerOf?: string[] | null
  lastLoginAt?: string | null
  inDirectory?: boolean
}
export interface HealthPerson {
  name: string
  gradTerm: string | null
  communityId: string | null
}

type State = "active" | "quiet"

interface Row {
  community: HealthCommunity
  events: number
  eventsBefore: number
  /** Null when none of the period's events took RSVPs here. */
  going: number | null
  goingBefore: number
  turnout: { came: number; going: number } | null
  lastEvent: number | null
  upcoming: boolean
  organizers: number
  lastSignIn: number | null
  state: State
}

const DAY = 24 * 60 * 60 * 1000

/** Computed in a helper so the component's render stays free of Date.now(). */
function healthRows(communities: HealthCommunity[], events: HealthEvent[], rsvps: HealthRsvp[], admins: HealthAdmin[]): Row[] {
  const now = Date.now()
  const going = new Map<string, number>()
  const came = new Map<string, number>()
  for (const r of rsvps) {
    if (r.waitlisted) continue
    going.set(r.eventId, (going.get(r.eventId) ?? 0) + 1)
    if (r.checkedInAt) came.set(r.eventId, (came.get(r.eventId) ?? 0) + 1)
  }
  const published = events.filter((e) => e.status !== "draft").map((e) => ({ ...e, t: new Date(e.date).getTime() })).filter((e) => !Number.isNaN(e.t))

  return communities.map((c) => {
    const mine = published.filter((e) => isHostedBy(e, c.id))
    const recent = mine.filter((e) => e.t <= now && e.t > now - 90 * DAY)
    const before = mine.filter((e) => e.t <= now - 90 * DAY && e.t > now - 180 * DAY)
    const sum = (list: typeof mine, m: Map<string, number>) => list.reduce((n, e) => n + (m.get(e.id) ?? 0), 0)
    const here = (list: typeof mine) => list.filter((e) => e.rsvpEnabled)
    const checked = recent.filter((e) => (came.get(e.id) ?? 0) > 0)
    const past = mine.filter((e) => e.t <= now).map((e) => e.t)
    // An organizer's one group; an admin's assigned group and the groups they run (see groupsOf).
    const runners = admins.filter((a) =>
      a.role === "organizer" ? a.communityId === c.id : a.communityId === c.id || !!a.organizerOf?.includes(c.id)
    )
    const signIns = runners.map((a) => (a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : NaN)).filter((t) => !Number.isNaN(t))
    const upcoming = mine.some((e) => e.t > now)
    const lastEvent = past.length ? Math.max(...past) : null
    const state: State = !upcoming && (!lastEvent || lastEvent < now - 90 * DAY) ? "quiet" : "active"
    return {
      community: c,
      events: recent.length,
      eventsBefore: before.length,
      going: here(recent).length || here(before).length ? sum(here(recent), going) : null,
      goingBefore: sum(here(before), going),
      turnout: checked.length ? { came: sum(checked, came), going: sum(checked, going) } : null,
      lastEvent,
      upcoming,
      organizers: runners.length,
      lastSignIn: signIns.length ? Math.max(...signIns) : null,
      state,
    }
  })
}

const ORDER: Record<State, number> = { quiet: 0, active: 1 }
const STATE_PILL: Record<State, { tone: "amber" | "green"; label: string }> = {
  quiet: { tone: "amber", label: "Quiet" },
  active: { tone: "green", label: "Active" },
}

function Trend({ now, before }: { now: number; before: number }) {
  if (now === before) return <Minus className="inline h-3 w-3 text-neutral-500" aria-label="same as the 90 days before" />
  return now > before ? (
    <ArrowUp className="inline h-3 w-3 text-emerald-400" aria-label={`up from ${before}`} />
  ) : (
    <ArrowDown className="inline h-3 w-3 text-amber-300" aria-label={`down from ${before}`} />
  )
}

const shortDate = (t: number | null) =>
  t ? new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit", timeZone: "America/Chicago" }) : "—"

const BUSIEST = 5

export function GroupHealth({
  communities,
  events,
  rsvps,
  admins,
  directory,
}: {
  communities: HealthCommunity[]
  events: HealthEvent[]
  rsvps: HealthRsvp[]
  admins: HealthAdmin[]
  /** Opted-in directory entries; student leads with a grad term are listed. */
  directory: HealthPerson[]
}) {
  const [showAll, setShowAll] = useState(false)
  const rows = healthRows(communities, events, rsvps, admins).sort(
    (a, b) => ORDER[a.state] - ORDER[b.state] || b.events - a.events || a.community.name.localeCompare(b.community.name)
  )
  const quiet = rows.filter((r) => r.state === "quiet")
  const unstaffed = rows.filter((r) => r.organizers === 0).length
  const shown = showAll ? rows : [...quiet, ...rows.filter((r) => r.state === "active").slice(0, BUSIEST)]

  const organizers = admins.filter((a) => a.role === "organizer")
  const notSeen = organizers.filter((a) => !a.lastLoginAt).length
  const unlisted = organizers.filter((a) => !a.inDirectory).length
  const students = directory.filter((d) => d.gradTerm)
  const groupName = (id: string | null) => (id ? communities.find((c) => c.id === id)?.name ?? id : "DEVSA")

  const fact = (n: number, text: string, tone = "text-white") => (
    <li className="flex items-baseline gap-2">
      <span className={`w-8 shrink-0 text-right font-semibold tabular-nums ${tone}`}>{n}</span>
      <span className="text-neutral-300">{text}</span>
    </li>
  )

  return (
    <div>
      <ul className="mb-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {fact(quiet.length, "quiet: no event in 90 days, nothing coming up", quiet.length ? "text-amber-300" : "text-white")}
        {fact(unstaffed, `of ${rows.length} groups have nobody in the portal`)}
        {fact(notSeen, `${notSeen === 1 ? "organizer hasn't" : "organizers haven't"} signed in since Oct 12`)}
        {fact(unlisted, `${unlisted === 1 ? "organizer isn't" : "organizers aren't"} in the directory`)}
      </ul>
      {students.length > 0 && (
        <p className="mb-4 text-[13px] leading-relaxed text-neutral-400">
          <span className="text-violet-300">Student leads graduating:</span>{" "}
          {students.map((s) => `${s.name} (${groupName(s.communityId)}) · ${s.gradTerm}`).join(" · ")}
        </p>
      )}
      <p className="mb-3 text-[13px] text-neutral-400">
        Last 90 days, with the arrow against the 90 before. RSVPs and turnout count events that took RSVPs here; most groups use Meetup or Luma.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-400">
              <th className="py-2 pr-3 font-semibold">Group</th>
              <th className="px-3 py-2 font-semibold">Events</th>
              <th className="px-3 py-2 font-semibold">RSVPs</th>
              <th className="px-3 py-2 font-semibold">Turnout</th>
              <th className="px-3 py-2 font-semibold">Last met</th>
              <th className="px-3 py-2 font-semibold">Organizers</th>
              <th className="py-2 pl-3 font-semibold"><span className="sr-only">Status</span></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.community.id} className="border-b border-neutral-800/60 last:border-b-0">
                <td className="py-2.5 pr-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    {r.community.logo ? (
                      <img src={r.community.logo} alt="" className="h-6 w-6 shrink-0 rounded bg-neutral-900 object-contain p-0.5" />
                    ) : (
                      <span className="h-6 w-6 shrink-0 rounded bg-neutral-800" />
                    )}
                    <span className="truncate font-medium text-white">{r.community.name}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 tabular-nums text-neutral-200">
                  {r.events} <Trend now={r.events} before={r.eventsBefore} />
                  {r.upcoming && <span className="ml-1.5 text-xs text-emerald-400">+ next</span>}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-neutral-200">
                  {r.going === null ? (
                    <span className="text-neutral-400" title="This group's events take RSVPs elsewhere">off-site</span>
                  ) : (
                    <>
                      {r.going} <Trend now={r.going} before={r.goingBefore} />
                    </>
                  )}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-neutral-200">
                  {r.turnout ? `${Math.round((100 * r.turnout.came) / Math.max(1, r.turnout.going))}%` : <span className="text-neutral-400">—</span>}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-neutral-300">{shortDate(r.lastEvent)}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-neutral-300">
                  {r.organizers === 0 ? (
                    <span className="text-neutral-400">none in the portal</span>
                  ) : (
                    <>
                      {r.organizers}
                      <span className="text-neutral-400"> · {r.lastSignIn ? `seen ${shortDate(r.lastSignIn)}` : "not signed in"}</span>
                    </>
                  )}
                </td>
                <td className="py-2.5 pl-3 text-right">
                  <Pill tone={STATE_PILL[r.state].tone}>{STATE_PILL[r.state].label}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > shown.length || showAll ? (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm font-medium text-neutral-300 hover:text-white"
        >
          {showAll ? "Show fewer" : `Show all ${rows.length} groups`}
        </button>
      ) : null}
    </div>
  )
}
