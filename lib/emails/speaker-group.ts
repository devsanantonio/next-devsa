import { emailShell, eyebrow, heading, panel, fields, button, esc, C, SITE } from "./layout"

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
      ${eyebrow(`${esc(p.groupName)} · call for speakers`)}
      ${heading("A new talk came in")}
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

export function getGroupTalkNotifySubject(groupName: string, sessionTitle: string): string {
  return `[${groupName}] New talk: "${sessionTitle}"`
}
