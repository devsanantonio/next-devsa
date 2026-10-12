import { emailShell, eyebrow, heading, panel, fields, chips, esc, C } from "./layout"
import { AG_GREEN } from "./access-granted-thank-you"

interface AccessGrantedInternalEmailProps {
  kind: "talk" | "volunteer"
  name: string
  email: string
  /** Talk fields — absent on a volunteer signup. */
  sessionTitle?: string | null
  sessionFormat?: string | null
  audienceLevel?: string | null
  abstract?: string | null
  bio?: string | null
  company?: string | null
  linkedin?: string | null
  firstTimeSpeaker?: boolean
  /** Free text from either path. */
  notes?: string | null
  /** True when one person submitted a talk AND offered to help. */
  alsoVolunteering?: boolean
}

/**
 * The organizer-facing notification for either half of the Access Granted
 * call. Written for whoever acts on it: mostly data, with the full abstract
 * so a talk can be judged from the inbox. Reply-to is the submitter.
 */
export function AccessGrantedInternalEmail({
  kind,
  name,
  email,
  sessionTitle,
  sessionFormat,
  audienceLevel,
  abstract,
  bio,
  company,
  linkedin,
  firstTimeSpeaker,
  notes,
  alsoVolunteering,
}: AccessGrantedInternalEmailProps): string {
  const isTalk = kind === "talk"
  return emailShell({
    title: "Access Granted submission",
    preheader: isTalk ? `Talk from ${esc(name)}: ${esc(sessionTitle)}` : `Volunteer signup from ${esc(name)}`,
    audience: "internal",
    bar: [AG_GREEN, AG_GREEN, AG_GREEN],
    body: `
      ${eyebrow("Access Granted", AG_GREEN)}
      ${heading(isTalk ? "New talk submission" : "New volunteer signup")}
      ${chips([firstTimeSpeaker ? "First-time speaker" : null, alsoVolunteering ? "Also volunteering" : null], { bg: "rgba(0, 255, 102, 0.12)", fg: "#6bffa6" })}
      ${fields([
        ["Name", esc(name)],
        ["Email", `<a href="mailto:${esc(email)}" style="color: ${C.text};">${esc(email)}</a>`],
        ["Company", company ? esc(company) : null],
        ["Link", linkedin ? esc(linkedin) : null],
        ["Talk", sessionTitle ? esc(sessionTitle) : null],
        ["Format", sessionFormat ? esc(sessionFormat) : null],
        ["Audience", audienceLevel ? esc(audienceLevel) : null],
        ["Bio", bio ? esc(bio) : null],
        ["Notes", notes ? esc(notes) : null],
      ])}
      ${abstract ? panel(`<div style="font-size: 15px; color: ${C.text}; line-height: 1.6; white-space: pre-wrap;">${esc(abstract)}</div>`, { label: "Abstract" }) : ""}
    `,
  })
}

export function getAccessGrantedInternalSubject({
  kind,
  name,
  sessionTitle,
}: {
  kind: "talk" | "volunteer"
  name: string
  sessionTitle?: string | null
}): string {
  return kind === "talk"
    ? `[Access Granted] Talk from ${name}: "${sessionTitle ?? "untitled"}"`
    : `[Access Granted] Volunteer: ${name}`
}
