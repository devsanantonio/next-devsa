import { emailShell, eyebrow, heading, paragraph, panel, fields, button, esc, firstNameOf, groupMark, C, SITE } from "./layout"

interface GroupTalkNotifyProps {
  groupName: string
  name: string
  email: string
  sessionTitle: string
  sessionFormat?: string | null
  audienceLevel?: string | null
  abstract: string
  bio?: string | null
  link?: string | null
  question?: string | null
  answer?: string | null
  /** Shared from the open pool by an admin, rather than sent to the group directly. */
  suggested?: boolean
  /** The group's logo, already a URL mail clients show (lib/email-logo.ts). */
  groupLogo?: string | null
}

/**
 * Sent to a group's organizers when a talk comes in through its call for
 * speakers (lib/speaker-calls.ts). Mostly data, with the full abstract, so a talk
 * can be judged from the inbox; reply-to is the speaker. Accepting or declining
 * happens in the admin's Speakers tab, which this links to.
 */
export function GroupTalkNotifyEmail(p: GroupTalkNotifyProps): string {
  return emailShell({
    title: `New talk for ${esc(p.groupName)}`,
    preheader: `${esc(p.name)}: ${esc(p.sessionTitle)}`,
    audience: "internal",
    body: `
      ${groupMark(p.groupLogo, p.groupName)}
      ${eyebrow(p.suggested ? `${esc(p.groupName)} · suggested by DEVSA` : `${esc(p.groupName)} · call for speakers`)}
      ${heading(p.suggested ? `DEVSA thinks this talk fits ${esc(p.groupName)}` : "A new talk came in")}
      ${fields([
        ["Talk", esc(p.sessionTitle)],
        ["Speaker", esc(p.name)],
        ["Email", `<a href="mailto:${esc(p.email)}" style="color: ${C.text};">${esc(p.email)}</a>`],
        ["Format", p.sessionFormat ? esc(p.sessionFormat) : null],
        ["Audience", p.audienceLevel ? esc(p.audienceLevel) : null],
        ["Link", p.link ? esc(p.link) : null],
        ["Bio", p.bio ? esc(p.bio) : null],
        [p.question ? esc(p.question) : "Your question", p.answer ? esc(p.answer) : null],
      ])}
      ${panel(`<div style="font-size: 15px; color: ${C.text}; line-height: 1.6; white-space: pre-wrap;">${esc(p.abstract)}</div>`, { label: "Abstract" })}
      ${button(`${SITE}/admin?tab=speakers`, "Review it in the admin")}
    `,
  })
}

export function getGroupTalkNotifySubject(groupName: string, sessionTitle: string, suggested = false): string {
  return `[${groupName}] ${suggested ? "Suggested talk" : "New talk"}: "${sessionTitle}"`
}

/**
 * To the speaker, when an admin shares their open-pool talk with a group: so they
 * know who may contact them, which is what they consented to.
 */
export function TalkSharedEmail({ name, sessionTitle, groupName, groupId, groupLogo }: { name: string; sessionTitle: string; groupName: string; groupId: string; groupLogo?: string | null }): string {
  return emailShell({
    title: `Your talk is with ${esc(groupName)}`,
    preheader: `We shared "${esc(sessionTitle)}" with ${esc(groupName)}'s organizers.`,
    body: `
      ${groupMark(groupLogo, groupName)}
      ${eyebrow("Talk shared")}
      ${heading(`${firstNameOf(name)}, ${esc(groupName)} has your talk.`)}
      ${paragraph(`We shared &ldquo;${esc(sessionTitle)}&rdquo; with ${esc(groupName)}&rsquo;s organizers, who run one of San Antonio&rsquo;s tech community groups. If it fits an upcoming meetup, they&rsquo;ll email you to set a date.`)}
      ${button(`${SITE}/buildingtogether/${encodeURIComponent(groupId)}`, `About ${esc(groupName)}`)}
      ${paragraph("Questions? Reply to this email.", { last: true })}
    `,
  })
}
