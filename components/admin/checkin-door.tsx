"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { newClientId, useCheckinQueue, type QueuedOp } from "@/lib/checkin-queue"
import type { RsvpRow } from "@/components/admin/rsvps-tab"

/**
 * The door: checking people in at one event, on a phone.
 *
 * Built after next-sasw's check-in portal and for the same moment: held at arm's
 * length in a doorway, often one-handed, with somebody waiting. So it is not on
 * the admin's desktop scale. The 56px search field and the full-size Check in
 * button are the point of the screen; the search pins to the top so typing never
 * scrolls it away; a loud bar names the person just let in, with Undo, and
 * clears itself; and "no match" is a way through (add them at the door), not a
 * dead end, because a free community night has walk-ins.
 *
 * Writes go through lib/checkin-queue.ts, so a dropped venue wifi keeps
 * recording on the device and sends when it's back. The page owns the RSVP list;
 * changes go back through `setRows`, so the RSVPs tab and the Overview's turnout
 * follow without a reload.
 */
export function CheckinDoor({
  event,
  rows,
  setRows,
  adminFetch,
  onClose,
}: {
  event: { id: string; title: string; date?: string }
  /** This event's RSVPs. */
  rows: RsvpRow[]
  setRows: React.Dispatch<React.SetStateAction<RsvpRow[]>>
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  onClose: () => void
}) {
  const [query, setQuery] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [walkIn, setWalkIn] = React.useState<{ firstName: string; lastName: string; email: string } | null>(null)
  const [confirmed, setConfirmed] = React.useState<{ name: string; id: string | null } | null>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const confirmTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const nameOf = (r: RsvpRow) => `${r.firstName} ${r.lastName}`.trim()
  const patch = React.useCallback(
    (id: string, came: boolean) =>
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, checkedInAt: came ? new Date().toISOString() : null } : r))),
    [setRows],
  )

  const { queue, online, run, retry } = useCheckinQueue(
    React.useCallback(
      async (op: QueuedOp) => {
        // adminFetch rejects only when the network failed, which is what the queue keeps.
        const res =
          op.kind === "checkIn"
            ? await adminFetch("/api/rsvp", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rsvpId: op.rsvpId, action: "checkin", value: op.came }),
              })
            : await adminFetch("/api/rsvp", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "walkin", eventId: op.eventId, clientId: op.clientId, firstName: op.firstName, lastName: op.lastName, email: op.email }),
              })
        if (res.ok) return { ok: true }
        const data = await res.json().catch(() => ({}))
        return { ok: false, error: data.error || "That didn't save" }
      },
      [adminFetch],
    ),
  )

  /** Clear the field, put the cursor back, and say who just went through. */
  const advance = (name: string, id: string | null) => {
    setQuery("")
    setWalkIn(null)
    setConfirmed({ name, id })
    searchRef.current?.focus()
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    confirmTimer.current = setTimeout(() => setConfirmed(null), 6000)
  }
  React.useEffect(() => () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
  }, [])

  const doCheckIn = async (row: RsvpRow, came = true) => {
    patch(row.id, came) // optimistic
    if (came) advance(nameOf(row), row.id)
    const res = await run({ kind: "checkIn", clientId: newClientId(), rsvpId: row.id, came, name: nameOf(row) })
    if (!res.ok && !res.queued) {
      patch(row.id, !came)
      setConfirmed(null)
      setError(res.error ?? "That didn't save")
    }
  }

  const doWalkIn = async (w: { firstName: string; lastName: string; email: string }) => {
    const clientId = newClientId()
    const id = `door-${clientId}`
    setRows((prev) => [
      {
        id,
        eventId: event.id,
        eventSlug: "",
        communityId: "",
        firstName: w.firstName,
        lastName: w.lastName,
        email: w.email,
        joinNewsletter: false,
        submittedAt: new Date().toISOString(),
        checkedInAt: new Date().toISOString(),
      },
      ...prev,
    ])
    advance(`${w.firstName} ${w.lastName}`.trim(), null)
    const res = await run({ kind: "walkIn", clientId, eventId: event.id, ...w })
    if (!res.ok && !res.queued) {
      setRows((prev) => prev.filter((r) => r.id !== id))
      setConfirmed(null)
      setError(res.error ?? "That didn't save")
    }
  }

  const q = query.trim().toLowerCase()
  const results = q ? rows.filter((r) => [nameOf(r), r.email].some((v) => v.toLowerCase().includes(q))).slice(0, 25) : []
  const recent = rows
    .filter((r) => r.checkedInAt)
    .sort((a, b) => new Date(b.checkedInAt!).getTime() - new Date(a.checkedInAt!).getTime())
    .slice(0, 8)
  const going = rows.filter((r) => !r.waitlisted && !r.id.startsWith("door-")).length
  const came = rows.filter((r) => r.checkedInAt).length
  const walkIns = rows.filter((r) => r.id.startsWith("door-")).length
  const pct = going ? Math.min(100, Math.round((came / going) * 100)) : 0

  const openWalkIn = () => {
    const [first, ...rest] = query.trim().split(/\s+/)
    setWalkIn({ firstName: first ?? "", lastName: rest.join(" "), email: "" })
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-neutral-950 text-white" role="dialog" aria-modal="true" aria-label={`Check-in: ${event.title}`}>
      <header className="flex items-center justify-between gap-3 border-b border-neutral-800 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Check-in</p>
          <h2 className="truncate text-base font-semibold">{event.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-neutral-700 px-4 text-sm font-semibold text-neutral-200 hover:bg-neutral-800"
        >
          <X className="h-4 w-4" /> Done
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-10 sm:px-6">
          {/* Pinned, and nothing else is: on a phone with the keyboard up there's
              only a few hundred pixels to see matches in. */}
          <div className="sticky top-0 z-10 -mx-4 bg-neutral-950 px-4 pb-3 pt-4 sm:-mx-6 sm:px-6">
            <input
              ref={searchRef}
              autoFocus
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search a name or email…"
              aria-label="Search a name or email"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setWalkIn(null)
              }}
              className="h-14 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 text-lg text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/25"
            />
          </div>

          {/* Who just went through. Loud on purpose, and it clears itself. */}
          {confirmed && (
            <div role="status" className="flex items-center justify-between gap-4 rounded-xl bg-emerald-500 px-4 py-3.5 text-neutral-950">
              <span className="flex min-w-0 items-center gap-3">
                <Check className="h-5 w-5 shrink-0" strokeWidth={3} />
                <span className="truncate text-lg font-bold">{confirmed.name}</span>
              </span>
              {confirmed.id ? (
                <button
                  type="button"
                  onClick={() => {
                    const row = rows.find((r) => r.id === confirmed.id)
                    if (row) void doCheckIn(row, false)
                    setConfirmed(null)
                  }}
                  className="shrink-0 text-sm font-semibold underline underline-offset-4"
                >
                  Undo
                </button>
              ) : (
                <span className="shrink-0 text-sm font-semibold">Added</span>
              )}
            </div>
          )}

          {(!online || queue.length > 0) && (
            <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <span>
                {queue.length > 0
                  ? `${queue.length} waiting to save. They're recorded on this device and will send on their own.`
                  : "Offline. Check-ins are being saved on this device."}
              </span>
              <button type="button" onClick={() => void retry()} className="shrink-0 font-semibold underline underline-offset-4">
                Retry
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
              {error}{" "}
              <button type="button" onClick={() => setError(null)} className="font-semibold underline underline-offset-4">
                Dismiss
              </button>
            </p>
          )}

          {q ? (
            <div className="flex flex-col gap-2">
              {results.map((r) => (
                <DoorRow key={r.id} row={r} name={nameOf(r)} onCheckIn={() => void doCheckIn(r)} onUndo={() => void doCheckIn(r, false)} />
              ))}
              {/* Nobody on the list: at a free community night that's normal, so
                  the door gets a way through it. */}
              {results.length === 0 &&
                (walkIn ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (walkIn.firstName.trim()) void doWalkIn({ firstName: walkIn.firstName.trim(), lastName: walkIn.lastName.trim(), email: walkIn.email.trim() })
                    }}
                    className="flex flex-col gap-3 rounded-xl border border-neutral-700 bg-neutral-900 p-4"
                  >
                    <p className="text-sm text-neutral-400">Added at the door and checked in straight away. No email is sent.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        aria-label="First name"
                        placeholder="First name"
                        required
                        value={walkIn.firstName}
                        onChange={(e) => setWalkIn({ ...walkIn, firstName: e.target.value })}
                        className="h-12 rounded-xl border border-neutral-700 bg-neutral-950 px-3 text-base text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none"
                      />
                      <input
                        aria-label="Last name"
                        placeholder="Last name"
                        value={walkIn.lastName}
                        onChange={(e) => setWalkIn({ ...walkIn, lastName: e.target.value })}
                        className="h-12 rounded-xl border border-neutral-700 bg-neutral-950 px-3 text-base text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none"
                      />
                    </div>
                    <input
                      aria-label="Email (optional)"
                      type="email"
                      inputMode="email"
                      autoCapitalize="off"
                      autoCorrect="off"
                      placeholder="Email (optional)"
                      value={walkIn.email}
                      onChange={(e) => setWalkIn({ ...walkIn, email: e.target.value })}
                      className="h-12 rounded-xl border border-neutral-700 bg-neutral-950 px-3 text-base text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="h-12 flex-1 rounded-xl bg-[#ef426f] text-base font-semibold text-white hover:bg-[#d63760]">
                        Add and check in
                      </button>
                      <button type="button" onClick={() => setWalkIn(null)} className="h-12 rounded-xl px-4 text-sm font-semibold text-neutral-300 hover:bg-neutral-800">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-xl border border-dashed border-neutral-700 px-4 py-6 text-center">
                    <p className="text-neutral-400">No RSVP for &ldquo;{query.trim()}&rdquo;. Check the spelling, or add them at the door.</p>
                    <button type="button" onClick={openWalkIn} className="mt-3 h-12 rounded-xl bg-white px-5 text-base font-semibold text-neutral-900 hover:bg-neutral-200">
                      Add {query.trim()}
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Recent check-ins</h3>
              {recent.length === 0 ? (
                <p className="py-6 text-neutral-400">Nobody&apos;s in yet. Search above to check the first person in.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recent.map((r) => (
                    <DoorRow key={r.id} row={r} name={nameOf(r)} onCheckIn={() => void doCheckIn(r)} onUndo={() => void doCheckIn(r, false)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* The organizer's view of the door, at its foot, out of the way of the search. */}
          <div className="mt-2 flex items-center gap-3 border-t border-neutral-800 pt-5">
            <span className="whitespace-nowrap text-sm text-neutral-300">
              <span className="text-lg font-bold tabular-nums text-white">{came}</span> in · of {going} going
              {walkIns > 0 ? ` · ${walkIns} walk-in${walkIns === 1 ? "" : "s"}` : ""}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-800" aria-hidden>
              <div className="h-full rounded-full bg-[#ef426f] transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DoorRow({ row, name, onCheckIn, onUndo }: { row: RsvpRow; name: string; onCheckIn: () => void; onUndo: () => void }) {
  const inNow = !!row.checkedInAt
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold">{name || row.email}</span>
          {row.waitlisted && <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-300">Waitlist</span>}
          {row.id.startsWith("door-") && <span className="shrink-0 rounded-md bg-neutral-800 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-300">Walk-in</span>}
        </div>
        <div className="truncate text-sm text-neutral-400">
          {row.email || "No email"}
          {inNow && row.checkedInAt ? ` · in at ${new Date(row.checkedInAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
        </div>
      </div>
      {inNow ? (
        <button type="button" onClick={onUndo} className="h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-800">
          Undo
        </button>
      ) : (
        <button type="button" onClick={onCheckIn} className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-[#ef426f] px-5 text-base font-semibold text-white hover:bg-[#d63760]">
          <Check className="h-4 w-4" strokeWidth={3} /> Check in
        </button>
      )}
    </div>
  )
}

