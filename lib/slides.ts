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
}

export const DECKS: Deck[] = [
  {
    slug: "community-roundtable-nov12",
    title: "Community Roundtable",
    summary: "DEVSA updates, Geekdom Club, then every group in one room, one logo at a time.",
    date: "2026-11-12",
    where: "Geekdom",
    slides: 15,
    eventUrl: "/events/community-roundtable-mvbhtcsj",
    keys: "G picks the next group",
  },
]

export function sortedDecks(): Deck[] {
  return [...DECKS].sort((a, b) => b.date.localeCompare(a.date))
}
