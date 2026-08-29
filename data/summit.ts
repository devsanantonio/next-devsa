/**
 * San Antonio Tech Summit — content for the `/summit` TV backdrop.
 *
 * Everything the page says lives here so the run-of-show can be edited during
 * the event without touching layout code. The page reads it on the client and
 * re-evaluates every second, so a change is live on the next deploy with no
 * other state to clear.
 *
 * This is a one-off for a single day. Keep it self-contained — `/summit`,
 * this file, and one entry in components/layout-chrome.tsx are the whole
 * footprint, so it can be deleted in one pass afterwards.
 */

export interface SummitSegment {
  /** ISO with an explicit offset — see the note on `start` below. */
  start: string
  end: string
  label: string
  /** Optional speaker/host line, shown smaller under the label. */
  detail?: string
}

export interface SummitSponsor {
  name: string
  /**
   * Path under /public, e.g. "/summit/team1.svg". When absent the name is set
   * as a wordmark instead, which is a placeholder rather than a design choice
   * — a real logo file always looks better on a 55" screen.
   */
  logo?: string
  /** Render the logo larger; wordmark logos need more width than marks. */
  wide?: boolean
}

/**
 * Timestamps carry an explicit -05:00 (CDT on this date) rather than relying
 * on the viewer's clock being set to Central. A TV at the venue almost
 * certainly is, but a laptop driving it over HDMI from another timezone is
 * exactly the kind of thing that goes wrong an hour before doors — this way
 * the countdown is correct regardless of what machine renders it.
 */
export const SUMMIT = {
  eyebrow: "San Antonio",
  title: "Tech Summit",
  presenter: "Presented by Gentry Media",

  dateLabel: "29 Aug, 2026",
  timeLabel: "10:30 AM – 1 PM",
  venueLine: "Geekdom, 110 E. Houston St, San Antonio, Texas",

  timeZone: "America/Chicago",
  start: "2026-08-29T10:30:00-05:00",
  end: "2026-08-29T13:00:00-05:00",

  /**
   * Run of show. Leave empty and the NOW/NEXT strip simply does not render —
   * the page still works as a static-looking backdrop with a live clock.
   * Fill it in and the strip highlights whatever is happening at that moment,
   * which is the thing that makes this worth being a web page instead of a
   * JPEG on a USB stick.
   *
   * Example:
   *   { start: "2026-08-29T10:30:00-05:00", end: "2026-08-29T10:45:00-05:00",
   *     label: "Doors & coffee" },
   */
  segments: [] as SummitSegment[],

  sponsors: [
    { name: "SA" },
    { name: "team1" },
    { name: "aitx" },
    { name: "Stand With Crypto", wide: true },
  ] as SummitSponsor[],
} as const
