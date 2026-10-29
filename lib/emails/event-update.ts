import { emailShell, eyebrow, heading, paragraph, panel, rows, button, esc, firstNameOf, SITE } from "./layout"

/**
 * Emails to the people who RSVP'd, when an organizer changes an event or calls
 * it off. Sent only when the organizer chooses to, from the admin's prompt after
 * saving a change to the date, time or place, or when deleting the event.
 *
 * The organizer's optional note leads, because it's the human part; then what
 * changed, before and after, so nobody has to compare against the old email.
 */

export interface EventChange {
  label: string
  before: string
  after: string
}

export function EventChangedEmail({
  firstName,
  eventTitle,
  hostName,
  changes,
  when,
  where,
  note,
  eventUrl,
}: {
  firstName: string
  eventTitle: string
  hostName: string
  changes: EventChange[]
  when: string
  where: string
  note?: string | null
  eventUrl: string
}): string {
  return emailShell({
    title: `${esc(eventTitle)} has changed`,
    preheader: changes.map((c) => `${c.label}: ${c.after}`).join(" · "),
    body: `
      ${eyebrow("Event update")}
      ${heading(`${esc(eventTitle)} has changed, ${firstNameOf(firstName)}.`)}
      ${paragraph(`You RSVP&rsquo;d, so ${esc(hostName)} wanted you to know before you head out.`)}
      ${note ? panel(`<p style="margin: 0; font-size: 15px; line-height: 1.6; color: #ffffff;">${esc(note)}</p>`, { label: `From ${esc(hostName)}` }) : ""}
      ${panel(
        rows(changes.map((c) => [c.label, `<span style="text-decoration: line-through; opacity: 0.6;">${esc(c.before)}</span><br />${esc(c.after)}`])),
        { label: "What changed" }
      )}
      ${panel(rows([["When", esc(when)], ["Where", esc(where)]]), { label: "Where to be now" })}
      ${paragraph("Your RSVP still stands. Can&rsquo;t make the new time? Reply and let us know.")}
      ${button(eventUrl, "View the event")}
    `,
  })
}

export function getEventChangedSubject(eventTitle: string): string {
  return `Update: "${eventTitle}" has changed | DEVSA`
}

export function EventCancelledEmail({
  firstName,
  eventTitle,
  hostName,
  when,
  note,
}: {
  firstName: string
  eventTitle: string
  hostName: string
  when: string
  note?: string | null
}): string {
  return emailShell({
    title: `${esc(eventTitle)} is cancelled`,
    preheader: `${esc(eventTitle)}, ${esc(when)}, is not happening.`,
    body: `
      ${eyebrow("Event cancelled")}
      ${heading(`Sorry, ${firstNameOf(firstName)}: ${esc(eventTitle)} is off.`)}
      ${paragraph(`${esc(hostName)} has cancelled ${esc(eventTitle)}, which was set for ${esc(when)}. You don&rsquo;t need to do anything.`)}
      ${note ? panel(`<p style="margin: 0; font-size: 15px; line-height: 1.6; color: #ffffff;">${esc(note)}</p>`, { label: `From ${esc(hostName)}` }) : ""}
      ${paragraph("There&rsquo;s plenty more happening. The community calendar has every group&rsquo;s next event.")}
      ${button(`${SITE}/events`, "See what else is on")}
    `,
  })
}

export function getEventCancelledSubject(eventTitle: string): string {
  return `Cancelled: "${eventTitle}" | DEVSA`
}

/**
 * A message from the organizers to the people going: slides, a parking note,
 * the recording. Sent from DEVSA with the organizer as reply-to and their name
 * on it, so a reply reaches a person. Limited by /api/events/notify to two per
 * event, from three days before it to seven days after.
 */
export function EventMessageEmail({
  firstName,
  eventTitle,
  hostName,
  senderName,
  subject,
  message,
  eventUrl,
}: {
  firstName: string
  eventTitle: string
  hostName: string
  senderName: string
  subject: string
  message: string
  eventUrl: string
}): string {
  const paragraphs = message
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => paragraph(esc(p).replace(/\n/g, "<br />")))
    .join("")
  return emailShell({
    title: esc(subject),
    preheader: `From ${esc(senderName)} about ${esc(eventTitle)}.`,
    body: `
      ${eyebrow(esc(eventTitle))}
      ${heading(esc(subject))}
      ${paragraph(`Hi ${firstNameOf(firstName)},`)}
      ${paragraphs}
      ${paragraph(`${esc(senderName)}<br /><span style="opacity: 0.7;">${esc(hostName)}</span>`)}
      ${paragraph("You&rsquo;re getting this because you RSVP&rsquo;d. Reply to reach the organizers directly.")}
      ${button(eventUrl, "View the event")}
    `,
  })
}

export const getEventMessageSubject = (subject: string, eventTitle: string) => `${subject} | ${eventTitle}`
