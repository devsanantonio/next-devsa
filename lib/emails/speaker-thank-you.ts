import { emailShell, eyebrow, heading, paragraph, panel, list, chips, esc, firstNameOf, C } from "./layout"

interface SpeakerThankYouEmailProps {
  name: string
  sessionTitle: string
  sessionFormat: string
  /** Set for a community group's standing call (lib/speaker-calls.ts), which has no closing date. */
  groupName?: string | null
}

/**
 * The fallback confirmation for a talk submitted to an event with no template
 * of its own (see the switch in app/api/call-for-speakers/route.ts).
 *
 * It used to be the More Human Than Human email, with that conference's
 * February 2026 date and venue, so any new call for speakers would have
 * confirmed the wrong event. It now names no event, date or place.
 */
export function SpeakerThankYouEmail({ name, sessionTitle, sessionFormat, groupName }: SpeakerThankYouEmailProps): string {
  // A group's call is rolling: nothing "closes", and the talk is for a meetup still to be scheduled.
  const next = groupName
    ? [
        `${esc(groupName)}&rsquo;s organizers read every talk that comes in`,
        "If yours fits an upcoming meetup, they&rsquo;ll reach out to set a date",
        "You&rsquo;ll hear back by email either way",
      ]
    : [
        "The organizers review every submission after the call closes",
        "You&rsquo;ll hear back by email either way",
        "Selected speakers get the schedule and A/V details",
      ]
  return emailShell({
    title: "Your talk proposal is in",
    preheader: `We received "${esc(sessionTitle)}".`,
    body: `
      ${eyebrow("Talk received")}
      ${heading(`Thanks, ${firstNameOf(name)}. Your talk is in.`)}
      ${paragraph(groupName ? `Thanks for offering a talk to ${esc(groupName)}.` : "Thanks for answering the call for speakers.")}
      ${panel(
        `<p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.35;">${esc(sessionTitle)}</p>
        ${chips([sessionFormat], { bg: "rgba(239, 66, 111, 0.15)", fg: "#ff8fab" })}`,
        { label: "Your talk" }
      )}
      ${panel(
        list(next),
        { label: "What happens next" }
      )}
      ${paragraph("Questions in the meantime? Reply to this email.", { last: true })}
    `,
    bar: [C.teal, C.pink, C.orange],
  })
}

export function getSpeakerThankYouSubject(sessionTitle: string): string {
  return `We received your talk: "${sessionTitle}" | DEVSA`
}
