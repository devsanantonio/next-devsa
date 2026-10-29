/**
 * When an organizer may "Message attendees": from three days before the event
 * to seven days after it, two messages per event. Enough for "parking moved"
 * and "here are the slides"; not enough to turn one RSVP into a mailing list.
 *
 * Shared by /api/events/notify, which enforces it, and the RSVPs tab, which
 * greys the button out with the same reason. Free of server-only imports.
 */
export const MESSAGE_LIMIT = 2
const DAY = 24 * 60 * 60 * 1000

export function messageWindow(
  date: string | undefined | null,
  sentCount: number,
  now: number
): { open: true } | { open: false; reason: string } {
  const start = date ? new Date(date).getTime() : NaN
  if (Number.isNaN(start)) return { open: false, reason: "This event has no date" }
  if (now < start - 3 * DAY) return { open: false, reason: "Messages open three days before the event" }
  if (now > start + 7 * DAY) return { open: false, reason: "Messages close seven days after the event" }
  if (sentCount >= MESSAGE_LIMIT) return { open: false, reason: `This event has had its ${MESSAGE_LIMIT} messages` }
  return { open: true }
}
