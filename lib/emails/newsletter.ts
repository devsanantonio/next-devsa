import { emailShell, heading, paragraph, esc, C } from "./layout"

/**
 * The newsletter. Written in the admin as plain text: a blank line starts a
 * new paragraph, a line starting "- " is a bullet, and web addresses become
 * links. Everything else is escaped, so nothing typed can become markup.
 *
 * The footer carries the two things every send must: the postal address and
 * the unsubscribe link (lib/newsletter.ts). Free of server-only imports, so the
 * composer previews exactly this in the browser.
 */

const linkify = (escaped: string) =>
  escaped.replace(
    /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g,
    (url) => `<a href="${url}" style="color: #ffffff; text-decoration: underline;">${url}</a>`
  )

function bodyHtml(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n")
      if (lines.every((l) => /^\s*-\s+/.test(l))) {
        const items = lines.map((l) => `<li style="margin: 0 0 8px 0;">${linkify(esc(l.replace(/^\s*-\s+/, "")))}</li>`).join("")
        return `<ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 16px; color: ${C.body}; line-height: 1.6;">${items}</ul>`
      }
      return paragraph(linkify(esc(block)).replace(/\n/g, "<br />"))
    })
    .join("")
}

export function NewsletterEmail({
  subject,
  body,
  unsubscribeUrl,
  postalAddress,
}: {
  subject: string
  body: string
  unsubscribeUrl: string
  postalAddress: string
}): string {
  return emailShell({
    title: esc(subject),
    preheader: esc(body.replace(/\s+/g, " ").trim().slice(0, 110)),
    body: `
      ${heading(esc(subject))}
      ${bodyHtml(body)}
    `,
    footerNote: `You&rsquo;re getting this because you subscribed to DEVSA updates. <a href="${unsubscribeUrl}" style="color: ${C.text}; text-decoration: underline;">Unsubscribe</a><br />DEVSA &middot; ${esc(postalAddress)}`,
  })
}
