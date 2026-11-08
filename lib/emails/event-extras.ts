import { panel, button, esc, C } from "./layout"
import { arrivalNoteRuns } from "@/lib/arrival-note"

/**
 * The parts every attendee email shares about getting to the event: the
 * organizer's "Getting there" note (parking, entrance, floor) and the
 * add-to-calendar links. Used by the RSVP confirmation, the organizer's message
 * to attendees, and the day-before reminder, so the three can't drift apart.
 * Build the values with eventExtrasFor() in lib/event-emails.ts.
 */
export interface EventExtras {
  /** Google Calendar's template link for this event. */
  googleCalendarUrl: string
  /** /api/events/ics for this event, for Apple Calendar and Outlook. */
  icsUrl: string
  arrivalNote?: string | null
}

export function gettingThere(note?: string | null): string {
  if (!note) return ""
  const html = arrivalNoteRuns(note)
    .map((run) => (run.bold ? `<strong style="color: #ffffff;">${esc(run.text)}</strong>` : esc(run.text)))
    .join("")
  return panel(`<p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${C.text};">${html}</p>`, {
    label: "Getting there",
    accent: C.teal,
  })
}

export function calendarButtons({ googleCalendarUrl, icsUrl }: EventExtras): string {
  return `${button(googleCalendarUrl, "Add to Google Calendar")}
      <p style="margin: 12px 0 24px 0; font-size: 14px; color: ${C.body};">On Apple Calendar or Outlook? <a href="${icsUrl}" style="color: ${C.teal}; font-weight: 600;">Add it with this calendar file</a>.</p>`
}
