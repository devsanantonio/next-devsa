import { demoDayInterestLabel } from "@/lib/demo-day"
import { emailShell, eyebrow, heading, panel, fields, esc, C } from "./layout"

interface DemoDayInquiryEmailProps {
  name: string
  email: string
  organization: string
  title?: string | null
  interest: string
  industry?: string | null
  message: string
}

export function getDemoDayInquirySubject({
  interest,
  organization,
}: Pick<DemoDayInquiryEmailProps, "interest" | "organization">): string {
  return `Confluencia: ${demoDayInterestLabel(interest)} inquiry from ${organization}`
}

/**
 * The internal notification for a Confluencia inquiry. The interest and the
 * organization lead, the message is in full, and reply-to is the person who
 * wrote, so answering is one click.
 *
 * Values arrive through sanitizeInput (tags stripped, entities escaped); esc()
 * leaves existing entities alone, so passing them through it is safe.
 */
export function DemoDayInquiryEmail({
  name,
  email,
  organization,
  title,
  interest,
  industry,
  message,
}: DemoDayInquiryEmailProps): string {
  return emailShell({
    title: "Confluencia inquiry",
    preheader: `${esc(demoDayInterestLabel(interest))} inquiry from ${esc(organization)}.`,
    audience: "internal",
    body: `
      ${eyebrow("Confluencia &middot; a DEVSA Demo Day", C.pink)}
      ${heading(`${esc(demoDayInterestLabel(interest))} inquiry`)}
      ${fields([
        ["Organization", esc(organization)],
        ["Name", esc(name)],
        ["Title", title ? esc(title) : null],
        ["Email", `<a href="mailto:${esc(email)}" style="color: ${C.text};">${esc(email)}</a>`],
        ["Industry", industry ? esc(industry) : null],
      ])}
      ${panel(`<div style="font-size: 15px; color: ${C.text}; line-height: 1.6; white-space: pre-wrap;">${esc(message)}</div>`, { label: "Message" })}
    `,
  })
}
