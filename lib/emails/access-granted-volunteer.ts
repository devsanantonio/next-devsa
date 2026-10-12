import { emailShell, eyebrow, heading, paragraph, panel, button, esc, firstNameOf, C } from "./layout"
import { AG_GREEN, AG_HEADER, AG_WHEN, AG_FOOTER } from "./access-granted-thank-you"

interface AccessGrantedVolunteerEmailProps {
  name: string
  /**
   * Optional. Access Granted has no role picker, so this is usually null and
   * the block that shows it is skipped rather than printing an empty card.
   */
  role?: string | null
  org?: string | null
}

/**
 * Confirmation for someone who signed up to help run Access Granted. Shorter
 * than the speaker email on purpose: a volunteer is already in, so this only
 * says who will be in touch.
 */
export function AccessGrantedVolunteerEmail({ name, role, org }: AccessGrantedVolunteerEmailProps): string {
  const detail =
    role || org
      ? panel(
          `<p style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">${esc(role || "Wherever you're needed")}</p>
          ${org ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: ${C.body};">With: <strong style="color: ${C.text};">${esc(org)}</strong></p>` : ""}`,
          { label: "You offered to help with" }
        )
      : ""
  return emailShell({
    title: "You're on the crew: Access Granted",
    preheader: "An organizer will be in touch with times and what to bring.",
    header: AG_HEADER,
    bar: [AG_GREEN, AG_GREEN, AG_GREEN],
    footerNote: AG_FOOTER,
    body: `
      ${eyebrow("Volunteer signup", AG_GREEN)}
      ${heading(`Thanks, ${firstNameOf(name)}. You&rsquo;re on the crew.`)}
      ${paragraph("Five hours of drop-in tables only works because people turn up early and stay late to run them. An organizer will be in touch with times, what to bring, and where to find us on the day.")}
      ${detail}
      ${paragraph(AG_WHEN)}
      ${button("https://www.devsa.community/events/access-granted", "See the event page", AG_GREEN, "#0a0a0a")}
    `,
  })
}

export function getAccessGrantedVolunteerSubject(): string {
  return "You're on the crew: Access Granted, Sept 30"
}
