/**
 * The pure half of lib/event-slug.ts: rules the admin can run in the browser
 * to preview an address and validate a custom one before saving. The server
 * applies the same rules, and also checks the address is free.
 */

/** Pages that live under /events and are not events. A custom address cannot take one. */
export const RESERVED_EVENT_SLUGS = [
  "access-granted",
  "embed",
  "morehumanthanhuman",
  "pysanantonio",
  "the-model",
  "zero-to-agent",
  // Redirected in next.config.ts; taking them would shadow the redirect.
  "confluencia",
  "demo-day",
]

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&+/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60)
    .replace(/-$/, "")
}

/** Why a custom address cannot be used, or null if it is well formed. */
export function invalidCustomSlug(slug: string): string | null {
  if (slug.length < 3 || slug.length > 80) return "An event address needs 3 to 80 characters."
  if (!SLUG_RE.test(slug)) return "Use lowercase letters, numbers and single hyphens, like spooky-hour-oct-29."
  if (RESERVED_EVENT_SLUGS.includes(slug)) return `"${slug}" is one of the site's own pages under /events.`
  return null
}

const CT = "America/Chicago"
export function shortDateParts(date: string) {
  const d = new Date(date)
  const month = d.toLocaleString("en-US", { month: "short", timeZone: CT }).toLowerCase()
  const day = d.toLocaleString("en-US", { day: "numeric", timeZone: CT })
  const year = d.toLocaleString("en-US", { year: "numeric", timeZone: CT })
  return { month, day, year }
}


/** What the default address will look like, before the server checks it is free. */
export function defaultSlugPreview(title: string, date: string): string {
  const base = slugify(title) || "event"
  if (!date) return base
  const { month, day } = shortDateParts(date)
  return `${base}-${month}-${day}`
}
