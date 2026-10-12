import { emailShell, eyebrow, heading, paragraph, panel, list, chips, button, esc, firstNameOf, C } from "./layout"

interface AccessGrantedThankYouEmailProps {
  name: string
  sessionTitle: string
  sessionFormat?: string
  audienceLevel?: string
  firstTimeSpeaker?: boolean
  /**
   * True when the same person also signed up to help run the room. They get
   * ONE email, not two — this line is what acknowledges the second half.
   */
  alsoVolunteering?: boolean
}

export const AG_GREEN = "#00ff66"

/**
 * The Access Granted header: the security groups whose room it is, then the
 * event name in mono type. Type rather than an image, because Access Granted
 * has no raster wordmark on this host. No DEVSA here; it is in the footer.
 */
export const AG_HEADER = `
  <p style="margin: 0 0 10px 0; font-size: 12px; color: ${C.body}; text-transform: uppercase; letter-spacing: 1.5px;">BSides SATX &middot; DCG-SATX &middot; SAHA &middot; UTSA CyberJedis &middot; Alamo City Locksport</p>
  <p style="margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 28px; font-weight: 700; letter-spacing: 3px; color: ${AG_GREEN};">ACCESS GRANTED</p>`

export const AG_WHEN = `<strong style="color: ${C.text};">Wednesday, September 30, 2026</strong> &middot; 1:00&ndash;6:00 PM<br>Geekdom, 3rd Floor &middot; San Antonio, TX<br>Part of SA Startup + Tech Week, Sept 28&ndash;Oct 2`

export const AG_FOOTER = `Access Granted is run with <a href="https://www.bsidessatx.com/" style="color: ${C.text};">BSides SATX</a>, <a href="https://dcgsatx.com/" style="color: ${C.text};">DCG-SATX</a> and San Antonio&rsquo;s security groups, hosted by DEVSA.`

/**
 * Confirmation for Access Granted speaker submissions. The first-timer line
 * is conditional and concrete, because the call promises a practice run with
 * an experienced speaker; someone who ticked that box should see it noted.
 */
export function AccessGrantedThankYouEmail({
  name,
  sessionTitle,
  sessionFormat,
  audienceLevel,
  firstTimeSpeaker,
  alsoVolunteering,
}: AccessGrantedThankYouEmailProps): string {
  const note = (t: string) => `<p style="margin: 12px 0 0 0; font-size: 14px; color: ${C.body}; line-height: 1.6;">${t}</p>`
  return emailShell({
    title: "Your talk is in: Access Granted",
    preheader: `We received "${esc(sessionTitle)}" for Access Granted.`,
    header: AG_HEADER,
    bar: [AG_GREEN, AG_GREEN, AG_GREEN],
    footerNote: AG_FOOTER,
    body: `
      ${eyebrow("Talk received", AG_GREEN)}
      ${heading(`Thanks, ${firstNameOf(name)}. Your talk is in.`)}
      ${paragraph("Every other room that week is people talking about technology. This one is people taking it apart, and you just offered to be one of them.")}
      ${panel(
        `<p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.35;">${esc(sessionTitle)}</p>
        ${chips([sessionFormat, audienceLevel], { bg: "rgba(0, 255, 102, 0.12)", fg: "#6bffa6" })}
        ${firstTimeSpeaker ? note("You told us this would be your first conference talk. Welcome. One slot is held for exactly that, and we&rsquo;ll offer to pair you with an experienced speaker for a practice run before the day.") : ""}
        ${alsoVolunteering ? note("You also offered to help run the room. Thank you. An organizer will be in touch about that separately, whatever happens with the talk.") : ""}`,
        { label: "Your talk" }
      )}
      ${panel(
        list([
          "The call closes August 28, and we review everything after that",
          "There are three 40-minute slots. We accept three and one alternate",
          "You&rsquo;ll hear back by email either way",
          "Selected speakers get the run of show and A/V details",
        ]),
        { label: "What happens next" }
      )}
      ${paragraph(AG_WHEN)}
      ${button("https://www.devsa.community/events/access-granted", "See the event page", AG_GREEN, "#0a0a0a")}
    `,
  })
}

export function getAccessGrantedThankYouSubject(sessionTitle: string): string {
  return `Your talk is in: "${sessionTitle}" | Access Granted`
}
