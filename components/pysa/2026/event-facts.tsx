import { CalendarDays, Clock, MapPin } from "lucide-react"
import { PYSA_2026, PYSA_COLORS } from "@/data/pysa/2026"
import { SastwLockup } from "@/components/pysa/2026/cobrand-row"

/**
 * The week lockup and the date/time/room rail.
 *
 * These were in the masthead. They are facts, and a masthead that opens with
 * logistics spends its strongest position on the least interesting thing on
 * the page — the wordmark and the pitch are what earn a reader, and somebody
 * looking up when a thing started is already heading for the schedule.
 *
 * So they sit directly above the lineup now, which is also the only place on
 * the page where the date is load-bearing: a running order means nothing
 * without the day it ran on.
 *
 * Mirrors components/access-granted/2026/event-facts.tsx. Two copies rather
 * than one shared component because each carries its own brand — PySA's rail
 * is sans in its blue, Access Granted's is mono in its green — and the only
 * thing they would actually share is a flex row.
 */
const META = [
  { Icon: CalendarDays, label: "Date", value: PYSA_2026.dateLabel },
  { Icon: Clock, label: "Time", value: PYSA_2026.timeLabel },
  {
    Icon: MapPin,
    label: "Location",
    value: `${PYSA_2026.venue}, ${PYSA_2026.venueDetail}`,
  },
]

export function PysaFacts() {
  return (
    <section className="page-shell pb-10 md:pb-12">
      <div className="border-t border-white/10 pt-10">
        <SastwLockup />
        <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/60">
          {META.map(({ Icon, label, value }) => (
            <div key={label} className="inline-flex items-center gap-2">
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: PYSA_COLORS.blue }}
                aria-hidden="true"
              />
              <dt className="sr-only">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
