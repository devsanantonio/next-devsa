import { emailShell, eyebrow, panel, button, esc, C } from "./layout"
import { markdownToEmailHtml } from "./markdown"
import { eventDescriptionToPlainText } from "@/lib/event-markdown"

interface GetInvolvedReplyProps {
  /** What the admin wrote, as markdown from the RichTextEditor: bold, italic, headings, lists, links. */
  message: string
  /** An optional call-to-action button under the reply. The URL must already be http(s). */
  cta?: { label: string; url: string } | null
  /** What the person sent through /get-involved, quoted below the reply. */
  original: string
  /** When they sent it, for the quote's label. */
  sentAt?: Date | null
}

/**
 * An admin's reply to a /get-involved inquiry, sent from the Get Involved
 * drawer in the admin portal (POST /api/admin/get-involved). The admin writes
 * the whole reply, greeting and sign-off included, with the event editor's
 * formatting; this sets it in the branded shell, adds the optional button, and
 * quotes what the person wrote, so the email reads as a continuation of their
 * note. Reply-to is the admin who sent it.
 *
 * Markdown in, through lib/emails/markdown.ts: text is escaped and links are
 * http(s) or mailto only, so nothing typed becomes raw HTML.
 */
export function GetInvolvedReplyEmail({ message, cta, original, sentAt }: GetInvolvedReplyProps): string {
  const body = markdownToEmailHtml(message)
  const when = sentAt
    ? sentAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" })
    : null

  return emailShell({
    title: "A reply from DEVSA",
    preheader: esc(eventDescriptionToPlainText(message, { singleLine: true }).slice(0, 120)),
    body: `
      ${eyebrow("Get involved with DEVSA")}
      <div style="margin-top: 16px;">${body}</div>
      ${cta ? `<div style="margin-top: 24px;">${button(esc(cta.url), esc(cta.label))}</div>` : ""}
      <div style="margin-top: 32px;">
        ${panel(
          `<div style="font-size: 14px; color: ${C.body}; line-height: 1.6; white-space: pre-wrap;">${esc(original)}</div>`,
          { label: when ? `What you wrote · ${when}` : "What you wrote" }
        )}
      </div>
    `,
  })
}
