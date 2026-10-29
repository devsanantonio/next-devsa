"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RotateCcw } from "lucide-react"
import {
  TabHeader,
  DataTable,
  Th,
  Tr,
  Td,
  PrimaryCell,
  Pill,
  DateCell,
  RowAction,
  RowActions,
  EmptyState,
  ToolbarButton,
  type PillTone,
} from "@/components/admin/data-table"

/**
 * The Activity tab: who created, changed or deleted what across the portal,
 * newest first, with Restore on a logged delete. Admins and super admins only.
 * Reads /api/admin/activity, which lib/activity-log.ts writes.
 */

interface ActivityRow {
  id: string
  at: string | null
  actor: string
  action: "created" | "updated" | "deleted" | "restored" | "sent" | "approved" | "declined" | "removed"
  kind: "event" | "community" | "partner" | "admin" | "rsvp" | "newsletter" | "access"
  targetId: string
  label: string
  changes: Record<string, [string, string]> | null
  detail: string | null
  restorable: boolean
  restoredAt: string | null
  restoredBy: string | null
}

const KIND_LABEL: Record<ActivityRow["kind"], string> = {
  event: "Event",
  community: "Group",
  partner: "Partner",
  admin: "Access",
  rsvp: "RSVP",
  newsletter: "Newsletter",
  access: "Access request",
}

const ACTION_TONE: Record<ActivityRow["action"], PillTone> = {
  created: "green",
  approved: "green",
  restored: "blue",
  updated: "neutral",
  sent: "violet",
  deleted: "red",
  removed: "red",
  declined: "amber",
}

type Filter = "all" | "deletes" | ActivityRow["kind"]

export function ActivityTab({
  adminFetch,
  nameFor,
  onRestored,
}: {
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  /** A person's name for an email, when the directory knows it. */
  nameFor: (email: string) => string | null
  /** Re-read the dashboard's data after a restore, so the thing reappears in its tab. */
  onRestored: () => void
}) {
  const [rows, setRows] = useState<ActivityRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [restoring, setRestoring] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await adminFetch("/api/admin/activity")
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error)
      setRows(data.entries ?? [])
    } catch (err) {
      setError((err as Error).message || "Couldn't load the activity")
      setRows([])
    }
  }, [adminFetch])

  useEffect(() => {
    load()
  }, [load])

  const restore = async (row: ActivityRow) => {
    if (!confirm(`Restore ${KIND_LABEL[row.kind].toLowerCase()} "${row.label}"? It goes back exactly as it was when deleted.`)) return
    setRestoring(row.id)
    setError(null)
    try {
      const res = await adminFetch("/api/admin/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error)
      await load()
      onRestored()
    } catch (err) {
      setError((err as Error).message || "Couldn't restore it")
    } finally {
      setRestoring(null)
    }
  }

  const shown = (rows ?? []).filter((r) =>
    filter === "all" ? true : filter === "deletes" ? r.action === "deleted" || r.action === "removed" : r.kind === filter
  )
  const deletes = (rows ?? []).filter((r) => r.restorable).length

  const filters: [Filter, string][] = [
    ["all", "All"],
    ["deletes", "Deletes"],
    ["event", "Events"],
    ["community", "Groups"],
    ["partner", "Partners"],
    ["admin", "Access"],
    ["rsvp", "RSVPs"],
    ["newsletter", "Newsletter"],
  ]

  return (
    <div>
      <TabHeader
        title="Activity"
        summary={
          rows === null
            ? "Loading…"
            : `${rows.length} recent changes${deletes ? ` · ${deletes} ${deletes === 1 ? "delete" : "deletes"} can be restored` : ""}`
        }
        actions={<ToolbarButton onClick={load} icon={<RotateCcw className="h-4 w-4" />}>Refresh</ToolbarButton>}
      />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter activity">
        {filters.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === key ? "bg-neutral-700 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {rows === null ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : shown.length === 0 ? (
        <EmptyState>
          {rows.length === 0 ? "Nothing logged yet. Changes made from now on appear here." : "Nothing matches that filter."}
        </EmptyState>
      ) : (
        <DataTable minWidth="min-w-[52rem]">
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>What</Th>
              <Th>Details</Th>
              <Th align="right"><span className="sr-only">Actions</span></Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <Tr key={r.id}>
                <Td><DateCell value={r.at} time /></Td>
                <Td>
                  <PrimaryCell title={nameFor(r.actor) ?? r.actor.split("@")[0]} sub={r.actor} />
                </Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={ACTION_TONE[r.action]}>{r.action}</Pill>
                    <span className="text-xs uppercase tracking-wider text-neutral-400">{KIND_LABEL[r.kind]}</span>
                  </div>
                  <p className="mt-1 font-medium text-white">{r.label}</p>
                </Td>
                <Td className="max-w-md">
                  {r.changes && Object.keys(r.changes).length > 0 ? (
                    <ul className="space-y-1 text-[13px]">
                      {Object.entries(r.changes).slice(0, 6).map(([field, [before, after]]) => (
                        <li key={field} className="text-neutral-300">
                          <span className="text-neutral-400">{field}:</span>{" "}
                          <span className="text-neutral-400 line-through">{before}</span> → {after}
                        </li>
                      ))}
                      {Object.keys(r.changes).length > 6 && (
                        <li className="text-neutral-400">and {Object.keys(r.changes).length - 6} more</li>
                      )}
                    </ul>
                  ) : r.detail ? (
                    <span className="text-[13px] text-neutral-300">{r.detail}</span>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                  {r.restoredAt && (
                    <p className="mt-1 text-[13px] text-sky-300">
                      Restored {new Date(r.restoredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {r.restoredBy ? ` by ${nameFor(r.restoredBy) ?? r.restoredBy}` : ""}
                    </p>
                  )}
                </Td>
                <Td align="right">
                  {r.restorable && (
                    <RowActions>
                      <RowAction
                        onClick={() => restore(r)}
                        disabled={restoring === r.id}
                        icon={restoring === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                      >
                        Restore
                      </RowAction>
                    </RowActions>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </div>
  )
}
