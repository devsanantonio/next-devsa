"use client"

import { useEffect, useState } from "react"
import { Edit, Plus, Trash2 } from "lucide-react"
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
} from "@/components/admin/data-table"
import { SlideDrawer } from "@/components/admin/slide-drawer"
import { GroupPicker } from "@/components/admin/group-picker"
import { isProtectedAdmin } from "@/lib/protected-admins"

/**
 * Manage Admins: everyone with access, how recently they used it, and the
 * drawer that adds or edits one. Admins and super admins only. Moved out of
 * app/admin/page.tsx in 2026-10 with its state and handlers, which nothing
 * else on the page used.
 *
 * Sorted by last sign-in, most recent first, so whoever has drifted away
 * collects at the bottom, where you look before removing access. Sign-ins were
 * first recorded on 2026-10-12, when the portal moved to Firebase sign-in; no
 * record exists before that, so an empty value means "not since then", not
 * "never".
 */

export interface AdminRow {
  id: string
  email: string
  role: string
  communityId?: string
  approvedAt: string
  lastLoginAt?: string | null
  organizerOf?: string[] | null
  firstName?: string
  lastName?: string
}

const sortBySignIn = (list: AdminRow[]) =>
  [...list].sort(
    (a, b) =>
      String(b.lastLoginAt ?? "").localeCompare(String(a.lastLoginAt ?? "")) ||
      String(b.approvedAt ?? "").localeCompare(String(a.approvedAt ?? ""))
  )

const field =
  "w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"

export function AdminsTab({
  admins,
  autoOpen = false,
  onAutoOpened,
  communities,
  myEmail,
  adminFetch,
  onChanged,
  onError,
}: {
  admins: AdminRow[]
  /** Open with the add form showing: the Overview's "Add an organizer". */
  autoOpen?: boolean
  /** Called once the form has opened, so a later visit to the tab doesn't open it again. */
  onAutoOpened?: () => void
  communities: { id: string; name: string }[]
  myEmail: string
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  /** Re-read the dashboard's data after a change. */
  onChanged: () => Promise<void> | void
  onError: (message: string) => void
}) {
  const [open, setOpen] = useState(autoOpen)
  useEffect(() => {
    if (autoOpen) onAutoOpened?.()
  }, [autoOpen, onAutoOpened])
  const [editing, setEditing] = useState<AdminRow | null>(null)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "organizer">("organizer")
  const [communityId, setCommunityId] = useState("")
  const [groups, setGroups] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const nameOf = (id: string) => communities.find((c) => c.id === id)?.name || id

  const close = () => {
    setOpen(false)
    setEditing(null)
    setEmail("")
    setRole("organizer")
    setCommunityId("")
    setGroups([])
  }

  const startEdit = (admin: AdminRow) => {
    setEditing(admin)
    setEmail(admin.email)
    setRole(admin.role === "organizer" ? "organizer" : "admin")
    setCommunityId(admin.communityId || "")
    setGroups(admin.organizerOf ?? [])
    setOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await adminFetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editing ? editing.email : email,
          role,
          communityId: role === "organizer" ? communityId || null : null,
          ...(role === "admin" ? { organizerOf: groups } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        onError(data.error || "Failed to save admin")
        return
      }
      close()
      await onChanged()
    } catch {
      onError("Failed to save admin")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (target: string) => {
    if (!confirm(`Remove admin access for ${target}?`)) return
    try {
      const res = await adminFetch("/api/admin/auth", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        onError(data.error || "Failed to remove admin")
        return
      }
      await onChanged()
    } catch {
      onError("Failed to remove admin")
    }
  }

  return (
    <div>
      <TabHeader
        title="Manage Admins"
        summary={`${admins.filter((a) => a.role !== "organizer").length} admins · ${admins.filter((a) => a.role === "organizer").length} organizers`}
        actions={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d63760]"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </button>
        }
      />

      {admins.length === 0 ? (
        <EmptyState>No approved admins yet.</EmptyState>
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Person</Th>
              <Th>Role</Th>
              <Th>Group</Th>
              <Th>Approved</Th>
              <Th>Last sign-in</Th>
              <Th align="right"><span className="sr-only">Actions</span></Th>
            </tr>
          </thead>
          <tbody>
            {sortBySignIn(admins).map((admin) => (
              <Tr key={admin.id}>
                <Td>
                  <PrimaryCell
                    title={admin.email}
                    sub={isProtectedAdmin(admin.email) ? "Site owner · can't be removed" : admin.email === myEmail ? "You" : undefined}
                  />
                </Td>
                <Td>
                  <Pill tone={admin.role === "superadmin" ? "amber" : admin.role === "admin" ? "violet" : "blue"}>
                    {admin.role === "superadmin" ? "Super admin" : admin.role === "admin" ? "Admin" : "Organizer"}
                  </Pill>
                </Td>
                <Td>
                  {admin.role === "organizer" ? (
                    admin.communityId ? nameOf(admin.communityId) : <span className="text-amber-300">None assigned</span>
                  ) : (
                    <>
                      <span className="text-neutral-400">All</span>
                      {/* An admin's own groups: where their organizer views come from. */}
                      {[admin.communityId, ...(admin.organizerOf ?? [])].filter(Boolean).length > 0 && (
                        <span className="mt-0.5 block text-[13px] text-neutral-300">
                          Runs {[...new Set([admin.communityId, ...(admin.organizerOf ?? [])].filter((id): id is string => !!id))].map(nameOf).join(", ")}
                        </span>
                      )}
                    </>
                  )}
                </Td>
                <Td><DateCell value={admin.approvedAt} /></Td>
                {/* Date and time: "did they sign in today" is the question this column answers. */}
                <Td>
                  {admin.lastLoginAt ? (
                    <DateCell value={admin.lastLoginAt} time />
                  ) : (
                    <span className="text-neutral-400" title="Sign-ins have been recorded since Oct 12, 2026. There's no record from before then.">
                      Not since Oct 12
                    </span>
                  )}
                </Td>
                <Td align="right">
                  {/* Not for the protected super admins, and you can't remove yourself. */}
                  <RowActions>
                    {!isProtectedAdmin(admin.email) && (
                      <RowAction onClick={() => startEdit(admin)} icon={<Edit className="h-4 w-4" />}>
                        Edit
                      </RowAction>
                    )}
                    {admin.email !== myEmail && !isProtectedAdmin(admin.email) && (
                      <RowAction tone="danger" onClick={() => remove(admin.email)} icon={<Trash2 className="h-4 w-4" />}>
                        Remove
                      </RowAction>
                    )}
                  </RowActions>
                </Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>
      )}

      <SlideDrawer open={open} onClose={close} title={editing ? "Edit Admin" : "Add New Admin"}>
        <form onSubmit={save} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-neutral-300">Email Address</label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={!!editing}
              className={`${field} disabled:cursor-not-allowed disabled:opacity-60`}
            />
            {editing && <p className="mt-2 text-xs text-neutral-400">Email cannot be changed</p>}
          </div>
          <div>
            <label htmlFor="admin-role" className="mb-2 block text-sm font-semibold text-neutral-300">Role</label>
            <select
              id="admin-role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as "admin" | "organizer")
                if (e.target.value === "admin") setCommunityId("")
              }}
              className={field}
            >
              <option value="organizer">Organizer (can only manage their community&apos;s events)</option>
              <option value="admin">Admin (full access to all features)</option>
            </select>
          </div>
          {role === "organizer" ? (
            <div>
              <label htmlFor="admin-community" className="mb-2 block text-sm font-semibold text-neutral-300">Assigned Community *</label>
              <select id="admin-community" required value={communityId} onChange={(e) => setCommunityId(e.target.value)} className={field}>
                <option value="">Select a community</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-neutral-400">Organizers can only create and manage events for their assigned community</p>
            </div>
          ) : (
            <fieldset>
              <legend className="mb-1 block text-sm font-semibold text-neutral-300">Groups they run <span className="font-normal text-neutral-400">(optional)</span></legend>
              <p className="mb-2 text-xs text-neutral-400">Each adds an organizer view to their account menu and lists them with that group in the directory.</p>
              <GroupPicker communities={communities} selected={groups} onChange={setGroups} />
            </fieldset>
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={close} className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-50">
              {editing ? "Save Changes" : "Add Admin"}
            </button>
          </div>
        </form>
      </SlideDrawer>
    </div>
  )
}
