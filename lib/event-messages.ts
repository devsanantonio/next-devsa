/**
 * "Message attendees": what organizers can send the people going, and when.
 *
 * Three kinds, each at most once per person per event:
 *
 *   details  the default. A branded email of the event's own details: when,
 *            where, the getting-there note and the add-to-calendar buttons,
 *            with an optional note. Any time before the event starts. It can
 *            only say what the event page says, so it isn't capped further.
 *   before   the organizers' own note ahead of the night ("bring a laptop",
 *            "we're in room B"), from a week before until it starts.
 *   after    the follow-up (slides, the recording, photos), from the start
 *            until two weeks after.
 *
 * Before and after start from a template the organizer edits. Counting per
 * person, not per event, is what lets an organizer catch up the people who
 * RSVP'd early without spending anyone else's message; and once each is the
 * cap that keeps one RSVP from becoming a mailing list.
 *
 * Shared by /api/events/notify, which enforces it, and the RSVPs tab, which
 * shows the same reasons. Free of server-only imports.
 */
export type MessageKind = "details" | "before" | "after"

export const MESSAGE_KINDS: { kind: MessageKind; label: string; hint: string }[] = [
  { kind: "details", label: "Event details", hint: "When and where, getting there and the calendar buttons, with an optional note." },
  { kind: "before", label: "Before the event", hint: "Your note ahead of the night: what to bring, where to find the room." },
  { kind: "after", label: "After the event", hint: "Your follow-up: thanks, the slides, the recording." },
]

const DAY = 24 * 60 * 60 * 1000

/**
 * When the RSVP confirmation started carrying the getting-there note and the
 * calendar buttons (production deploy of f0239cc). Anyone who RSVP'd, or was
 * moved off the waitlist, after this already has the details email's content.
 */
export const DETAILS_IN_CONFIRMATION_SINCE = Date.parse("2026-11-08T23:14:39Z")

export function messageWindow(
  kind: MessageKind,
  date: string | undefined | null,
  now: number
): { open: true } | { open: false; reason: string } {
  const start = date ? new Date(date).getTime() : NaN
  if (Number.isNaN(start)) return { open: false, reason: "This event has no date" }
  if (kind === "details") {
    return now < start ? { open: true } : { open: false, reason: "The event has started; the details are for before it" }
  }
  if (kind === "before") {
    if (now < start - 7 * DAY) return { open: false, reason: "Opens a week before the event" }
    if (now >= start) return { open: false, reason: "The event has started; send an after-the-event message instead" }
    return { open: true }
  }
  if (now < start) return { open: false, reason: "Opens once the event starts" }
  if (now > start + 14 * DAY) return { open: false, reason: "Closed two weeks after the event" }
  return { open: true }
}

/** The kind that makes sense right now, for the form to open on. */
export function defaultKind(date: string | undefined | null, now: number): MessageKind {
  const start = date ? new Date(date).getTime() : NaN
  return !Number.isNaN(start) && now >= start ? "after" : "details"
}

type Stamp = string | number | Date | { toDate?: () => Date } | null | undefined
const ms = (v: Stamp): number => {
  if (!v) return NaN
  if (typeof v === "object" && "toDate" in v && typeof v.toDate === "function") return v.toDate().getTime()
  return new Date(v as string | number | Date).getTime()
}

/**
 * Whether this person already has this kind of message: it was sent to them, or
 * for the details, their confirmation already carried them.
 */
export function alreadyReceived(
  rsvp: { submittedAt?: Stamp; promotedAt?: Stamp; messaged?: Partial<Record<MessageKind, Stamp>> | null },
  kind: MessageKind
): boolean {
  if (rsvp.messaged?.[kind]) return true
  if (kind !== "details") return false
  // Confirmed on RSVP, or on being moved up: whichever gave them their seat.
  const seat = Math.max(ms(rsvp.submittedAt) || 0, ms(rsvp.promotedAt) || 0)
  return seat >= DETAILS_IN_CONFIRMATION_SINCE
}

/**
 * A message close to the night replaces the day-before reminder for the people
 * it went to: it carries the same details and calendar buttons. Sent earlier
 * than two days out, the reminder still has a job, so it still goes.
 */
export function replacesReminder(kind: MessageKind, sentAt: number, date: string | undefined | null): boolean {
  const start = date ? new Date(date).getTime() : NaN
  return kind !== "after" && !Number.isNaN(start) && sentAt < start && start - sentAt <= 2 * DAY
}

/**
 * Events messaged before the three kinds existed suppressed the reminder for
 * everyone, and their RSVPs carry no stamp. Kept so those few still behave.
 */
export function legacyRemindersSuppressed(event: { messages?: { type?: string }[] | null }): boolean {
  return (event.messages ?? []).some((m) => !m.type)
}

/** The weekday in San Antonio, for "See you Thursday". */
export function eventDay(date: string | undefined | null): string {
  const d = date ? new Date(date) : null
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Chicago" }) : "soon"
}

/** Where a template wants the organizer's own words. A message still holding one can't be sent. */
export const TEMPLATE_BLANKS = ["[What to bring, what to prepare, where to find the room]", "[The slides, the recording, photos]"]

/** The starting point for a before or after message. The organizer edits all of it. */
export function messageTemplate(kind: "before" | "after", event: { title: string; date?: string | null }): { subject: string; message: string } {
  const day = eventDay(event.date)
  if (kind === "before") {
    return {
      subject: `Before ${day}`,
      message: `We're looking forward to seeing you ${day}.\n\nA few things before you head over:\n\n${TEMPLATE_BLANKS[0]}\n\nIf your plans change, reply to this email so we can give your seat to someone else.\n\nSee you there.`,
    }
  }
  return {
    subject: "Thanks for coming",
    message: `Thanks for coming out to ${event.title}. It was good to have you in the room.\n\n${TEMPLATE_BLANKS[1]}\n\nEverything coming up is on the community calendar: https://www.devsa.community/events. We'd love to see you at the next one.`,
  }
}
