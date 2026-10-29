"use client"

/**
 * "Groups they run": the groups an admin or super admin also organizes
 * (`organizerOf`). Each adds an organizer view to their account menu and lists
 * them under that group in the directory. Used on your own profile and, for
 * other admins, in Manage Admins.
 *
 * `assigned` is a group already on the record as `communityId`; it shows ticked
 * and fixed, because it isn't part of this list.
 */
export function GroupPicker({
  communities,
  selected,
  onChange,
  assigned,
}: {
  communities: { id: string; name: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  assigned?: string | null
}) {
  const on = (id: string) => id === assigned || selected.includes(id)
  return (
    <div className="max-h-56 overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-800/50 p-2">
      {[...communities]
        .sort((a, b) => Number(!on(a.id)) - Number(!on(b.id)) || a.name.localeCompare(b.name))
        .map((c) => (
          <label key={c.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700/40">
            <input
              type="checkbox"
              checked={on(c.id)}
              disabled={c.id === assigned}
              onChange={(e) => onChange(e.target.checked ? [...selected, c.id] : selected.filter((id) => id !== c.id))}
              className="h-4 w-4 accent-[#ef426f]"
            />
            <span className="min-w-0 flex-1 truncate">{c.name}</span>
            {c.id === assigned && <span className="text-xs text-neutral-400">Assigned</span>}
          </label>
        ))}
    </div>
  )
}
