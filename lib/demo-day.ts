/**
 * Demo Day's shared facts, read by the page, the inquiry form, the inquiry API
 * and the admin inbox — so the deadline, the industries and the ways to back it
 * cannot say one thing on the page and another in Firestore.
 */

/**
 * The event's name and how it is described. Renamed from plain "Demo Day" on
 * 2026-10-11: every other event DEVSA owns has a name, and "Demo Day San
 * Antonio" competes with every accelerator's. Confluencia comes from
 * HemisFair '68's theme, a "Confluence of Civilizations in the Americas" —
 * here, the industry's problem, the builders' work and the investors meeting
 * in one room. "Demo Day" stays as the descriptor, so nobody has to guess
 * what it is.
 *
 * Internal names (lib/demo-day.ts, the demo_day_inquiries collection, the
 * /api/demo-day routes, the "demo-day" campaign key) keep the old word on
 * purpose: nobody sees them, and renaming stored keys buys nothing.
 */
export const DEMO_DAY_NAME = "Confluencia"
export const DEMO_DAY_DESCRIPTOR = "a DEVSA Demo Day"
export const DEMO_DAY_PATH = "/events/confluencia"

/**
 * Each year's industry gets "the pavilion" — after HemisFair '68's national
 * and corporate pavilions. Until a lead partner signs, no year's pavilion is
 * named: publishing one would turn away every other industry's partner.
 */
export const DEMO_DAY_PAVILION_YEAR = 2027

/**
 * The funding deadline. Demo Day only goes ahead if it is funded by this date;
 * if it is not, every gift designated to it is refunded. Set by Jesse on
 * 2026-10-11 for an April 2027 event: late enough to raise, early enough to
 * book a venue and brief a lead partner in time.
 */
export const DEMO_DAY_DEADLINE = "January 31, 2027"

/**
 * The industries a year's brief can come from. A list of possibilities, never a
 * schedule — see DemoDayIndustries for why AI is not one and why it is
 * "Military & Defense". `color` keys into DD in components/demo-day/theme.tsx.
 */
export const DEMO_DAY_INDUSTRIES = [
  { name: "Aerospace", color: "turquoise" },
  { name: "Cybersecurity", color: "lime" },
  { name: "Healthcare & Bioscience", color: "pink" },
  { name: "Manufacturing", color: "orange" },
  { name: "Military & Defense", color: "violet" },
  { name: "Robotics", color: "marigold" },
] as const

/**
 * What someone can offer through the inquiry form. `anchor` is the in-page id
 * a button links to so the form opens with that option already chosen.
 */
export const DEMO_DAY_INTERESTS = [
  { value: "lead", label: "Lead partner", anchor: "inquire-lead" },
  { value: "build", label: "Build partner", anchor: "inquire-build" },
  { value: "evening", label: "Evening sponsor", anchor: "inquire-evening" },
  { value: "other", label: "Something else", anchor: "inquire-other" },
] as const

export type DemoDayInterest = (typeof DEMO_DAY_INTERESTS)[number]["value"]

export const DEMO_DAY_INTEREST_VALUES: readonly string[] = DEMO_DAY_INTERESTS.map((i) => i.value)

export function demoDayInterestLabel(value: string): string {
  return DEMO_DAY_INTERESTS.find((i) => i.value === value)?.label ?? value
}
