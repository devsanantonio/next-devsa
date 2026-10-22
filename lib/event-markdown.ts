/**
 * The markdown an organizer can write in an event description, and the one
 * reading of it every surface shares.
 *
 * There used to be five readings. The event page had its own renderer, and the
 * calendar list, the JSON-LD, the RSS feed and the .ics builders each stripped
 * syntax their own way — or not at all, so a calendar invite carried literal
 * `**` and `[text](url)` into someone's Google Calendar. They disagreed about
 * what a bullet was: the page accepted `- ` and `* `, the list card stripped
 * only those, and a list pasted from a doc arrives with `•`, which none of
 * them knew. Parse here; render or flatten from the result.
 *
 * Supported, because it is what organizers type or paste:
 *   # / ## / ### heading
 *   - item, * item, • item (and the other bullet glyphs docs paste)
 *   1. item, 1) item
 *   **bold**, *italic*, [text](https://…), and bare https://… links
 * Each non-blank line is its own paragraph, so a single Enter is a line break.
 */

export type EventInline =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "link"; text: string; href: string }

export type EventBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; start: number; items: string[] }

const HEADING = /^#{1,6}\s+/
const BULLET = /^[-*•●○◦▪▫·‣]\s*/
const NUMBERED = /^(\d+)[.)]\s+/

/**
 * `*` and `-` need a space after them to be a bullet, or `*italic* opener` and
 * `-5°F tonight` would turn into list items. The glyphs pasted from docs are
 * never prose, so they count with or without one.
 */
function bulletMarker(line: string): RegExpMatchArray | null {
  const m = line.match(BULLET)
  if (!m) return null
  if ((m[0][0] === "-" || m[0][0] === "*") && !/\s/.test(m[0].slice(1))) return null
  return m
}

export function parseEventMarkdown(source: string): EventBlock[] {
  const blocks: EventBlock[] = []
  let list: Extract<EventBlock, { type: "ul" | "ol" }> | null = null

  const closeList = () => {
    if (list) blocks.push(list)
    list = null
  }

  for (const raw of (source || "").replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim()

    // A blank line between two bullets doesn't end the list; anything else does.
    if (line === "") continue

    const bullet = bulletMarker(line)
    const numbered = line.match(NUMBERED)

    if (bullet) {
      if (list?.type !== "ul") {
        closeList()
        list = { type: "ul", items: [] }
      }
      const item = line.slice(bullet[0].length)
      if (item) list.items.push(item)
    } else if (numbered) {
      if (list?.type !== "ol") {
        closeList()
        list = { type: "ol", start: Number(numbered[1]), items: [] }
      }
      list.items.push(line.slice(numbered[0].length))
    } else {
      closeList()
      if (HEADING.test(line)) {
        blocks.push({ type: "heading", text: line.replace(HEADING, "") })
      } else {
        blocks.push({ type: "paragraph", text: line })
      }
    }
  }
  closeList()

  return blocks.filter(b => b.type === "heading" || b.type === "paragraph" ? b.text : b.items.length)
}

// [text](url) | **bold** | *italic* | bare URL. Italic needs a non-space just
// inside each star, so "5 * 3 * 2" stays arithmetic.
const INLINE =
  /\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|\*(\S(?:.*?\S)?)\*|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g

/** Only web and mail links; anything else renders as its text. */
function safeHref(href: string): string | null {
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return href
  // "devsa.community/discord" written without a scheme still means the web.
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(href)) return `https://${href}`
  return null
}

export function parseEventInline(text: string): EventInline[] {
  const parts: EventInline[] = []
  let last = 0
  for (const m of text.matchAll(INLINE)) {
    const index = m.index ?? 0
    if (index > last) parts.push({ type: "text", text: text.slice(last, index) })
    if (m[1] !== undefined) {
      const href = safeHref(m[2])
      parts.push(href ? { type: "link", text: m[1], href } : { type: "text", text: m[1] })
    } else if (m[3] !== undefined) {
      parts.push({ type: "bold", text: m[3] })
    } else if (m[4] !== undefined) {
      parts.push({ type: "italic", text: m[4] })
    } else if (m[5] !== undefined) {
      parts.push({ type: "link", text: m[5], href: m[5] })
    }
    last = index + m[0].length
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) })
  return parts
}

/**
 * The description as plain text, for surfaces that can't render markup.
 *
 * Multi-line (the default) keeps the shape a reader would recognise — headings
 * on their own line, `•` and `1.` list markers, and a link's address beside its
 * text — for calendar notes, where the address is the only way to follow it.
 * `singleLine` collapses everything to one run of prose with link text only,
 * for list cards, feeds and JSON-LD.
 */
export function eventDescriptionToPlainText(
  source: string,
  { singleLine = false }: { singleLine?: boolean } = {},
): string {
  const inline = (text: string) =>
    parseEventInline(text)
      .map(p =>
        p.type === "link" && !singleLine && p.text !== p.href ? `${p.text} (${p.href})` : p.text,
      )
      .join("")

  const lines: string[] = []
  for (const block of parseEventMarkdown(source)) {
    if (block.type === "ul") {
      lines.push(block.items.map(item => (singleLine ? inline(item) : `• ${inline(item)}`)).join(singleLine ? "; " : "\n"))
    } else if (block.type === "ol") {
      lines.push(
        block.items
          .map((item, i) => (singleLine ? inline(item) : `${block.start + i}. ${inline(item)}`))
          .join(singleLine ? "; " : "\n"),
      )
    } else {
      lines.push(inline(block.text))
    }
  }

  if (!singleLine) return lines.join("\n\n")
  // A heading or line with no closing punctuation would run into the next one.
  return lines
    .map(l => (/[.!?:;]$/.test(l) ? l : `${l}.`))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}
