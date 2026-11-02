import { THE_MODEL } from "@/data/the-model/2026"
import type { Conference } from "@/data/conferences"
import { ConferenceFacts } from "@/components/events/conference-facts"

/**
 * The first edition, in four facts, under the hero.
 *
 * Every value is read from the data files (THE_MODEL and the conference record),
 * never typed here, so the next edition updates one place. Facts only: no
 * attendance figure, because there isn't a recorded one to quote, and no
 * "flagship", which this isn't. The week is named because The Model is DEVSA's
 * own activation during SA Startup + Tech Week, not the week's.
 */
export function TheModelFacts({ conference }: { conference: Conference }) {
  const sessions = conference.sessions?.length ?? 0
  const where = conference.venueDetail?.split("—")[0].trim()
  const facts: { value: string; label: string }[] = [
    { value: THE_MODEL.dateLabel.replace(/^\w+, /, ""), label: "The first edition" },
    ...(sessions ? [{ value: `${sessions} sessions`, label: THE_MODEL.timeLabel }] : []),
    { value: THE_MODEL.venue, label: where || THE_MODEL.venueDetail },
    { value: "SA Startup + Tech Week", label: "DEVSA's activation during the week" },
  ]

  return <ConferenceFacts facts={facts} />
}
