import Image from "next/image"
import { cn } from "@/lib/utils"
import { PYSA_2026, PYSA_ORGANIZERS, SASTW_LOGO, SASTW_URL } from "@/data/pysa/2026"

/**
 * "Part of SA Startup + Tech Week" — the headline change for this year, so it
 * sits directly under the H1 as its qualifier.
 *
 * One line, not a stacked label-over-logo block: reading "Part of" before the
 * event has been named puts the modifier ahead of the noun, and the label on
 * its own row cost a whole line of the hero's vertical budget.
 */
export function SastwLockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium",
        className
      )}
    >
      <span className="text-xs uppercase tracking-[0.2em] text-white/40">
        Part of
      </span>
      <a
        href={SASTW_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${PYSA_2026.superEvent.name} — official site`}
        className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SASTW_LOGO.white}
          alt={PYSA_2026.superEvent.name}
          className="h-9 w-auto sm:h-11 lg:h-12"
        />
      </a>
      <span aria-hidden className="text-white/25">
        ·
      </span>
      <span className="text-white/55">{PYSA_2026.superEvent.label}</span>
    </div>
  )
}

/**
 * The three organizations activating PySanAntonio II, as a band directly below
 * the hero rather than inside it.
 *
 * It used to sit in the hero's left column, where it was both the tallest
 * remaining block and a restatement of the paragraph above it — the hero could
 * not fit a laptop viewport with it in place. Below the fold it still does its
 * credibility job without costing the headline any room.
 *
 * Only PyTexas keeps its color — its blue and yellow are the page's accent, so
 * every other mark is rendered mono to keep that one reading as signal.
 */
export function CoBrandRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-10",
        className
      )}
    >
      <p className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.2em] text-white/40">
        Activated by
      </p>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        {PYSA_ORGANIZERS.map((org) => (
          <a
            key={org.name}
            href={org.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={org.name}
            className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
          >
            <Image
              src={org.logo}
              alt={org.name}
              width={org.width}
              height={org.height}
              className={cn("w-auto object-contain", org.heightClass)}
            />
          </a>
        ))}
      </div>
    </div>
  )
}
