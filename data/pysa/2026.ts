/**
 * PySanAntonio II — Friday, October 2, 2026 at Geekdom (3rd floor), part of
 * San Antonio Startup + Tech Week (Sept 28 – Oct 2).
 *
 * Single source of truth for the event's dates, palette, logo lockup and the
 * call-for-speakers option lists. The page, the speaker form, the JSON-LD in
 * the route layout and the OG card all read from here so a date only ever
 * changes in one place.
 */

/** Firestore/admin key. The admin Speakers tab groups submissions by this. */
export const PYSA_EVENT_ID = "pysanantonio-2026"

/**
 * The community that owns this conference. Organizers belonging to it see the
 * PySanAntonio speaker submissions in the admin portal — and only those; every
 * other event's submissions stay admin-only.
 *
 * Matched on the community's name rather than its document id because community
 * docs are keyed by generated slugs that would be guesswork to hardcode here.
 * If the community is ever renamed in the admin, this string has to follow.
 * See app/api/admin/data/route.ts.
 */
export const PYSA_HOST_COMMUNITY = "Alamo Python"

export const PYSA_2026 = {
  name: "PySanAntonio II",
  /** Doors 1:00 PM — October 2 is CDT, so the offset is -05:00, not -06:00. */
  start: "2026-10-02T13:00:00-05:00",
  end: "2026-10-02T18:00:00-05:00",
  dateLabel: "Friday, October 2, 2026",
  timeLabel: "1:00 – 6:00 PM",
  venue: "Geekdom",
  venueDetail: "3rd Floor",
  address: {
    street: "131 Soledad St",
    city: "San Antonio",
    region: "TX",
    postalCode: "78205",
    country: "US",
  },
  /** The containing week — PySanAntonio is one day inside it. */
  superEvent: {
    name: "San Antonio Startup + Tech Week 2026",
    start: "2026-09-28",
    end: "2026-10-02",
    label: "Sept 28 – Oct 2, 2026",
  },
} as const

/**
 * Call for speakers closes end of day Aug 22, 2026. Everything that switches
 * the page between "submit a talk" and "call closed" derives from this — the
 * status pill, the countdown, the form, and the hero's primary CTA.
 *
 * Extended by a week from Aug 15, the original close. The prose copies that
 * name the date are not derived from this constant — see CFS_CLOSES_LABEL for
 * why, and grep for that label before moving this again.
 */
export const CFS_CLOSES = "2026-08-22T23:59:59-05:00"

/**
 * The same date, written out for display, on the pattern
 * data/access-granted/2026.ts already uses.
 *
 * Kept beside the ISO value rather than formatted from it at render time: the
 * ISO string is timestamped -05:00, so a naive toLocaleDateString on a server
 * in UTC renders the day after. Two constants that must be edited together are
 * a smaller trap than a date that is silently wrong by one.
 *
 * Not every surface reads it. The marketing prose in data/events.ts and the
 * layout's meta description are static strings that also name the date, and
 * the thank-you email builds its own sentence around it — those are copy, not
 * UI state, and inlining a constant into each would not make them any harder
 * to forget. This is the list to walk:
 *
 *   app/events/pysanantonio/layout.tsx · components/pysa/2026/hero.tsx
 *   components/pysa/2026/speaker-form.tsx · data/events.ts
 *   lib/emails/pysa-thank-you.ts
 *
 * (data/stay-connected.ts was on this list until the BSides booth page it
 * belonged to was removed.)
 */
export const CFS_CLOSES_LABEL = "August 22, 2026"

export type CfsPhase = "open" | "closed"

export function getCfsPhase(now: Date = new Date()): CfsPhase {
  return now.getTime() <= new Date(CFS_CLOSES).getTime() ? "open" : "closed"
}

/**
 * Whole days remaining until the call closes; 0 on the final day and after.
 * Floored, not rounded up, so the count never overstates how long is left.
 */
export function daysUntilClose(now: Date = new Date()): number {
  const ms = new Date(CFS_CLOSES).getTime() - now.getTime()
  return ms <= 0 ? 0 : Math.floor(ms / 86_400_000)
}

/**
 * Palette, sampled from the PyTexas Foundation mark used across the partners
 * and Building Together surfaces — the only co-brand logo that keeps its
 * color here, so its blue and yellow lead the page. DEVSA supplies the
 * near-black substrate and Geist type.
 *
 * The logo's blue is a gradient from #124582 to #3875ad, which lands at
 * 2.1–3.5:1 on `ink` — too dark to read as text. `blue` is that hue
 * lightened to clear AA (5.9:1); `blueDeep` keeps the logo's own value for
 * fills and light surfaces. `yellow` is straight off the mark (14.7:1 on
 * ink) but only 1.4:1 on white, so it stays a dark-surface accent.
 */
export const PYSA_COLORS = {
  ink: "#0a0a0a",
  blue: "#4a90d9",
  blueDeep: "#124582",
  yellow: "#ffdd00",
} as const

/**
 * The PySanAntonio wordmark, set in Amador (blackletter). Amador is licensed
 * through Adobe Fonts and cannot be self-hosted, so the lockup ships as art
 * rather than live text — these SVGs were traced from pysa/pysa-text.png with
 * potrace, so they stay crisp at any size instead of softening like the PNG.
 *
 * `svg` carries the brand colors (#0059b7 / #edca00). `svgDark` lifts the blue
 * to the page's UI blue — the brand blue is only 2.9:1 on #0a0a0a, so on the
 * dark hero the "py" would sink into the background.
 *
 * The PNGs are tight crops of the same artwork for Open Graph and email —
 * satori and most email clients will not render an SVG, and the original on S3
 * is a 1080x1080 canvas that is mostly transparent margin.
 */
export const PYSA_WORDMARK = {
  svg: "/pysa/wordmark.svg",
  svgDark: "/pysa/wordmark-dark.svg",
  png: "/pysa/wordmark.png",
  pngDark: "/pysa/wordmark-dark.png",
  /** Intrinsic ratio of the traced artwork, for reserving layout space. */
  width: 4066,
  height: 958,
} as const

export const PYSA_ASSETS = {
  /** Mascot composited on near-black — matches the hero surface directly. */
  mascotDark:
    "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa2-bgdark.jpg",
  /** Transparent cut-out, for light surfaces and the OG card. */
  mascotCutout: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa2.PNG",
  /**
   * The same cut-out, cropped to the figure and downscaled for the mobile
   * sticker treatment. The S3 original is a 2550x3300 canvas that is ~22%
   * transparent padding on each side, which makes edge placement guesswork —
   * and at 4.3 MB it is far more than a 200px sticker needs.
   */
  mascotSticker: "/pysa/mascot-sticker.webp",
  mascotStickerWidth: 700,
  mascotStickerHeight: 1503,
  /**
   * Hat, mask and shoulders only. The full figure is 0.47:1 — as a small
   * sticker it is either unreadably detailed or absurdly tall (a 208px-wide
   * one stands 446px high and swallows half a phone hero). The bust crops to
   * 1.17:1, so it stays compact and the mask still reads.
   */
  mascotBust: "/pysa/mascot-bust.webp",
  mascotBustWidth: 600,
  mascotBustHeight: 515,
  /**
   * The mascot clip, pre-trimmed to the stretch where he is actually on stage.
   *
   * The S3 original (`pysa/pysa2.mp4`) is the untrimmed 9.75s take at 5.8 Mbps
   * — 6.8 MB for a decorative loop, and 2.65s of that is an empty frame before
   * he walks in and after he walks out. This is the same footage cut to the
   * 1.3–8.4s window and re-encoded at a bitrate suited to flat animation:
   * 900 KB, VMAF 92 against the original. It also faststarts, so playback
   * begins before the whole file lands.
   *
   * Because the trim is baked in, the element loops natively — see the hero,
   * which used to seek back on every `timeupdate` to fake this window.
   */
  mascotVideo: "/pysa/mascot-clip.mp4",
  /**
   * Poster frame lifted from the original take at 5.70s — 4.40s into the
   * trimmed `mascotVideo` above — the beat where the mascot
   * holds up two fingers, which is the whole point for a second edition. Also
   * what anyone sees if the video is blocked, still downloading, or the visitor
   * has asked for reduced motion.
   */
  mascotVideoPoster: "/pysa/mascot-video-poster.webp",
  /**
   * The same poster frame as a PNG, with its edges feathered to transparent.
   *
   * Two reasons it cannot just be the .webp above. Satori decodes PNG, JPEG
   * and SVG but NOT WebP — a WebP fails the whole render with "u2 is not
   * iterable" — and the frame is a hard-edged rectangle whose near-black
   * ground is close to, but not exactly, the card's #0a0a0a, so dropped in
   * unmodified it reads as a slightly-wrong grey box. The alpha ramp (10% of
   * each edge) dissolves it into whatever it is placed on.
   *
   * Generated from the .webp, so reshooting the poster means regenerating
   * this too.
   */
  mascotOgPoster: "/pysa/mascot-og-poster.png",
  mascotOgPosterWidth: 1114,
  mascotOgPosterHeight: 720,
  /**
   * Standing cut-out as a transparent PNG, for the corner of the Open Graph
   * card. A PNG rather than the .webp sticker for the same satori reason.
   */
  mascotOgFigure: "/pysa/mascot-og-figure.png",
  /**
   * 2025 livestream, deep-linked past the pre-roll. Currently unreferenced —
   * the archive card links to /events/pysanantonio/2025 instead, and that page
   * embeds the stream itself. Kept as the canonical URL for the recording.
   */
  livestream2025: "https://www.youtube.com/embed/3jZ9ktAFGpk?start=1782",
} as const

export type CoBrand = {
  name: string
  logo: string
  href: string
  /** Intrinsic pixel size, so next/image can reserve the right box. */
  width: number
  height: number
  /** Rendered height class — logos are visually balanced, not uniform. */
  heightClass: string
  /** `mono` — reads light-on-transparent. `color` — keeps its own palette. */
  treatment: "mono" | "color"
}

/**
 * The three organizations activating the event, plus the week that contains
 * it. Only PyTexas keeps its color; everything else is mono so the blue and
 * yellow in that one mark read as the page's accent rather than noise.
 */
export const PYSA_ORGANIZERS: CoBrand[] = [
  {
    name: "Alamo Python",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/flyers-46-alamo-py-white.png",
    href: "https://www.meetup.com/alamo-python/",
    width: 500,
    height: 500,
    heightClass: "h-12 sm:h-14",
    treatment: "mono",
  },
  {
    // The same PyTexas mark the partners grid and Building Together pages
    // use — a clean blue/yellow Texas on transparent, not the flyer card.
    name: "PyTexas Foundation",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/pytexas.png",
    href: "https://www.pytexas.org/",
    width: 300,
    height: 300,
    heightClass: "h-12 sm:h-14",
    treatment: "color",
  },
  {
    // The primary DEVSA logo. Its card body is black, but the teal/pink/
    // orange bars and the off-white mark carry it on a dark surface.
    name: "DEVSA",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg",
    href: "https://www.devsa.community/",
    width: 736,
    height: 552,
    heightClass: "h-10 sm:h-12",
    treatment: "mono",
  },
]

/** The official SA Startup + Tech Week site. */
export const SASTW_URL = "https://www.sasw.co/"

/**
 * Recolored from the supplied horizontal lockup: the source SVG ships two
 * full-bleed white background rects that would show as a white box on a dark
 * surface, so the local copies drop them. See public/sastw/.
 */
export const SASTW_LOGO = {
  white: "/sastw/horizontal-white.svg",
  magenta: "/sastw/horizontal-magenta.svg",
} as const

// --- Call for speakers option lists -----------------------------------------
// Carried over from the 2025 Google Form so returning speakers see the same
// questions. "Slides one week before?" was dropped — that belongs in the
// acceptance email, not as a barrier at submission.

export const SESSION_FORMATS = [
  { value: "40-minute talk", label: "40-minute talk" },
  { value: "20-minute talk", label: "20-minute talk" },
  { value: "5-minute lightning talk", label: "5-minute lightning talk" },
] as const

export const AUDIENCE_LEVELS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
] as const

/**
 * Lets a submission that doesn't fit the conference get routed to Alamo
 * Python's regular meetups instead of simply being turned down.
 */
export const CONSIDER_FOR = [
  {
    value: "conference",
    label: "PySanAntonio II",
    hint: "The half-day conference on Oct 2 at Geekdom.",
  },
  {
    value: "meetup",
    label: "Alamo Python tech talks",
    hint: "The bimonthly meetup, if the conference lineup fills up.",
  },
  {
    value: "either",
    label: "Either one",
    hint: "Happy to speak at whichever has room.",
  },
] as const
