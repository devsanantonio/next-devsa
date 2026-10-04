/**
 * The Model — DEVSA's creative-and-code afternoon.
 *
 * Ported from the sasw-geekdom/next-sasw repo, which carried the brand while
 * the activation ran inside Startup + Tech Week. It is an official DEVSA event
 * now, so the facts live here rather than being read across repo boundaries.
 *
 * It does not replace More Human Than Human, which an earlier version of this
 * note said it did. The two run as DEVSA's pair of AI conferences, pointed at
 * different industries, verticals and workflows — this one at the creative
 * side, More Human at engineering, security and the people leading the change.
 *
 * Only what this site needs. next-sasw's file also drives a hero graph, a
 * code-selection animation and a tool/model comparison table — all of which
 * belong to the week's own page and none of which this one renders.
 */

/** The event's own facts. One copy, so the page and the OG card agree. */
export const THE_MODEL = {
  name: "The Model",
  /** Doors 1:00 PM — September 28 is CDT, so the offset is -05:00. */
  start: "2026-09-28T13:00:00-05:00",
  end: "2026-09-28T18:00:00-05:00",
  dateLabel: "Monday, September 28, 2026",
  timeLabel: "1:00 – 6:00 PM",
  venue: "Geekdom",
  venueDetail: "3rd Floor",

  /**
   * The hook, in two halves, and the halves are the specification.
   *
   * The setup names the three rooms; the turn names the occasion. Neither uses
   * the second person and neither promises an outcome — an event cannot turn
   * anyone's ideas into anything, and the versions that tried read like a
   * product page rather than an invitation.
   *
   * The setup's three nouns run in the same order as the three logos in the
   * Powered by row beneath them — creatives, founders, builders against
   * Creative Futures, Tech Bloc, DEVSA. Nothing labels that mapping and
   * nothing needs to, but reorder MODEL_ORGANIZERS and the line quietly stops
   * working.
   */
  tagline: {
    setup: "Creatives, founders and builders in the same room.",
    turn: "An afternoon of showing each other what comes next.",
  },
} as const

/**
 * The selection lavender, sampled from the artwork rather than chosen beside
 * it — it is the single most common ink in the hero image.
 *
 * Also in lib/event-brands.ts as this brand's accent, because the calendar
 * cards need it without importing an event's whole data file. Two constants,
 * one value: if it ever changes, both move.
 */
export const MODEL_LAVENDER = "#C0B4FC"

/** Type set on the lavender, knocked out. */
export const MODEL_INK = "#09090B"


export interface ModelOrganizer {
  name: string
  /** A page on this site where the org has one, otherwise their own. */
  href: string
  /** Local copy of the mark. See the note on MODEL_ORGANIZERS. */
  logo: string
  /** Tuned per mark so three different lockups sit on one optical baseline. */
  heightClass: string
}

/**
 * Who puts it on, in the order the tagline's nouns run.
 *
 * Marks, not names. The first version here rendered three text links on the
 * reasoning that two of the three had no logo checked in — which was simply
 * wrong: both are live partner records with artwork, and Access Granted's
 * hero has been rendering all six of its organizers as marks the whole time.
 * A row of real lockups is what says "coalition"; a row of names says
 * "footnote".
 *
 * Copied local rather than hotlinked from the Blob store, matching
 * public/access-granted/orgs/. Neither needs inverting on this near-black
 * ground: Creative Futures is light artwork and Tech Bloc is red and white,
 * and color reads on either ground — see lib/logo-invert.ts for why that
 * distinction is the one that matters.
 *
 * Linked to the partner pages on this site rather than out to their own. The
 * whole argument of /buildingtogether is that these orgs are findable here.
 */
export const MODEL_ORGANIZERS: readonly ModelOrganizer[] = [
  {
    name: "The Creative Futures",
    href: "/buildingtogether/the-creative-futures",
    logo: "/the-model/orgs/creative-futures.webp",
    heightClass: "h-7 sm:h-8",
  },
  {
    name: "Tech Bloc",
    href: "/buildingtogether/tech-bloc",
    logo: "/the-model/orgs/tech-bloc.svg",
    heightClass: "h-10 sm:h-12",
  },
  {
    name: "DEVSA",
    href: "/buildingtogether",
    logo: "/the-model/orgs/devsa.png",
    heightClass: "h-9 sm:h-10",
  },
] as const
