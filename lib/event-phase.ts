/**
 * Has this edition happened yet?
 *
 * Added because three event pages were frozen in the tense they were written
 * in. PySanAntonio's h1 still read "returns October 2026" two days after it
 * ran, and both it and Access Granted still offered "Speaker lineup coming
 * soon" directly above the full lineup they now render.
 *
 * Note what the cause was not. Every conference data file already carries ISO
 * `start` and `end` instants beside its display label — the facts were there
 * the whole time. The pages simply never asked, because `dateLabel` is the
 * field a hero reaches for and a label cannot be compared to anything. So the
 * copy could only ever state the moment somebody last edited it.
 *
 * The repo already solves exactly this for calls for speakers: CFS_CLOSES is
 * an ISO instant and `getCfsPhase()` flips the section with no deploy. This is
 * that pattern applied to the event itself, in one place rather than a third
 * and fourth copy of the same two-line comparison.
 *
 * Keyed on the END of the day, not the start. An activation running 1–6 PM is
 * still "today" at 3 PM, and a page that slips into the past tense while the
 * room is still full is worse than one that is a few hours late.
 */
export type EventPhase = "upcoming" | "past"

/**
 * @param endsAt ISO instant the event finishes. Write it with an explicit
 *   offset — San Antonio is -05:00 in CDT and -06:00 in CST, and a bare
 *   local-looking string is parsed in the server's zone, which is UTC on
 *   Vercel. That is the bug that already cost this repo a Discord digest
 *   posting the wrong week.
 */
export function getEventPhase(endsAt: string, now: Date = new Date()): EventPhase {
  return now.getTime() <= new Date(endsAt).getTime() ? "upcoming" : "past"
}

/** Convenience for the common `phase === "past"` read. */
export function hasHappened(endsAt: string, now: Date = new Date()): boolean {
  return getEventPhase(endsAt, now) === "past"
}
