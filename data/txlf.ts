/**
 * Texas Linux Fest 2026, the calendar's featured event. It is not a Firestore
 * record, so every surface that lists the week's events has to add it by hand:
 * the calendar (components/events/featured-txlf.tsx), the weekly social graphic
 * (app/api/og/week/social) and the Monday Discord digest (lib/weekly-digest.ts).
 * All three read from here, so they agree.
 *
 * DEVSA is a community partner, not the host.
 */

/**
 * The festival's two days, as `YYYY-MM-DD` keys in San Antonio's timezone,
 * which is what the calendar groups on. Written out rather than derived from a
 * range for that reason.
 */
export const TXLF_DAY_KEYS = ["2026-11-06", "2026-11-07"] as const

export const TXLF = {
  name: "Texas Linux Festival 2026",
  dateLabel: "November 6–7, 2026",
  location: "Austin, TX",
  href: "https://2026.texaslinuxfest.org/",
  since: "community-run since 2010",
  /** Their badge, a roundel with its own white ground. The PNG is for the OG renderer, which reads no WebP. */
  badge: "/txlf/badge.webp",
  badgePng: "/txlf/badge.png",
} as const

/** Sampled from their badge; see featured-txlf.tsx for the contrast reasoning. */
export const TXLF_NAVY = "#002070"
export const TXLF_PAPER = "#f0f0f0"
export const TXLF_ORANGE = "#ff6600"

/**
 * The day Texas Linux Fest is listed on in a given week, or null if the
 * festival is not in it: its first day inside the week, once, the way the
 * calendar pins it. The weekly social graphic and the Monday Discord digest
 * both use this, so the two always count the same events.
 */
export function txlfDayIn(weekKeys: Iterable<string>): string | null {
  const week = new Set(weekKeys)
  return TXLF_DAY_KEYS.find((k) => week.has(k)) ?? null
}
