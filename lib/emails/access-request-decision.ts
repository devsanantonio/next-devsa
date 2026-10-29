import { emailShell, eyebrow, heading, paragraph, panel, rows, button, esc, firstNameOf, SITE } from "./layout"

/**
 * Two emails around an organizer access request.
 *
 * The alert goes to DEVSA when a request arrives, so it's approved while the
 * person still cares (Get Involved inquiries already alert; access requests
 * didn't, and waited until someone happened to open the admin).
 *
 * The decline goes to the requester when an admin declines, because the
 * "request received" email promises an answer either way. Kind and short: most
 * declines are a group that's already represented, or one that isn't a tech
 * group, and the calendar is still open to them.
 */

export function AccessRequestAlertEmail({
  name,
  email,
  communityOrg,
  message,
}: {
  name: string
  email: string
  communityOrg: string
  message?: string | null
}): string {
  return emailShell({
    audience: "internal",
    title: `Access request: ${esc(communityOrg)}`,
    preheader: `${esc(name)} wants organizer access for ${esc(communityOrg)}.`,
    body: `
      ${eyebrow("New access request")}
      ${heading(`${esc(name)} wants organizer access.`)}
      ${panel(rows([["Name", esc(name)], ["Email", esc(email)], ["Group", esc(communityOrg)], ["Note", message ? esc(message) : null]]), { label: "The request" })}
      ${button(`${SITE}/admin?tab=access`, "Review it in the admin")}
    `,
  })
}

export function getAccessRequestAlertSubject(name: string, communityOrg: string): string {
  return `Access request: ${name} (${communityOrg})`
}

export function AccessRequestDeclinedEmail({ name, communityOrg }: { name: string; communityOrg: string }): string {
  return emailShell({
    title: "Your organizer access request",
    preheader: `About your request for ${esc(communityOrg)}.`,
    body: `
      ${eyebrow("About your request")}
      ${heading(`Thanks for reaching out, ${firstNameOf(name)}.`)}
      ${paragraph(
        `We&rsquo;re not able to set up organizer access for ${esc(communityOrg)} right now. Often that&rsquo;s because the group already has an organizer on DEVSA, or isn&rsquo;t one we list on the calendar yet.`
      )}
      ${paragraph("If you think we&rsquo;ve got it wrong, or something&rsquo;s changed, reply to this email. A person reads it.")}
      ${button(`${SITE}/events`, "See the community calendar")}
    `,
  })
}

export function getAccessRequestDeclinedSubject(): string {
  return "About your DEVSA organizer access request"
}
