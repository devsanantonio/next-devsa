import {
  emailShell,
  eyebrow,
  heading,
  paragraph,
  panel,
  rows,
  button,
  esc,
  firstNameOf,
  SITE,
} from "./layout"

interface RsvpThankYouEmailProps {
  firstName: string
  lastName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  communityName: string
  eventUrl?: string
}

/**
 * Confirmation for an RSVP on a calendar event. The event's details lead, since
 * that is what someone opens this to check on the day.
 */
export function RsvpThankYouEmail({
  firstName,
  eventTitle,
  eventDate,
  eventLocation,
  communityName,
  eventUrl,
}: RsvpThankYouEmailProps): string {
  return emailShell({
    title: `You're registered for ${esc(eventTitle)}`,
    preheader: `${esc(eventTitle)}, ${esc(eventDate)}.`,
    body: `
      ${eyebrow("RSVP confirmed")}
      ${heading(`You&rsquo;re in, ${firstNameOf(firstName)}.`)}
      ${paragraph(`Thanks for registering. Here are the details to keep handy.`)}
      ${panel(
        `<p style="margin: 0 0 14px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.35;">${esc(eventTitle)}</p>
        ${rows([
          ["When", esc(eventDate)],
          ["Where", esc(eventLocation)],
          ["Hosted by", esc(communityName)],
        ])}`,
        { label: "Your event" }
      )}
      ${paragraph("Can&rsquo;t make it after all, or have a question? Reply to this email.")}
      ${button(eventUrl || `${SITE}/events`, "View the event")}
    `,
  })
}

export function getRsvpThankYouSubject(eventTitle: string): string {
  return `You're registered for "${eventTitle}" | DEVSA`
}
