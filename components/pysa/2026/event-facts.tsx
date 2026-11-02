import { PYSA_2026 } from "@/data/pysa/2026"
import type { Conference } from "@/data/conferences"
import { ConferenceFacts } from "@/components/events/conference-facts"

/**
 * The 2026 edition in four facts, above the room and the lineup. Rendered by
 * ConferenceFacts, shared with The Model and Access Granted.
 *
 * This replaced the week's lockup ("Part of SA Startup + Tech Week", in the
 * week's own logo) over a date/time/room rail. With the week over, that credit
 * read as if PySanAntonio belonged to it. It is DEVSA's conference, held during
 * the week, and the last fact says so in plain words.
 *
 * A session with no speaker (Python Jeopardy) is named beside the talk count
 * rather than counted as a talk.
 */
export function PysaFacts({ conference }: { conference: Conference }) {
  const sessions = conference.sessions ?? []
  const talks = sessions.filter((s) => s.people).length
  const extras = sessions.filter((s) => !s.people).map((s) => s.title)
  const where = conference.venueDetail?.split("—")[0].trim()
  const facts: { value: string; label: string }[] = [
    { value: PYSA_2026.dateLabel.replace(/^\w+, /, ""), label: "The second edition" },
    ...(talks
      ? [{ value: `${talks} talks`, label: `${extras.length ? `And ${extras.join(", ")}, ` : ""}${PYSA_2026.timeLabel}` }]
      : []),
    { value: PYSA_2026.venue, label: where || PYSA_2026.venueDetail },
    { value: "SA Startup + Tech Week", label: "DEVSA's conference, held during the week" },
  ]

  return <ConferenceFacts facts={facts} />
}
