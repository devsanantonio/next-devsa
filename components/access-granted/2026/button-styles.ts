/**
 * Buttons for the Access Granted pages.
 *
 * Same shape as the PySanAntonio set — rounded-lg, px-6 py-3.5 sm:py-3, text-sm
 * — because that shape is the site's, not the event's. Only the colour changes:
 * terminal green where PySanAntonio uses PyTexas yellow.
 *
 * The greens are written as literal hex rather than read from ACCESS_GREEN in
 * data/access-granted/2026.ts, because Tailwind scans this file as text at
 * build time and cannot see through an imported constant. They must be kept in
 * step with it by hand — #00ff66 is ACCESS_GREEN, and #ffb800 (in the volunteer
 * form's override) is ACCESS_AMBER.
 */

const base =
  "group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 sm:py-3 text-sm font-semibold sm:font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"

/**
 * Terminal green, black type. The single primary action on the page.
 *
 * Black on #00ff66 is 15.6:1 — the green is bright enough that white type on it
 * would fail contrast badly, which is why this is the one button on the site
 * with a dark label.
 */
export const primaryButton = `${base} bg-[#00ff66] text-[#0a0a0a] hover:bg-[#00e65c] focus-visible:ring-[#00ff66]`

/** Outlined, for the secondary path alongside the primary. */
export const secondaryButton = `${base} border border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/10 focus-visible:ring-white/60`

/** Full-width form submit — same shape, no sm:w-auto. */
export const submitButton =
  "group flex w-full items-center justify-center gap-2 rounded-lg bg-[#00ff66] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors duration-200 hover:bg-[#00e65c] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"

/** Inert stand-in shown where the primary button sits once the call closes. */
export const disabledSlot =
  "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3.5 sm:py-3 text-sm font-semibold sm:font-medium text-white/70"

/** Mono caps eyebrow, the type treatment the whole activation is built on. */
export const monoEyebrow =
  "font-mono text-xs uppercase tracking-[0.2em] text-white/40"
