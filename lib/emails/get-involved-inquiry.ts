import { getInvolvedPathLabel, partnerWayLabel } from "@/lib/get-involved"
import { emailShell, eyebrow, heading, panel, fields, esc, C } from "./layout"

interface GetInvolvedInquiryEmailProps {
  path: string
  way: string | null
  name: string
  email: string
  organization: string | null
  title: string | null
  event: string | null
  subject?: string | null
  message: string
}

export function getGetInvolvedSubject({
  path,
  way,
  name,
  organization,
}: Pick<GetInvolvedInquiryEmailProps, "path" | "way" | "name" | "organization">): string {
  const what = partnerWayLabel(way) ?? getInvolvedPathLabel(path)
  return `Get Involved: ${what}, from ${organization || name}`
}

/**
 * The internal alert for a /get-involved submission. Written for whoever
 * answers it: what they want leads, the message is in full, and reply-to is
 * the person who wrote. Values arrive through sanitizeInput; esc() leaves
 * existing entities alone, so passing them through it is safe.
 */
export function GetInvolvedInquiryEmail(i: GetInvolvedInquiryEmailProps): string {
  const what = partnerWayLabel(i.way) ?? getInvolvedPathLabel(i.path)
  return emailShell({
    title: "Get Involved inquiry",
    preheader: `${esc(what)}, from ${esc(i.organization || i.name)}.`,
    audience: "internal",
    body: `
      ${eyebrow(`Get Involved &middot; ${esc(getInvolvedPathLabel(i.path))}`, C.pink)}
      ${heading(esc(what))}
      ${fields([
        ["Name", esc(i.name)],
        ["Organization", i.organization ? esc(i.organization) : null],
        ["Title", i.title ? esc(i.title) : null],
        ["Email", `<a href="mailto:${esc(i.email)}" style="color: ${C.text};">${esc(i.email)}</a>`],
        ["Event", i.event ? esc(i.event) : null],
        ["About", i.subject ? esc(i.subject) : null],
      ])}
      ${panel(`<div style="font-size: 15px; color: ${C.text}; line-height: 1.6; white-space: pre-wrap;">${esc(i.message)}</div>`, { label: "Message" })}
    `,
  })
}
