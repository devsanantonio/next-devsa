import { CalendarDays, Clock, MapPin } from "lucide-react"
import { getConference } from "@/data/conferences"

const MH_AMBER = "#ff9900"

/**
 * The date/time/room rail.
 *
 * These were in the masthead. They are facts, and a masthead that opens with
 * logistics spends its strongest position on the least interesting thing on the
 * page — the wordmark and the pitch are what earn a reader, and somebody
 * looking up when a thing started is already heading for the schedule.
 *
 * So they sit directly above the lineup now, which is also the only place on
 * the page where the date is load-bearing: a running order means nothing
 * without the day it ran on.
 *
 * Mirrors components/pysa/2026/event-facts.tsx and the Access Granted one.
 * Separate copies rather than one shared component because each carries its own
 * brand, and the only thing they would actually share is a flex row. This one
 * has no week lockup above it — the other two were activations inside Startup +
 * Tech Week and said so; this conference is DEVSA's own and stands alone.
 */
export function MoreHumanFacts() {
  const conference = getConference("more-human-than-human")
  if (!conference) return null

  const meta = [
    { Icon: CalendarDays, label: "Date", value: conference.lastRun },
    { Icon: Clock, label: "Time", value: conference.timeLabel },
    {
      Icon: MapPin,
      label: "Location",
      value: [conference.venue, conference.venueDetail]
        .filter(Boolean)
        .join(", "),
    },
  ].filter((m) => m.value)

  return (
    <section className="page-shell pb-10 md:pb-12">
      <div className="border-t border-white/10 pt-10">
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/60">
          {meta.map(({ Icon, label, value }) => (
            <div key={label} className="inline-flex items-center gap-2">
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: MH_AMBER }}
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
