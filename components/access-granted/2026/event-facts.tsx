import { ACCESS_GRANTED } from "@/data/access-granted/2026"
import type { Conference } from "@/data/conferences"
import { ConferenceFacts } from "@/components/events/conference-facts"

/**
 * The first edition, in four facts, above the lineup. Rendered by
 * ConferenceFacts, shared with The Model and PySanAntonio.
 *
 * This replaced a monospace date/time/room rail under the week's lockup
 * ("Part of SA Startup + Tech Week", in the week's own logo). With the week
 * over, that credit read as if Access Granted belonged to it. It is DEVSA's,
 * run during the week, and the last fact says so in plain words.
 *
 * Values come from the data files, never typed here. The lockpicking village
 * ran all afternoon rather than in a slot, so it is named beside the talk count
 * instead of counted as one.
 */
export function AccessGrantedFacts({ conference }: { conference: Conference }) {
  const talks = (conference.sessions ?? []).filter((s) => !/village/i.test(s.title)).length
  const village = (conference.sessions ?? []).some((s) => /village/i.test(s.title))
  const where = conference.venueDetail?.split("—")[0].trim()
  const facts: { value: string; label: string }[] = [
    { value: ACCESS_GRANTED.dateLabel.replace(/^\w+, /, ""), label: "The first edition" },
    ...(talks
      ? [{ value: `${talks} talks`, label: `${village ? "And a lockpicking village, " : ""}${ACCESS_GRANTED.timeLabel}` }]
      : []),
    { value: ACCESS_GRANTED.venue, label: where || ACCESS_GRANTED.venueDetail },
    { value: "SA Startup + Tech Week", label: "DEVSA's activation during the week" },
  ]

  return <ConferenceFacts facts={facts} />
}
