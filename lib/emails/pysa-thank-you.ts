import { emailShell, eyebrow, heading, paragraph, panel, list, chips, button, esc, firstNameOf, C } from "./layout"

interface PysaThankYouEmailProps {
  name: string
  sessionTitle: string
  sessionFormat?: string
  audienceLevel?: string
  considerFor?: string
}

const PY_BLUE = "#4a90d9"
const PY_YELLOW = "#ffdd00"

/**
 * Confirmation for PySanAntonio II speaker submissions. Built on the shared
 * shell, with the event's own header (the PySanAntonio wordmark as a PNG —
 * mail clients will not render SVG) and the PyTexas blue and yellow in place
 * of the DEVSA colors, so it reads as the conference rather than as DEVSA.
 */
export function PysaThankYouEmail({
  name,
  sessionTitle,
  sessionFormat,
  audienceLevel,
  considerFor,
}: PysaThankYouEmailProps): string {
  const header = `
    <p style="margin: 0 0 12px 0; font-size: 12px; color: ${C.body}; text-transform: uppercase; letter-spacing: 1.5px;">Alamo Python &middot; PyTexas Foundation &middot; DEVSA</p>
    <img src="https://www.devsa.community/pysa/wordmark-dark.png" alt="PySanAntonio II" width="240" style="display: block; width: 240px; max-width: 80%; height: auto; border: 0;" />`

  return emailShell({
    title: "Your talk is in: PySanAntonio II",
    preheader: `We received "${esc(sessionTitle)}" for PySanAntonio II.`,
    header,
    bar: [PY_BLUE, PY_YELLOW, PY_BLUE],
    footerNote: `PySanAntonio is hosted by <a href="https://www.meetup.com/alamo-python/" style="color: ${C.text};">Alamo Python</a> with the <a href="https://www.pytexas.org/" style="color: ${C.text};">PyTexas Foundation</a> and DEVSA.`,
    body: `
      ${eyebrow("Talk received", PY_BLUE)}
      ${heading(`Thanks, ${firstNameOf(name)}. Your talk is in.`)}
      ${paragraph(
        "Thanks for answering the call for speakers. San Antonio&rsquo;s Python conference is back for a second year, an afternoon of talks and people, and the schedule comes together from whoever raises a hand."
      )}
      ${panel(
        `<p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.35;">${esc(sessionTitle)}</p>
        ${chips([sessionFormat, audienceLevel], { bg: "rgba(74, 144, 217, 0.15)", fg: "#8fc0ea" })}
        ${considerFor ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: ${C.body};">Considered for: <strong style="color: ${C.text};">${esc(considerFor)}</strong></p>` : ""}`,
        { label: "Your talk" }
      )}
      ${panel(
        list([
          "The call closes September 25, and we review everything after that",
          "You&rsquo;ll hear back by email either way",
          "Selected speakers get the run of show and A/V details",
          "If it doesn&rsquo;t land a conference slot, it gets first look for Alamo Python&rsquo;s regular meetups",
        ]),
        { label: "What happens next" }
      )}
      ${paragraph(`<strong style="color: ${C.text};">Friday, October 2, 2026</strong> &middot; 1:00&ndash;6:00 PM<br>Geekdom, 3rd Floor &middot; San Antonio, TX<br>Part of SA Startup + Tech Week, Sept 28&ndash;Oct 2`)}
      ${button("https://www.devsa.community/events/pysanantonio", "See the conference page", PY_YELLOW, "#0a0a0a")}
    `,
  })
}

export function getPysaThankYouSubject(sessionTitle: string): string {
  return `Your talk is in: "${sessionTitle}" | PySanAntonio II`
}
