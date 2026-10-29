import { emailShell, eyebrow, heading, paragraph, panel, rows, button, esc, firstNameOf } from "./layout"

/**
 * The day-before reminder to everyone who RSVP'd, from the daily cron
 * (/api/events/reminders). Each RSVP gets it once: the cron stamps `remindedAt`.
 * Short on purpose: it's a nudge with the details, read on a phone.
 */
export function EventReminderEmail({
  firstName,
  eventTitle,
  hostName,
  when,
  where,
  eventUrl,
}: {
  firstName: string
  eventTitle: string
  hostName: string
  when: string
  where: string
  eventUrl: string
}): string {
  return emailShell({
    title: `Tomorrow: ${esc(eventTitle)}`,
    preheader: `${esc(when)} · ${esc(where)}`,
    body: `
      ${eyebrow("See you tomorrow")}
      ${heading(`${esc(eventTitle)} is tomorrow, ${firstNameOf(firstName)}.`)}
      ${panel(rows([["When", esc(when)], ["Where", esc(where)], ["Hosted by", esc(hostName)]]), { label: "Your event" })}
      ${paragraph("Plans changed? Reply to this email so the organizers can plan for the room.")}
      ${button(eventUrl, "View the event")}
    `,
  })
}

export function getEventReminderSubject(eventTitle: string): string {
  return `Tomorrow: "${eventTitle}" | DEVSA`
}
