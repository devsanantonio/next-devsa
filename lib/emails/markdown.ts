import { parseEventMarkdown, parseEventInline, type EventInline } from "@/lib/event-markdown"
import { paragraph, esc, C } from "./layout"

/**
 * Markdown written in the admin (the RichTextEditor's **bold**, *italic*,
 * headings, lists and links) as email HTML.
 *
 * It reads the markdown with the same parser as event descriptions
 * (lib/event-markdown.ts), so what the editor's Preview shows is what is sent,
 * and links are only ever http, https or mailto. Every piece of text is escaped
 * and every style is inline, since most mail clients ignore stylesheets.
 */
function inline(parts: EventInline[]): string {
  return parts
    .map((p) => {
      switch (p.type) {
        case "bold":
          return `<strong style="color: ${C.text}; font-weight: 600;">${esc(p.text)}</strong>`
        case "italic":
          return `<em>${esc(p.text)}</em>`
        case "link":
          return `<a href="${esc(p.href)}" style="color: ${C.pink}; text-decoration: underline;">${esc(p.text)}</a>`
        default:
          return esc(p.text)
      }
    })
    .join("")
}

const LIST = `margin: 0 0 20px 0; padding-left: 22px; font-size: 16px; color: ${C.body}; line-height: 1.6;`

export function markdownToEmailHtml(source: string): string {
  const blocks = parseEventMarkdown(source)
  return blocks
    .map((b, i) => {
      const last = i === blocks.length - 1
      switch (b.type) {
        case "heading":
          return `<h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: ${C.heading}; line-height: 1.3;">${inline(parseEventInline(b.text))}</h3>`
        case "ul":
        case "ol": {
          const tag = b.type
          const start = b.type === "ol" && b.start !== 1 ? ` start="${b.start}"` : ""
          const items = b.items.map((item) => `<li style="margin-bottom: 6px;">${inline(parseEventInline(item))}</li>`).join("")
          return `<${tag}${start} style="${LIST}${last ? " margin-bottom: 0;" : ""}">${items}</${tag}>`
        }
        default:
          return paragraph(inline(parseEventInline(b.text)), { last })
      }
    })
    .join("")
}
