import { cn } from "@/lib/utils"
import { ACCESS_GRANTED, SASTW_LOGO, SASTW_URL } from "@/data/access-granted/2026"

/**
 * "Part of SA Startup + Tech Week" — the same lockup PySanAntonio carries, so
 * the two activations read as belonging to one week rather than as two
 * unrelated events that happen to share a venue.
 *
 * A near-copy of components/pysa/2026/cobrand-row's SastwLockup rather than a
 * shared component. The two differ only in which event's constants they read,
 * and factoring that out would mean a component parameterised by an event —
 * which is what the constants files already are. Copying the twenty lines keeps
 * each page's header readable on its own; if a third event wants this, that is
 * the point to extract it properly.
 *
 * One line, not a stacked label-over-logo block: reading "Part of" before the
 * event has been named puts the modifier ahead of the noun, and the label on
 * its own row costs a whole line of the hero's vertical budget.
 */
export function SastwLockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium",
        className
      )}
    >
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
        Part of
      </span>
      <a
        href={SASTW_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${ACCESS_GRANTED.superEvent.name} — official site`}
        className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
      >
        {/* Held at 85%: the mark is pure white while the label beside it is
            white/40 and the date white/55, so at full strength it punched
            harder than its place in the hierarchy warranted. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SASTW_LOGO.white}
          alt={ACCESS_GRANTED.superEvent.name}
          className="h-9 w-auto opacity-85 sm:h-11 lg:h-12"
        />
      </a>
      {/* Hidden on phones: the date rail right below already carries Sept 30,
          so the week's range is redundant detail at that width and it is the
          only thing that would force this lockup to wrap. */}
      <span aria-hidden className="hidden text-white/25 sm:inline">
        ·
      </span>
      <span className="hidden text-white/55 sm:inline">
        {ACCESS_GRANTED.superEvent.label}
      </span>
    </div>
  )
}
