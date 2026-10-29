import { emailShell, eyebrow, heading, paragraph, panel, rows, esc, firstNameOf } from "./layout"

/**
 * A speaker's decision, sent only when the reviewer ticks "Email the speaker" on
 * the decision. Off by default: a status change is otherwise internal, and
 * decisions are often made in batches before anyone is ready to announce them.
 *
 * Named the way the speaker's thank-you email named the event, so the two read
 * as one thread.
 */
const EVENT_NAMES: Record<string, string> = {
  "pysanantonio-2026": "PySanAntonio II",
  "access-granted-2026": "Access Granted",
}
export const speakerEventName = (eventId?: string | null) => (eventId && EVENT_NAMES[eventId]) || "DEVSA"

export function SpeakerAcceptedEmail({ name, sessionTitle, eventName }: { name: string; sessionTitle: string; eventName: string }): string {
  return emailShell({
    title: `Your talk is accepted`,
    preheader: `"${esc(sessionTitle)}" is on the program for ${esc(eventName)}.`,
    body: `
      ${eyebrow("Talk accepted")}
      ${heading(`You&rsquo;re in, ${firstNameOf(name)}.`)}
      ${paragraph(`We&rsquo;d love to have you speak at ${esc(eventName)}. The organizers will be in touch with the time slot and what you&rsquo;ll need on the day.`)}
      ${panel(rows([["Talk", esc(sessionTitle)], ["Event", esc(eventName)]]), { label: "Your talk" })}
      ${paragraph("Questions before then? Reply to this email.", { last: true })}
    `,
  })
}

export function SpeakerDeclinedEmail({ name, sessionTitle, eventName }: { name: string; sessionTitle: string; eventName: string }): string {
  return emailShell({
    title: `About your talk submission`,
    preheader: `An update on "${esc(sessionTitle)}" for ${esc(eventName)}.`,
    body: `
      ${eyebrow("About your submission")}
      ${heading(`Thank you for submitting, ${firstNameOf(name)}.`)}
      ${paragraph(`We had more strong talks than slots for ${esc(eventName)}, and couldn&rsquo;t fit &ldquo;${esc(sessionTitle)}&rdquo; into this program.`)}
      ${paragraph("Please don&rsquo;t let that stop you: San Antonio&rsquo;s meetups are always looking for speakers, and a talk that didn&rsquo;t fit here is often a great fit there. Reply if you&rsquo;d like an introduction.", { last: true })}
    `,
  })
}

export const getSpeakerDecisionSubject = (accepted: boolean, eventName: string) =>
  accepted ? `Your talk is accepted | ${eventName}` : `About your talk submission | ${eventName}`
