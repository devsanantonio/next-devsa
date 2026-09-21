"use client"

import { Analytics } from "@vercel/analytics/next"

/**
 * Vercel Web Analytics, with the staff-only routes filtered out.
 *
 * `/admin` was 35 visitors in the month to 20 September — about 3% of the
 * site's traffic, and every one of them a DEVSA organiser looking at the
 * dashboard. Counted, it inflates the public figures and ranks the admin above
 * the shop in the top-pages report, which makes that report harder to read for
 * the one question it is actually asked: what are people coming here for.
 *
 * A wrapper component rather than a prop on the tag in app/layout.tsx, because
 * `beforeSend` is a function and the layout is a server component — functions
 * cannot cross that boundary.
 *
 * Returning null drops the event before it is sent. Staff are not anonymous to
 * Vercel either way; they just stop being in the numbers.
 */
const PRIVATE_PREFIXES = ["/admin", "/signin"]

/**
 * The event `url` is normally absolute, but a base keeps this from throwing if
 * a relative one ever arrives — an exception here would take the pageview with
 * it. Compared as a path so `/administrator` would not match `/admin`.
 */
function pathOf(url: string): string {
  try {
    return new URL(url, "https://www.devsa.community").pathname
  } catch {
    return url
  }
}

export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        const path = pathOf(event.url)
        const isPrivate = PRIVATE_PREFIXES.some(
          (prefix) => path === prefix || path.startsWith(`${prefix}/`)
        )
        return isPrivate ? null : event
      }}
    />
  )
}
