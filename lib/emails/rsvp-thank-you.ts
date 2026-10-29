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
  /** Moved up from the waitlist: the same confirmation, saying a spot opened. */
  fromWaitlist?: boolean
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
  fromWaitlist,
}: RsvpThankYouEmailProps): string {
  return emailShell({
    title: `You're registered for ${esc(eventTitle)}`,
    preheader: `${esc(eventTitle)}, ${esc(eventDate)}.`,
    body: `
      ${eyebrow(fromWaitlist ? "Off the waitlist" : "RSVP confirmed")}
      ${heading(`You&rsquo;re in, ${firstNameOf(firstName)}.`)}
      ${paragraph(
        fromWaitlist
          ? `A spot opened up, and it&rsquo;s yours. Here are the details to keep handy.`
          : `Thanks for registering. Here are the details to keep handy.`
      )}
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

export function getRsvpThankYouSubject(eventTitle: string, fromWaitlist = false): string {
  return fromWaitlist ? `A spot opened: you're in for "${eventTitle}" | DEVSA` : `You're registered for "${eventTitle}" | DEVSA`
}

/**
 * Signed up after the event filled. Says plainly that this is not a seat, so
 * nobody turns up expecting one, and that an email follows if a spot opens.
 */
export function RsvpWaitlistEmail({
  firstName,
  eventTitle,
  eventDate,
  eventLocation,
  communityName,
  eventUrl,
}: RsvpThankYouEmailProps): string {
  return emailShell({
    title: `You're on the waitlist for ${esc(eventTitle)}`,
    preheader: `${esc(eventTitle)} is full. We'll email you if a spot opens.`,
    body: `
      ${eyebrow("Waitlist")}
      ${heading(`You&rsquo;re on the waitlist, ${firstNameOf(firstName)}.`)}
      ${paragraph(`${esc(eventTitle)} is full, so you don&rsquo;t have a spot yet. If one opens, the organizers will move you up and you&rsquo;ll get an email confirming it.`)}
      ${panel(
        `<p style="margin: 0 0 14px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.35;">${esc(eventTitle)}</p>
        ${rows([
          ["When", esc(eventDate)],
          ["Where", esc(eventLocation)],
          ["Hosted by", esc(communityName)],
        ])}`,
        { label: "The event" }
      )}
      ${paragraph("No longer interested? Reply and let us know, and we&rsquo;ll take you off the list.")}
      ${button(eventUrl || `${SITE}/events`, "View the event")}
    `,
  })
}

export const getRsvpWaitlistSubject = (eventTitle: string) => `Waitlist: "${eventTitle}" | DEVSA`
