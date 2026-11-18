/**
 * The decks DEVSA presents at its events, listed on /slides.
 *
 * Each deck is a self-contained HTML file in public/slides/<slug>/ (index.html
 * plus whatever it loads, by relative path), served at /slides/<slug> by
 * app/slides/[slug]/route.ts. A deck owns its whole page: it gets no navbar or
 * footer, and it still runs when opened straight from disk, which is how you
 * present without the venue's wifi.
 *
 * To add one (the full steps are in .claude/skills/slides/SKILL.md):
 *   1. put the deck in public/slides/<slug>/, with index.html at its root
 *   2. add cover.jpg beside it: its title slide at 1280x720
 *   3. add an entry below; the newest date sorts first
 *
 * Slugs are lowercase words and dashes. A slug, once shared, is a link
 * someone has: don't rename one.
 */
export interface Deck {
  slug: string
  title: string
  /** One line: what the night was. */
  summary: string
  /** The event's date, YYYY-MM-DD. */
  date: string
  where: string
  slides: number
  /** The event's page, if it has one. */
  eventUrl?: string
  /** Keys worth knowing beyond arrows and F, shown on the card. */
  keys?: string
  /**
   * Served at /slides/<slug> but left off the /slides list: a page made for one
   * screen, not a deck to present (no cover needed). The DEVSA TV desk loops are
   * these, so the TVSA crew can open a URL on the studio desk's TV instead of
   * carrying files.
   */
  unlisted?: boolean
}

export const DECKS: Deck[] = [
  {
    slug: "desk-ep1",
    title: "DEVSA TV desk · Episode 1",
    summary: "The TVSA studio desk monitor for the Holiday edition: the opener's tree of pixel windows, the DEVSA window on top, with pixel snow. Open full screen and leave it.",
    date: "2026-11-18",
    where: "TVSA studios",
    slides: 1,
    unlisted: true,
  },
  {
    slug: "desk-ep2",
    title: "DEVSA TV desk · Episode 2",
    summary: "The TVSA studio desk monitor for the New Year edition: the alt logo with pixel fireworks. Open full screen and leave it.",
    date: "2027-01-01",
    where: "TVSA studios",
    slides: 1,
    unlisted: true,
  },
  {
    slug: "devsa-tv-ep2-jan2027",
    title: "DEVSA TV · Episode 2",
    summary:
      "DEVSA's January episode: DEVSA in its own words, DreamWeek San Antonio's 15th and DreamTech, where DEVSA is a community partner, and a featured talk.",
    date: "2027-01-01",
    where: "TVSA studios",
    slides: 12,
    eventUrl: "/tv",
  },
  {
    slug: "devsa-tv-ep1-nov18",
    title: "DEVSA TV · Episode 1",
    summary:
      "DEVSA's first time on TV: DEVSA in its own words, its four conferences, ACM UTSA's RowdyHacks and RowdyCyberCon, Patrick Robinson on what a software factory is, and December on the calendar.",
    date: "2026-11-18",
    where: "TVSA studios",
    slides: 18,
    eventUrl: "/tv",
  },
  {
    slug: "community-roundtable-nov12",
    title: "Community Roundtable",
    summary: "DEVSA updates, Geekdom Club, then every group in one room, one logo at a time.",
    date: "2026-11-12",
    where: "Geekdom",
    slides: 17,
    eventUrl: "/events/community-roundtable-mvbhtcsj",
    keys: "G picks the next group",
  },
]

export function sortedDecks(): Deck[] {
  return DECKS.filter((d) => !d.unlisted).sort((a, b) => b.date.localeCompare(a.date))
}
