"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { ArrowRight, Check, ExternalLink, Plus, X } from "lucide-react"
import { GroupHealth, type HealthRsvp } from "@/components/admin/group-health"
import { Pill } from "@/components/admin/data-table"
import type { DirectoryEntry } from "@/components/admin/community-directory"

/**
 * The admin Overview: what needs doing, before the tools to do it.
 *
 * Borrowed from next-geekdom's admin Overview: counts that need attention, each
 * a link to the fix, and quick actions that open the right drawer. The page is
 * the same for every role, but the question differs:
 *
 *   Admins      "What needs DEVSA's attention across all groups?" The inbox,
 *               this week's calendar, the health of the organizer network, and
 *               a preview of Monday's Discord digest (nothing is posted).
 *   Organizers  "What does my group need this week?" Their own upcoming events
 *               and drafts, a checklist for their public page, their
 *               organizers, and other groups' events, to start a co-host.
 *
 * Everything here is data the role already receives; this view adds no access.
 */

export type OverviewTab = "events" | "rsvps" | "communities" | "speakers" | "access" | "getinvolved" | "admins" | "activity"

export interface OverviewEvent {
  id: string
  title: string
  slug: string
  date: string
  communityId: string
  partnerId?: string
  status: string
  unlisted?: boolean
  rsvpEnabled?: boolean
  externalRsvpUrl?: string
  capacity?: number | null
}

/** One line of the change log, as /api/admin/activity returns it. */
export interface RecentChange {
  id: string
  at: string | null
  actor: string
  action: string
  kind: string
  label: string
}

export interface OverviewCommunity {
  id: string
  name: string
  logo: string
  description: string
  website?: string | null
  discord?: string | null
  meetup?: string | null
  luma?: string | null
  linkedin?: string | null
  instagram?: string | null
  kind?: "tech" | "student"
}

export interface OverviewAdmin {
  email: string
  role: string
  communityId?: string
  lastLoginAt?: string | null
  inDirectory?: boolean
  /** Groups an admin also runs. */
  organizerOf?: string[] | null
}

interface DigestPreview {
  postsAt: string
  count: number
  configured: boolean
  events: { title: string; date: string; communityName: string }[]
}

const ids = (stored?: string | null) => (stored || "").split(",").map((s) => s.trim()).filter(Boolean)
const hostsOf = (e: OverviewEvent) => [...ids(e.communityId), ...ids(e.partnerId)]
const DAY = 1000 * 60 * 60 * 24

/**
 * Drafts still worth publishing, and drafts dated in the past, which never will
 * be: those are clutter to delete or reschedule. A helper, so render stays free
 * of Date.now().
 */
function splitDrafts(events: OverviewEvent[]) {
  const now = Date.now()
  const drafts = events.filter((e) => e.status === "draft")
  const stale = drafts.filter((e) => new Date(e.date).getTime() < now - DAY)
  return { live: drafts.filter((e) => !stale.includes(e)), stale }
}

/** Upcoming, soonest first, from `now` up to `days` out. Plain function: no clock reads during render. */
function upcoming(events: OverviewEvent[], days: number, keep: (e: OverviewEvent) => boolean) {
  const now = Date.now()
  return events
    .filter(keep)
    .map((e) => ({ e, t: new Date(e.date).getTime() }))
    .filter(({ t }) => !Number.isNaN(t) && t >= now - DAY / 4 && t <= now + days * DAY)
    .sort((a, b) => a.t - b.t)
    .map(({ e }) => e)
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" })

/* ── pieces ─────────────────────────────────────────────────────────────── */

function Tile({ label, action, children, className = "" }: { label: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function TileLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-white">
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </button>
  )
}

/** A count that links to where it gets fixed; a pink rule marks one that needs attention. */
function Stat({ label, value, note, onClick }: { label: string; value: number; note: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-left transition-colors hover:border-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef426f]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</p>
      <p className={`mt-1 border-l-2 pl-2.5 text-2xl font-semibold tabular-nums text-white ${value > 0 ? "border-[#ef426f]" : "border-transparent"}`}>{value}</p>
      <p className="mt-1 text-xs text-neutral-400">{note}</p>
    </button>
  )
}

function Action({ onClick, children, primary }: { onClick: () => void; children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${
        primary ? "bg-[#ef426f] text-white hover:bg-[#d63760]" : "border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  )
}

/** Events already started, newest first. A helper, so render stays free of Date.now(). */
function recentPast(events: OverviewEvent[], keep: (e: OverviewEvent) => boolean) {
  const now = Date.now()
  return events
    .filter((e) => keep(e) && new Date(e.date).getTime() < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * `rsvps` is left out where the role can't see the count (an organizer, on
 * another group's event). With a capacity, the count reads against it, and a
 * full event or a waitlist is flagged: that's when someone should be moving
 * people up, or asking for a bigger room.
 */
function EventLine({ e, rsvps, waiting = 0, hostNames }: { e: OverviewEvent; rsvps?: number; waiting?: number; hostNames?: string }) {
  const going = rsvps === undefined ? undefined : rsvps - waiting
  const full = !!e.capacity && going !== undefined && going >= e.capacity
  return (
    <li className="grid grid-cols-[8.5rem_1fr_auto] items-baseline gap-3 border-t border-neutral-800 py-2.5 first:border-t-0">
      <span className="text-xs tabular-nums text-neutral-400">{when(e.date)}</span>
      <span className="min-w-0">
        <a href={`/events/${e.slug}`} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium text-white hover:underline">
          {e.title}
        </a>
        {hostNames && <span className="block truncate text-xs text-neutral-400">{hostNames}</span>}
      </span>
      <span className="flex flex-wrap items-center justify-end gap-1.5 whitespace-nowrap text-xs text-neutral-300">
        {going === undefined
          ? ""
          : e.rsvpEnabled
            ? e.capacity
              ? `${going} / ${e.capacity}`
              : `${going} RSVP${going === 1 ? "" : "s"}`
            : e.externalRsvpUrl
              ? "RSVP off-site"
              : ""}
        {full && <Pill tone="amber">Full</Pill>}
        {waiting > 0 && <Pill tone="amber">{waiting} waiting</Pill>}
      </span>
    </li>
  )
}

function Check1({ ok, children, fix }: { ok: boolean; children: React.ReactNode; fix?: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 py-1.5 text-sm">
      {ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />}
      <span className={ok ? "text-neutral-300" : "text-white"}>{children}</span>
      {!ok && fix && <span className="ml-auto shrink-0">{fix}</span>}
    </li>
  )
}

/* ── the view ───────────────────────────────────────────────────────────── */

export function AdminOverview(props: {
  role: "superadmin" | "admin" | "organizer"
  myCommunityId: string | null
  communities: OverviewCommunity[]
  events: OverviewEvent[]
  rsvpCountByEvent: Record<string, number>
  turnoutByEvent: Record<string, { going: number; came: number }>
  /** Every RSVP the role can see; the admin Overview's group health reads it. */
  rsvps: HealthRsvp[]
  directory: DirectoryEntry[]
  admins: OverviewAdmin[]
  pending: { access: number; speakers: number; getInvolved: number }
  youEmail: string
  youListed: boolean
  loadDigest: () => Promise<DigestPreview | null>
  /** The latest few entries of the change log (admins only). */
  loadActivity: () => Promise<RecentChange[] | null>
  /** Manage Admins, with the add form already open. */
  addOrganizer: () => void
  /** A person's name for an email, when someone in the portal has that address. */
  nameFor: (email: string) => string
  go: (tab: OverviewTab) => void
  addEvent: () => void
  addCommunity: () => void
  editGroup: () => void
  editProfile: () => void
}) {
  const isOrganizer = props.role === "organizer"
  const nameOf = (id: string) => props.communities.find((c) => c.id === id)?.name ?? id
  const hostNames = (e: OverviewEvent) => hostsOf(e).map(nameOf).join(" + ")
  const listed = (e: OverviewEvent) => e.status !== "draft" && !e.unlisted
  return isOrganizer ? <OrganizerView {...props} nameOf={nameOf} hostNames={hostNames} listed={listed} /> : <AdminView {...props} hostNames={hostNames} listed={listed} />
}

type ViewProps = Parameters<typeof AdminOverview>[0] & {
  hostNames: (e: OverviewEvent) => string
  listed: (e: OverviewEvent) => boolean
}

function AdminView(p: ViewProps) {
  const [digest, setDigest] = useState<DigestPreview | null | "error">(null)
  const { loadDigest } = p
  useEffect(() => {
    let cancelled = false
    loadDigest()
      .then((d) => !cancelled && setDigest(d ?? "error"))
      .catch(() => !cancelled && setDigest("error"))
    return () => {
      cancelled = true
    }
  }, [loadDigest])

  const [recent, setRecent] = useState<RecentChange[] | null | "error">(null)
  const { loadActivity } = p
  useEffect(() => {
    let cancelled = false
    loadActivity()
      .then((r) => !cancelled && setRecent(r ?? "error"))
      .catch(() => !cancelled && setRecent("error"))
    return () => {
      cancelled = true
    }
  }, [loadActivity])

  const drafts = splitDrafts(p.events)
  const week = upcoming(p.events, 7, (e) => e.status !== "draft")
  const waitingOn = (e: OverviewEvent) => (p.rsvpCountByEvent[e.id] ?? 0) - (p.turnoutByEvent[e.id]?.going ?? 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Access requests" value={p.pending.access} note="Waiting for approval" onClick={() => p.go("access")} />
        <Stat label="Speakers to review" value={p.pending.speakers} note="Submissions not yet decided" onClick={() => p.go("speakers")} />
        <Stat label="Get Involved" value={p.pending.getInvolved} note="New, not yet answered" onClick={() => p.go("getinvolved")} />
        <Stat
          label="Drafts"
          value={drafts.live.length}
          note={drafts.stale.length ? `Not published · ${drafts.stale.length} more dated in the past` : "Events not published"}
          onClick={() => p.go("events")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Tile label="This week on the calendar" className="lg:col-span-2" action={<TileLink onClick={() => p.go("events")}>All events</TileLink>}>
          {week.length === 0 ? (
            <p className="text-sm text-neutral-400">Nothing in the next seven days.</p>
          ) : (
            <ul>{week.map((e) => <EventLine key={e.id} e={e} rsvps={p.rsvpCountByEvent[e.id] ?? 0} waiting={waitingOn(e)} hostNames={p.hostNames(e)} />)}</ul>
          )}
          {drafts.stale.length > 0 && (
            <p className="mt-3 text-sm text-amber-300">
              Stale drafts, dated in the past: {drafts.stale.map((d) => d.title || "Untitled").join(", ")}. Delete or reschedule them.
            </p>
          )}
        </Tile>

        <Tile label="Quick actions">
          <div className="space-y-2">
            <Action primary onClick={p.addEvent}><Plus className="h-4 w-4" /> Add an event</Action>
            <Action onClick={p.addCommunity}><Plus className="h-4 w-4" /> Add a community</Action>
            <Action onClick={p.addOrganizer}><Plus className="h-4 w-4" /> Add an organizer</Action>
            <Action onClick={p.editProfile}>{p.youListed ? "Edit your profile" : "Add yourself to the directory"}</Action>
          </div>
        </Tile>

        <Tile label="Recent changes" className="lg:col-span-2" action={<TileLink onClick={() => p.go("activity")}>Activity</TileLink>}>
          {recent === null ? (
            <p className="text-sm text-neutral-400">Reading the log…</p>
          ) : recent === "error" ? (
            <p className="text-sm text-neutral-400">Couldn&apos;t read the change log.</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-neutral-400">Nothing logged yet. Changes appear here as people make them.</p>
          ) : (
            <ul>
              {recent.map((r) => {
                const gone = r.action === "deleted" || r.action === "removed"
                return (
                  <li key={r.id} className="grid grid-cols-[8.5rem_1fr] items-baseline gap-3 border-t border-neutral-800 py-2.5 first:border-t-0">
                    <span className="text-xs tabular-nums text-neutral-400">{r.at ? when(r.at) : ""}</span>
                    <span className="min-w-0 text-sm">
                      <span className={`font-medium ${gone ? "text-red-300" : "text-white"}`}>
                        {r.action[0].toUpperCase() + r.action.slice(1)} {r.kind === "community" ? "group" : r.kind}
                      </span>{" "}
                      <span className="text-neutral-300">{r.label}</span>
                      <span className="block truncate text-xs text-neutral-400">by {p.nameFor(r.actor)}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Tile>

        <Tile label="Monday's Discord digest">
          {digest === null ? (
            <p className="text-sm text-neutral-400">Reading the calendar…</p>
          ) : digest === "error" ? (
            <p className="text-sm text-neutral-400">Couldn&apos;t build the preview.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-white">
                Posts {new Date(digest.postsAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/Chicago" })}
                {" · "}
                <span className="font-semibold">{digest.count}</span> {digest.count === 1 ? "event" : "events"}
              </p>
              {!digest.configured && <Pill tone="amber">Webhook not set: it won&apos;t post</Pill>}
              {digest.events.length === 0 ? (
                <p className="text-neutral-400">An empty week. It still posts, pointing people to the calendar.</p>
              ) : (
                <ul className="space-y-1.5">
                  {digest.events.map((e) => (
                    <li key={e.title + e.date} className="text-neutral-300">
                      <span className="text-xs tabular-nums text-neutral-400">
                        {new Date(e.date).toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Chicago" })}
                      </span>{" "}
                      {e.title}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-neutral-400">A preview: nothing is posted from here.</p>
            </div>
          )}
        </Tile>

        <Tile label="Group health" className="lg:col-span-3" action={<TileLink onClick={() => p.go("communities")}>Directory</TileLink>}>
          <GroupHealth communities={p.communities} events={p.events} rsvps={p.rsvps} admins={p.admins} directory={p.directory} />
        </Tile>
      </div>
    </div>
  )
}

function OrganizerView(p: ViewProps & { nameOf: (id: string) => string }) {
  const mine = p.myCommunityId
  const group = p.communities.find((c) => c.id === mine)
  if (!mine || !group) {
    return <p className="rounded-xl border border-neutral-800 p-8 text-center text-neutral-300">No community is assigned to your account yet. Contact a DEVSA admin.</p>
  }
  const ours = (e: OverviewEvent) => hostsOf(e).includes(mine)
  const next = upcoming(p.events, 120, (e) => ours(e) && e.status !== "draft").slice(0, 5)
  const drafts = p.events.filter((e) => ours(e) && e.status === "draft")
  const around = upcoming(p.events, 30, (e) => !ours(e) && p.listed(e)).slice(0, 6)
  const organizers = p.directory.filter((d) => !!mine && d.groups.includes(mine))
  // Their last few events that took RSVPs here, newest first, and how many of those going came.
  const past = recentPast(p.events, (e) => ours(e) && !!p.turnoutByEvent[e.id]?.going).slice(0, 4)
  const counted = past.filter((e) => p.turnoutByEvent[e.id].came > 0)
  const showRate = counted.length
    ? Math.round((100 * counted.reduce((n, e) => n + p.turnoutByEvent[e.id].came, 0)) / counted.reduce((n, e) => n + p.turnoutByEvent[e.id].going, 0))
    : null
  const channels = [group.website, group.discord, group.meetup, group.luma, group.linkedin, group.instagram].filter(Boolean).length
  const fixGroup = <TileLink onClick={p.editGroup}>Edit</TileLink>

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Tile label="Next up" className="lg:col-span-2" action={<TileLink onClick={() => p.go("events")}>Your events</TileLink>}>
          {next.length === 0 ? (
            <p className="text-sm text-neutral-400">
              Nothing on the calendar yet.{" "}
              <button onClick={p.addEvent} className="font-medium text-white underline decoration-neutral-500 underline-offset-2 hover:decoration-white">Add your next event</button>
            </p>
          ) : (
            <ul>{next.map((e) => <EventLine key={e.id} e={e} rsvps={p.rsvpCountByEvent[e.id] ?? 0} />)}</ul>
          )}
          {drafts.length > 0 && (
            <p className="mt-3 text-sm text-amber-300">
              {drafts.length} draft{drafts.length === 1 ? "" : "s"} not published: {drafts.map((d) => d.title || "Untitled").join(", ")}
            </p>
          )}
        </Tile>

        <Tile label="Quick actions">
          <div className="space-y-2">
            <Action primary onClick={p.addEvent}><Plus className="h-4 w-4" /> Add an event</Action>
            <Action onClick={p.editGroup}>Edit your group</Action>
            <Action onClick={p.editProfile}>{p.youListed ? "Edit your profile" : "Add yourself to the directory"}</Action>
          </div>
        </Tile>

        <Tile label="Your group's page" className="lg:col-span-2" action={
          <a href={`/buildingtogether/${group.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-white">
            See it live <ExternalLink className="h-3.5 w-3.5" />
          </a>
        }>
          <ul>
            <Check1 ok={!!group.logo} fix={fixGroup}>A logo</Check1>
            <Check1 ok={(group.description || "").trim().length >= 40} fix={fixGroup}>A description people can decide from</Check1>
            <Check1 ok={channels > 0} fix={fixGroup}>At least one place to find you{channels > 0 ? ` (${channels} linked)` : ""}</Check1>
            <Check1 ok={!!group.discord || !!group.meetup || !!group.luma} fix={fixGroup}>A way to join: Discord, Meetup or Luma</Check1>
            <Check1 ok={next.length > 0} fix={<TileLink onClick={p.addEvent}>Add</TileLink>}>Something on the calendar</Check1>
          </ul>
        </Tile>

        <Tile label="Your organizers" action={<TileLink onClick={() => p.go("communities")}>Directory</TileLink>}>
          {organizers.length === 0 ? (
            <p className="text-sm text-neutral-400">Nobody from your group is in the directory yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {organizers.map((o) => (
                <li key={o.email} className="text-white">
                  {o.name}
                  {o.email.toLowerCase() === p.youEmail.toLowerCase() && <span className="text-neutral-400"> (you)</span>}
                  {o.gradTerm && <span className="block text-xs text-violet-300">Graduates {o.gradTerm}: line up the next lead</span>}
                </li>
              ))}
            </ul>
          )}
          {!p.youListed && (
            <button onClick={p.editProfile} className="mt-3 text-sm font-medium text-[#ff7a9c] hover:text-white">Add yourself →</button>
          )}
        </Tile>

        <Tile label="Turnout" className="lg:col-span-3" action={<TileLink onClick={() => p.go("rsvps")}>RSVPs</TileLink>}>
          {past.length === 0 ? (
            <p className="text-sm text-neutral-400">After your next event with RSVPs here, tick who came in the RSVPs tab and turnout shows up here.</p>
          ) : (
            <>
              <p className="mb-2 text-sm text-neutral-400">
                {showRate === null
                  ? "Tick \u201ccame\u201d at the door in the RSVPs tab to see who actually shows up."
                  : `${showRate}% of the people who RSVP'd came, across the events you checked people in at.`}
              </p>
              <ul>
                {past.map((e) => {
                  const t = p.turnoutByEvent[e.id]
                  return (
                    <li key={e.id} className="grid grid-cols-[8.5rem_1fr_auto] items-baseline gap-3 border-t border-neutral-800 py-2.5 first:border-t-0">
                      <span className="text-xs tabular-nums text-neutral-400">{when(e.date)}</span>
                      <span className="min-w-0 truncate text-sm font-medium text-white">{e.title}</span>
                      <span className="whitespace-nowrap text-xs text-neutral-300">
                        {t.came > 0 ? `${t.came} of ${t.going} came` : `${t.going} RSVP${t.going === 1 ? "" : "s"} · not checked in`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </Tile>

        <Tile label="Around the community" className="lg:col-span-3" action={<TileLink onClick={() => p.go("communities")}>Find the organizers</TileLink>}>
          <p className="mb-2 text-sm text-neutral-400">Other groups&apos; events in the next 30 days: a good place to start a co-host.</p>
          {around.length === 0 ? (
            <p className="text-sm text-neutral-400">Nothing else on the calendar this month.</p>
          ) : (
            <ul>{around.map((e) => <EventLine key={e.id} e={e} hostNames={p.hostNames(e)} />)}</ul>
          )}
        </Tile>
      </div>
    </div>
  )
}
