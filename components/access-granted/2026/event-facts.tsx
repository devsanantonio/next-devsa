import { CalendarDays, Clock, MapPin } from "lucide-react"
import { ACCESS_GRANTED, ACCESS_GREEN } from "@/data/access-granted/2026"
import { SastwLockup } from "@/components/access-granted/2026/sastw-lockup"

/**
 * The week lockup and the date/time/room rail.
 *
 * These were in the masthead. They are facts, and a masthead that opens with
 * logistics spends its strongest position on the least interesting thing on
 * the page — the name and the hook are what earn a reader, and the schedule is
 * where somebody looking up when a thing started is already going.
 *
 * So they sit directly above the lineup now, which is also the only place on
 * the page where the date is load-bearing: a running order means nothing
 * without the day it ran.
 */
const META = [
  { Icon: CalendarDays, label: "Date", value: ACCESS_GRANTED.dateLabel },
  { Icon: Clock, label: "Time", value: ACCESS_GRANTED.timeLabel },
  {
    Icon: MapPin,
    label: "Where",
    value: `${ACCESS_GRANTED.venue}, ${ACCESS_GRANTED.venueDetail}`,
  },
]

export function AccessGrantedFacts() {
  return (
    <section className="page-shell pb-10 md:pb-12">
      <div className="border-t border-white/10 pt-10">
        <SastwLockup />
        <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-white/55">
          {META.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <dt className="sr-only">{label}</dt>
              <Icon
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: ACCESS_GREEN }}
                aria-hidden="true"
              />
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
