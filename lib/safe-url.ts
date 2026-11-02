/**
 * A link someone typed, as an http(s) URL.
 *
 * Returns the trimmed URL when it is http or https, null when the value is
 * empty, and undefined for anything else, so a route can tell "cleared" from
 * "refused". A bare domain ("lu.ma/x") gets https://, the same rule description
 * links follow (lib/event-markdown.ts).
 *
 * Anything else includes `javascript:` and `data:`, which would run or render
 * when the link is clicked. React does not reliably block them, so the event
 * page checks again where the link renders.
 */
export function httpUrl(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null
  if (typeof value !== "string") return undefined
  const text = value.trim()
  if (!text) return null
  const withScheme = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(text) ? `https://${text}` : text
  try {
    const url = new URL(withScheme)
    return url.protocol === "http:" || url.protocol === "https:" ? withScheme : undefined
  } catch {
    return undefined
  }
}
