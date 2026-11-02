import { getConference } from "@/data/conferences"
import { ConferenceFacts } from "@/components/events/conference-facts"

/**
 * The first edition in three facts, above the lineup. Rendered by
 * ConferenceFacts, shared with The Model, Access Granted and PySanAntonio.
 * Three rather than four: this one did not run during SA Startup + Tech Week,
 * which is the fourth fact on the other pages.
 */
export function MoreHumanFacts() {
  const conference = getConference("more-human-than-human")
  if (!conference) return null

  const sessions = conference.sessions?.length ?? 0
  const where = conference.venueDetail?.split("—")[0].trim()
  const facts: { value: string; label: string }[] = [
    ...(conference.lastRun ? [{ value: conference.lastRun, label: "The first edition" }] : []),
    ...(sessions ? [{ value: `${sessions} sessions`, label: conference.timeLabel ?? "" }] : []),
    ...(conference.venue ? [{ value: conference.venue, label: where ?? "" }] : []),
  ]

  return <ConferenceFacts facts={facts} />
}
