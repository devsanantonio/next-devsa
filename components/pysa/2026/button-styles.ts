/**
 * Button styling for the PySanAntonio pages, matching the shape used across
 * the rest of the site (see components/about-devsa.tsx and hero-bridge.tsx):
 * rounded-lg, px-6 py-3.5 sm:py-3, text-sm, transition-colors.
 *
 * `rounded-full` is reserved for pills, chips and badges here — the same way
 * the Startup Week track chips use it — not for calls to action.
 */

const base =
  "group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 sm:py-3 text-sm font-semibold sm:font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"

/** Yellow. The single primary action on the page at any given time. */
export const primaryButton = `${base} bg-[#ffdd00] text-[#0a0a0a] hover:bg-[#e8c900] focus-visible:ring-[#ffdd00]`

/** Outlined, for the secondary path alongside the primary. */
export const secondaryButton = `${base} border border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/10 focus-visible:ring-white/60`

/** Full-width form submit — same shape, no sm:w-auto. */
export const submitButton =
  "group flex w-full items-center justify-center gap-2 rounded-lg bg-[#ffdd00] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors duration-200 hover:bg-[#e8c900] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdd00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"

/** Inert stand-in shown where the primary button sits once the call closes. */
export const disabledSlot =
  "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3.5 sm:py-3 text-sm font-semibold sm:font-medium text-white/70"
