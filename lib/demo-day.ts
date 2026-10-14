/**
 * What is left of Confluencia on this site: the labels the admin inbox needs
 * to show the inquiries already received.
 *
 * Confluencia (first called Demo Day) left devsa.community on 2026-10-13. 434
 * MEDIA activates it, with DEVSA as a partner. The page, its inquiry form and
 * API, the homepage band, the About campaign section, the wordmark and the
 * papel picado went with it; /events/confluencia redirects to /events. The
 * demo_day_inquiries collection and its admin tab stay so those leads can be
 * followed up or handed over. When the inbox is empty, this file and the tab
 * can go too.
 */

/** The ways an inquirer could offer to back it, as stored in `interest`. */
export const DEMO_DAY_INTERESTS = [
  { value: "lead", label: "Lead partner" },
  { value: "build", label: "Build partner" },
  { value: "evening", label: "Evening sponsor" },
  { value: "other", label: "Something else" },
] as const

export function demoDayInterestLabel(value: string): string {
  return DEMO_DAY_INTERESTS.find((i) => i.value === value)?.label ?? value
}
