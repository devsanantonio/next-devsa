import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

/**
 * San Antonio Startup + Tech Week, 28 Sept – 2 Oct 2026.
 *
 * The week is not an event on the calendar — it is five days that a run of
 * other people's events happens inside, three of them DEVSA activations. So it
 * is marked once, as a band before the first day in range, rather than as a
 * ribbon repeated on every card that falls in the window. Saying it once is
 * also the only version that stays true when a group schedules an unrelated
 * meetup that week.
 *
 * The dates are hard-coded because a week is not a record this site keeps.
 * When SASTW 2027 is dated, move these two constants.
 */
const SASTW_START = "2026-09-28"
const SASTW_END = "2026-10-02"

/** Day keys are `YYYY-MM-DD` local strings, so a lexical compare is a date compare. */
export function isStartupWeek(dayKey: string) {
  return dayKey >= SASTW_START && dayKey <= SASTW_END
}

/**
 * True only for the first day of the run that is actually on screen.
 *
 * Not `dayKey === SASTW_START`: the calendar filters, so Sept 28 may not be in
 * the list at all — a search, a month jump, or simply the 28th having passed.
 * Anchoring to the first day present means the band still introduces the week
 * from whatever day the reader has arrived at.
 */
export function isFirstStartupWeekDay(dayKey: string, allDayKeys: string[]) {
  const inRange = allDayKeys.filter(isStartupWeek)
  return inRange.length > 0 && inRange[0] === dayKey
}

export function StartupWeekBand() {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-[#0a0a0a] text-white">
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        {/* The bolt, bled off the right edge as a watermark rather than placed
            as an icon — it is the mark the week is known by, and at this size
            it reads as texture instead of competing with the lockup. */}
        <Image
          src="/branding/sastw-bolt.svg"
          alt=""
          aria-hidden
          width={260}
          height={260}
          className="pointer-events-none absolute -right-10 -top-14 h-[190%] w-auto opacity-[0.13]"
        />

        <div className="relative min-w-0">
          <div className="relative h-8 w-[248px] sm:h-9 sm:w-[280px]">
            <Image
              src="/branding/sastw-white.png"
              alt="San Antonio Startup + Tech Week"
              fill
              unoptimized
              sizes="280px"
              className="object-contain object-left"
            />
          </div>
          <p className="mt-3 text-[13px] font-medium uppercase tracking-[0.18em] text-white/60">
            Sept 28 &ndash; Oct 2, 2026 &middot; Downtown San Antonio
          </p>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/70">
            Five days across downtown. Three of the activations below are ours &mdash;
            the rest of the week belongs to the city.
          </p>
        </div>

        <Link
          href="https://www.sasw.co"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#ff32a0] px-5 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors duration-200 hover:bg-[#e62c90] sm:self-auto"
        >
          Register for the week
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  )
}
