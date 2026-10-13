/**
 * The paths and options behind /get-involved, shared by the form, the API
 * that validates it, the admin inbox and the Building Together tiles that link
 * into it — so a way added here appears everywhere at once and the API never
 * accepts a value the form cannot send.
 *
 * Deliberately narrow. Confluencia inquiries, organizer access, and speaker
 * and volunteer calls each already have their own form and inbox. Sponsoring
 * goes to the donation form (/buildingtogether#donate) rather than a third
 * path here — money has one door.
 */

export type GetInvolvedPath = "partner" | "general"

export const GET_INVOLVED_PATHS: { key: GetInvolvedPath; label: string; blurb: string }[] = [
  { key: "partner", label: "Partner", blurb: "Work with the community" },
  { key: "general", label: "General", blurb: "Ask us anything" },
]

/** The five ways on /buildingtogether, plus a way out. Keys are stable; labels can change. */
export const PARTNER_WAYS: { key: string; label: string }[] = [
  { key: "calendar", label: "List your events on the calendar" },
  { key: "host", label: "Host with a community group" },
  { key: "program", label: "Run a program across the groups" },
  { key: "popup", label: "Co-design a pop-up" },
  { key: "embed", label: "Embed the calendar on your site" },
  { key: "other", label: "Something else" },
]

export const GET_INVOLVED_PATH_KEYS = GET_INVOLVED_PATHS.map((p) => p.key) as string[]
export const PARTNER_WAY_KEYS = PARTNER_WAYS.map((w) => w.key)

export function getInvolvedPathLabel(key: string): string {
  return GET_INVOLVED_PATHS.find((p) => p.key === key)?.label ?? key
}

export function partnerWayLabel(key: string | null | undefined): string | null {
  if (!key) return null
  return PARTNER_WAYS.find((w) => w.key === key)?.label ?? key
}

/**
 * The link anywhere on the site uses to open the form with a path and way
 * chosen. The form lives in the Get Involved section of /buildingtogether;
 * /get-involved redirects there with the same query.
 */
export function getInvolvedHref(path: GetInvolvedPath = "partner", way?: string): string {
  return `/buildingtogether?path=${path}${way ? `&way=${way}` : ""}#get-involved`
}
