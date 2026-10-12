/**
 * The super admin accounts no one can remove or demote — not another admin,
 * and not each other — from the dashboard or the API.
 *
 * Two, both Jesse's: jesse@devsanantonio.com, the original, and
 * jesseovr@gmail.com, added 2026-10-12. The second exists because the first is
 * a Porkbun forwarding address, and Firebase's emailed sign-in links did not
 * arrive through it; the Gmail account signs in with Google. Without both
 * protected, an admin could lock the founder out of the portal.
 *
 * Shared by the server (app/api/admin/auth, which enforces it) and the admin
 * page (which hides the remove and demote controls). Kept free of server-only
 * imports so the client can read it. Changing who is on this list is a code
 * change on purpose.
 */
export const PROTECTED_ADMIN_EMAILS = [
  "jesse@devsanantonio.com",
  "jesseovr@gmail.com",
] as const

export function isProtectedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return (PROTECTED_ADMIN_EMAILS as readonly string[]).includes(email.trim().toLowerCase())
}
