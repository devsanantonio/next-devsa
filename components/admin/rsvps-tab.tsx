"use client"

import { useState } from "react"
import { Download, Loader2, Mail, Trash2, Users } from "lucide-react"
import { AdminCombobox } from "@/components/admin/admin-combobox"
import { messageWindow, MESSAGE_LIMIT } from "@/lib/event-messages"

/**
 * The RSVPs tab: every RSVP the role can see, grouped by event, with the door
 * (the "Came" box), the waitlist (Move up), CSV export and "Message attendees".
 * Moved out of app/admin/page.tsx in 2026-10 with its filters, handlers and the
 * message dialog, which nothing else on the page used. The page still owns the
 * RSVP list itself, because the Overview and the event drawer read it too.
 */

export interface RsvpRow {
  id: string
  eventId: string
  eventSlug: string
  communityId: string
  firstName: string
  lastName: string
  email: string
  joinNewsletter: boolean
  question?: string
  answer?: string
  submittedAt: string
  waitlisted?: boolean
  checkedInAt?: string | null
}

interface RsvpEvent {
  id: string
  title: string
  date: string
  communityId: string
  partnerId?: string
  communityName?: string
  isOfficial?: boolean
  rsvpEnabled?: boolean
  messages?: { at: string; by: string; subject: string; sent: number }[]
}

const hostIds = (stored?: string | null) =>
  (stored || "").split(",").map((id) => id.trim()).filter(Boolean)

/** The message window as of now. A helper, so render stays free of Date.now(). */
const messageGate = (date: string | undefined, sent: number) => messageWindow(date, sent, Date.now())

type EventRSVP = RsvpRow

export function RsvpsTab({
  rsvps,
  setRsvps,
  events,
  communities,
  partners,
  isAdmin,
  viewCommunityId,
  adminFetch,
  onError,
  onSuccess,
  onChanged,
}: {
  rsvps: RsvpRow[]
  setRsvps: React.Dispatch<React.SetStateAction<RsvpRow[]>>
  events: RsvpEvent[]
  communities: { id: string; name: string }[]
  partners: { id: string; name: string }[]
  isAdmin: boolean
  /** An organizer's (or a group view's) own group, which scopes the CSV. */
  viewCommunityId: string | null
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  onError: (message: string) => void
  onSuccess: (message: string) => void
  onChanged: () => Promise<void> | void
}) {
  const [selectedRsvpEvent, setSelectedRsvpEvent] = useState<string>("all")
  const [selectedRsvpCommunity, setSelectedRsvpCommunity] = useState<string>("all")

  /** The CSV of what's on screen: the chosen event, else the chosen group (or the group being viewed). */
  const [isExportingRsvps, setIsExportingRsvps] = useState(false)
  const exportCsv = async () => {
    const eventId = selectedRsvpEvent
    const groupId = selectedRsvpCommunity !== 'all' ? selectedRsvpCommunity : viewCommunityId
    setIsExportingRsvps(true)
    try {
      let url = `/api/rsvp?format=csv`
      if (eventId && eventId !== 'all') url += `&eventId=${encodeURIComponent(eventId)}`
      else if (groupId) url += `&communityId=${encodeURIComponent(groupId)}`
      
      const response = await adminFetch(url)
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `rsvps-${eventId !== 'all' ? eventId : groupId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        onError("Failed to export RSVPs")
      }
    } catch {
      onError("Failed to export RSVPs")
    } finally {
      setIsExportingRsvps(false)
    }
  }

  /** "Came", ticked at the door. Optimistic: the box changes at once and reverts if the API refuses. */
  const toggleCheckIn = async (rsvp: EventRSVP, came: boolean) => {
    const before = rsvp.checkedInAt ?? null
    setRsvps((prev) => prev.map((r) => (r.id === rsvp.id ? { ...r, checkedInAt: came ? new Date().toISOString() : null } : r)))
    try {
      const res = await adminFetch("/api/rsvp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpId: rsvp.id, action: "checkin", value: came }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setRsvps((prev) => prev.map((r) => (r.id === rsvp.id ? { ...r, checkedInAt: before } : r)))
      onError("Couldn't save the check-in")
    }
  }

  /** Off the waitlist: they get the confirmation email, saying a spot opened. */
  const [promotingRsvp, setPromotingRsvp] = useState<string | null>(null)
  const promoteRsvp = async (rsvp: EventRSVP) => {
    setPromotingRsvp(rsvp.id)
    try {
      const res = await adminFetch("/api/rsvp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpId: rsvp.id, action: "promote" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        onError(data.error || "Couldn't move them up")
        return
      }
      setRsvps((prev) => prev.map((r) => (r.id === rsvp.id ? { ...r, waitlisted: false } : r)))
      onSuccess(`${rsvp.firstName} is in, and has been emailed`)
    } catch {
      onError("Couldn't move them up")
    } finally {
      setPromotingRsvp(null)
    }
  }

  /** "Message attendees": the organizers' own note to the people going. Rules in lib/event-messages.ts. */
  const [messageTarget, setMessageTarget] = useState<{ eventId: string; title: string; going: number } | null>(null)
  const [messageDraft, setMessageDraft] = useState({ subject: "", message: "" })
  const [isMessaging, setIsMessaging] = useState(false)
  const sendAttendeeMessage = async () => {
    if (!messageTarget) return
    setIsMessaging(true)
    try {
      const res = await adminFetch("/api/events/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: messageTarget.eventId, kind: "message", ...messageDraft }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        onError(data.error || "Couldn't send the message")
        return
      }
      setMessageTarget(null)
      setMessageDraft({ subject: "", message: "" })
      onSuccess(
        data.configured === false
          ? "Email isn't configured here, so nothing was sent"
          : `Sent to ${data.sent} of ${data.total} ${data.total === 1 ? "person" : "people"} going`
      )
      await onChanged()
    } catch {
      onError("Couldn't send the message")
    } finally {
      setIsMessaging(false)
    }
  }

  const [isDeletingRsvp, setIsDeletingRsvp] = useState<string | null>(null)
  const handleDeleteRsvp = async (rsvpId: string) => {
    if (!confirm("Are you sure you want to delete this RSVP?")) return
    
    setIsDeletingRsvp(rsvpId)
    try {
      const response = await adminFetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpId }),
      })

      if (response.ok) {
        setRsvps(prev => prev.filter(r => r.id !== rsvpId))
        onSuccess("RSVP deleted")
      } else {
        const data = await response.json()
        onError(data.error || "Failed to delete RSVP")
      }
    } catch {
      onError("Failed to delete RSVP")
    } finally {
      setIsDeletingRsvp(null)
    }
  }

  return (
    <>
      <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight text-white">Event RSVPs</h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Community filter — admins/superadmins only (organizers own a single group) */}
              {isAdmin && (
                <AdminCombobox
                  className="w-52"
                  value={selectedRsvpCommunity}
                  onChange={(v) => {
                    setSelectedRsvpCommunity(v)
                    setSelectedRsvpEvent('all')
                  }}
                  options={[
                    { value: 'all', label: 'All Communities' },
                    ...communities.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              )}

              {/* Event filter */}
              <AdminCombobox
                className="w-60"
                value={selectedRsvpEvent}
                onChange={setSelectedRsvpEvent}
                placeholder="All Events"
                options={[
                  { value: 'all', label: 'All Events' },
                  // Newest first, and a collab event counts for every group hosting it.
                  ...events
                    .filter((e) => e.rsvpEnabled && (selectedRsvpCommunity === 'all' || hostIds(e.communityId).includes(selectedRsvpCommunity)))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((e) => ({ value: e.id, label: e.title })),
                ]}
              />

              <button
                onClick={exportCsv}
                disabled={isExportingRsvps || rsvps.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors disabled:opacity-50"
              >
                {isExportingRsvps ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export CSV
              </button>
            </div>
          </div>

          {(() => {
            let filteredRsvps = rsvps
            // Filter by community first
            if (selectedRsvpCommunity !== 'all') {
              filteredRsvps = filteredRsvps.filter(r => hostIds(r.communityId).includes(selectedRsvpCommunity))
            }
            // Then filter by event
            if (selectedRsvpEvent !== 'all') {
              filteredRsvps = filteredRsvps.filter(r => r.eventId === selectedRsvpEvent)
            }

            // Summary metrics for the KPI row (reflect the active filters)
            const totalRsvps = filteredRsvps.length
            const optedIn = filteredRsvps.filter(r => r.joinNewsletter).length
            const optInRate = totalRsvps > 0 ? Math.round((optedIn / totalRsvps) * 100) : 0
            // By id: an event whose address changed keeps one count and one group.
            const eventCount = new Set(filteredRsvps.map(r => r.eventId || r.eventSlug)).size
            // Each group counted once, whether it hosted alone or in a collab.
            const communityCount = new Set(filteredRsvps.flatMap(r => hostIds(r.communityId))).size

            const tiles: { label: string; value: number; sub?: string }[] = [
              { label: 'Total RSVPs', value: totalRsvps },
              { label: 'Events', value: eventCount },
              { label: 'Newsletter opt-ins', value: optedIn, sub: `${optInRate}%` },
              // Communities only matters when more than one group is in view
              ...(isAdmin ? [{ label: 'Communities', value: communityCount }] : []),
            ]

            // Group by event
            const groupedByEvent = filteredRsvps.reduce((acc, rsvp) => {
              const key = rsvp.eventId || rsvp.eventSlug
              if (!acc[key]) {
                const event = events.find(e => e.id === rsvp.eventId)
                /*
                 * Every host, by name. This looked up one community by the
                 * RSVP's communityId, which a collab stores as
                 * "alamo-python,pytexas" and a partner- or DEVSA-hosted
                 * event leaves empty, so all three showed "Unknown". The
                 * event record is the source; the RSVP's copy is the fallback
                 * for an event since deleted.
                 */
                const groupNames = hostIds(event?.communityId ?? rsvp.communityId)
                  // A partner typed in as a custom host (Tech Bloc on its own events) resolves too.
                  .map(id => communities.find(c => c.id === id)?.name || partners.find(p => p.id === id)?.name || event?.communityName || id)
                const partnerNames = hostIds(event?.partnerId)
                  .map(id => partners.find(p => p.id === id)?.name || id)
                const hostNames = [...(event?.isOfficial ? ['DEVSA'] : []), ...groupNames, ...partnerNames]
                acc[key] = {
                  eventId: rsvp.eventId,
                  eventDate: event?.date,
                  messagesSent: event?.messages?.length ?? 0,
                  eventTitle: event?.title || rsvp.eventSlug,
                  communityName: hostNames.length ? hostNames.join(' + ') : 'Unknown',
                  // For ordering: the event's own date (0 if the event is gone).
                  sortAt: event?.date ? new Date(event.date).getTime() : 0,
                  rsvps: []
                }
              }
              acc[key].rsvps.push(rsvp)
              return acc
            }, {} as Record<string, { eventId: string; eventDate?: string; messagesSent: number; eventTitle: string; communityName: string; sortAt: number; rsvps: EventRSVP[] }>)

            // An event that has since been deleted has no date; its latest RSVP stands in.
            const orderAt = (g: { sortAt: number; rsvps: EventRSVP[] }) =>
              g.sortAt || Math.max(0, ...g.rsvps.map(r => new Date(r.submittedAt).getTime() || 0))

            return (
              <>
                {/* Summary tiles */}
                <div className={`mb-6 grid grid-cols-2 gap-3 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                  {tiles.map((t) => (
                    <div key={t.label} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{t.label}</p>
                      <p className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-2xl font-semibold tabular-nums text-white">{t.value}</span>
                        {t.sub && <span className="text-sm font-medium text-neutral-500">{t.sub}</span>}
                      </p>
                    </div>
                  ))}
                </div>

                {totalRsvps === 0 ? (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 py-12 text-center">
                    <Users className="mx-auto mb-3 h-6 w-6 text-neutral-600" />
                    <p className="text-sm text-neutral-400">No RSVPs yet</p>
                    <p className="mt-1 text-xs text-neutral-600">
                      Enable RSVP on an event to start collecting registrations.
                    </p>
                  </div>
                ) : (
                <div className="space-y-6">
                {/* Most recent event first. */}
                {Object.entries(groupedByEvent).sort(([, a], [, b]) => orderAt(b) - orderAt(a)).map(([slug, { eventId, eventDate, messagesSent, eventTitle, communityName, rsvps: eventRsvps }]) => {
                  const going = eventRsvps.filter((r) => !r.waitlisted)
                  const waiting = eventRsvps.length - going.length
                  const came = going.filter((r) => r.checkedInAt).length
                  const gate = messageGate(eventDate, messagesSent)
                  return (
                  <div key={slug} className="rounded-xl border border-neutral-800 bg-neutral-800/30 overflow-hidden">
                    <div className="px-4 py-3 bg-neutral-800/50 border-b border-neutral-700 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white">{eventTitle}</h3>
                        {/* Community badge only helps super admins viewing multiple groups */}
                        {isAdmin && (
                          <span className="inline-flex items-center rounded-full bg-[#ef426f]/20 px-2.5 py-0.5 text-xs font-medium text-[#ef426f]">
                            {communityName}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="text-sm text-neutral-400">
                          {going.length} going
                          {waiting > 0 && <> · <span className="text-amber-300">{waiting} on the waitlist</span></>}
                          {/* Turnout once anyone's been checked in: what tells a format or a time is working. */}
                          {came > 0 && <> · <span className="text-emerald-400">{came} of {going.length} came</span></>}
                          {" · "}{eventRsvps.filter(r => r.joinNewsletter).length} opted in
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMessageDraft({ subject: "", message: "" })
                            setMessageTarget({ eventId, title: eventTitle, going: going.length })
                          }}
                          disabled={!gate.open || going.length === 0}
                          title={gate.open ? `${MESSAGE_LIMIT - messagesSent} of ${MESSAGE_LIMIT} left for this event` : gate.reason}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-600 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 transition-colors hover:bg-neutral-700/60 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Message attendees
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-175">
                        <thead>
                          <tr className="border-b border-neutral-800">
                            <th className="w-16 text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Came</th>
                            <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                            <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Email</th>
                            {eventRsvps.some(r => r.question) && (
                              <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider" title={eventRsvps.find(r => r.question)?.question}>
                                {eventRsvps.find(r => r.question)?.question}
                              </th>
                            )}
                            <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Newsletter</th>
                            <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Registered</th>
                            <th className="text-right py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap"><span className="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                          {/* Going first, then the waitlist in the order they joined it; within going, latest registration first. */}
                          {[...eventRsvps]
                            .sort((a, b) =>
                              Number(!!a.waitlisted) - Number(!!b.waitlisted) ||
                              (a.waitlisted
                                ? (new Date(a.submittedAt).getTime() || 0) - (new Date(b.submittedAt).getTime() || 0)
                                : (new Date(b.submittedAt).getTime() || 0) - (new Date(a.submittedAt).getTime() || 0)))
                            .map((rsvp) => (
                            <tr key={rsvp.id} className="hover:bg-neutral-800/30 transition-colors leading-tight">
                              <td className="py-2 px-4">
                                {!rsvp.waitlisted && (
                                  <input
                                    type="checkbox"
                                    checked={!!rsvp.checkedInAt}
                                    onChange={(e) => toggleCheckIn(rsvp, e.target.checked)}
                                    aria-label={`${rsvp.firstName} ${rsvp.lastName} came`}
                                    className="h-4 w-4 cursor-pointer accent-emerald-500"
                                  />
                                )}
                              </td>
                              <td className="py-2 px-4 text-sm font-semibold text-white whitespace-nowrap">
                                {rsvp.firstName} {rsvp.lastName}
                                {rsvp.waitlisted && (
                                  <span className="ml-2 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">Waitlist</span>
                                )}
                              </td>
                              <td className="py-2 px-4 text-sm font-medium text-neutral-400 whitespace-nowrap">{rsvp.email}</td>
                              {eventRsvps.some(r => r.question) && (
                                <td className="py-2 px-4 text-sm text-neutral-300 max-w-xs">{rsvp.answer || <span className="text-neutral-400">—</span>}</td>
                              )}
                              <td className="py-2 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                  rsvp.joinNewsletter
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-neutral-500/20 text-neutral-400"
                                }`}>
                                  {rsvp.joinNewsletter ? "Opted In" : "No"}
                                </span>
                              </td>
                              <td className="py-2 px-4 text-sm font-medium text-neutral-500 whitespace-nowrap">
                                {new Date(rsvp.submittedAt).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-2">
                                {rsvp.waitlisted && (
                                  <button
                                    onClick={() => promoteRsvp(rsvp)}
                                    disabled={promotingRsvp === rsvp.id}
                                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                                  >
                                    {promotingRsvp === rsvp.id && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Move up
                                  </button>
                                )}
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteRsvp(rsvp.id)}
                                    disabled={isDeletingRsvp === rsvp.id}
                                    className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                  >
                                    {isDeletingRsvp === rsvp.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                    Delete
                                  </button>
                                )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  )
                })}
                </div>
                )}
              </>
            )
          })()}
        </div>

      {/* Message attendees: subject and note, to everyone going (not the waitlist). */}
      {messageTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="message-title">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendAttendeeMessage()
            }}
            className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
          >
            <h3 id="message-title" className="text-lg font-bold text-white">
              Message the {messageTarget.going} {messageTarget.going === 1 ? "person" : "people"} going
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              For {messageTarget.title}. It goes from DEVSA with your name on it, and replies come to you. Each event gets {MESSAGE_LIMIT}, from three days before to a week after.
            </p>
            <label htmlFor="message-subject" className="mt-4 block text-sm font-semibold text-neutral-300">Subject</label>
            <input
              id="message-subject"
              required
              maxLength={120}
              value={messageDraft.subject}
              onChange={(e) => setMessageDraft({ ...messageDraft, subject: e.target.value })}
              placeholder="Slides and the recording"
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none"
            />
            <label htmlFor="message-body" className="mt-4 block text-sm font-semibold text-neutral-300">Message</label>
            <textarea
              id="message-body"
              required
              rows={6}
              maxLength={3000}
              value={messageDraft.message}
              onChange={(e) => setMessageDraft({ ...messageDraft, message: e.target.value })}
              placeholder="Thanks for coming out last night. The slides are here: …"
              className="mt-2 w-full resize-y rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none"
            />
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={isMessaging}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] disabled:opacity-50"
              >
                {isMessaging ? <Loader2 className="h-4 w-4 animate-spin" /> : `Send to ${messageTarget.going}`}
              </button>
              <button type="button" onClick={() => setMessageTarget(null)} disabled={isMessaging} className="flex-1 rounded-xl border border-neutral-600 px-4 py-2.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 disabled:opacity-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
