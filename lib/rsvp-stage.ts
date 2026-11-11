/**
 * "Are you a student, working in tech, or exploring?": the optional question on
 * every RSVP form, asked so DEVSA can say how many students it reaches. Added
 * 2026-11-10; RSVPs before then have no answer, and reports should say counting
 * started then rather than guess at earlier ones.
 *
 * It is reported only as totals, never per person. /api/rsvp stores it on the
 * RSVP but strips it from every row it returns and from the CSV, and returns
 * per-event counts instead; the admin shows those summed, and only once
 * STAGE_MIN_SHOWN people in view have answered, so one small event can't single
 * anyone out. Shared by the form, the route and the admin; no server imports.
 */
export const RSVP_STAGES = [
  { value: "student", label: "Student" },
  { value: "working", label: "Working in tech" },
  { value: "exploring", label: "Exploring" },
] as const

export type RsvpStage = (typeof RSVP_STAGES)[number]["value"]

export const isRsvpStage = (v: unknown): v is RsvpStage => RSVP_STAGES.some((s) => s.value === v)

/** Per event: how many RSVPs gave each answer. */
export type StageTotals = Record<string, Partial<Record<RsvpStage, number>>>

/** Below this many answers in view, the admin shows no breakdown at all. */
export const STAGE_MIN_SHOWN = 5
