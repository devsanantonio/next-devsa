/**
 * The two roles in approved_admins.
 *
 * `admin` has full access; `organizer` is scoped to one group. There used to be
 * a third, `superadmin`, that the server never treated differently from admin.
 * What it was for, keeping the site's creator from being demoted or removed, is
 * done by email in lib/protected-admins.ts, so the role was retired on
 * 2026-11-01 and the records that carried it became `admin`. isAdminRole still
 * reads it as admin, so a record that somehow kept it loses nothing.
 *
 * Checks are written as "is this an admin", never "is this an organizer": a
 * role that is neither (a typo, a bad write) gets organizer scope, not full
 * access.
 *
 * Pure: imported by the API routes and the admin page alike.
 */
export const ADMIN_ROLES = ["admin", "organizer"] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export function isAdminRole(role: unknown): boolean {
  return role === "admin" || role === "superadmin"
}
