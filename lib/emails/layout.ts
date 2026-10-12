/**
 * The shared shell and building blocks for every email DEVSA sends through
 * Resend.
 *
 * Before this, the templates came in three looks: an older one (gradient
 * cards, pink gradient buttons, emoji, and "DEVSA" typed in two colors as a
 * stand-in for the logo), a newer one matching the site, and a light one. This
 * is the newer one, written down once so the rest cannot drift from it.
 *
 * Brand rules that apply here:
 * - The logo is the primary cut as a PNG (mail clients will not render SVG),
 *   on the site's #0a0a0a ground. It is never set beside the word "DEVSA" —
 *   the mark already reads as DEVSA.
 * - Readable text never drops below #a3a3a3 on these grounds. #737373 measures
 *   about 4.3:1 on #0a0a0a and 3.8:1 on #141414, under the 4.5:1 floor, and
 *   the older templates used it, and darker, for labels and footers.
 * - Solid table cells, not CSS gradients: Outlook drops `linear-gradient`.
 * - No emoji in subjects or headings.
 */

export const SITE = "https://www.devsa.community"
export const LOGO_URL = "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.png"
export const EIN = "99-2066455"

export const C = {
  ground: "#0a0a0a",
  card: "#141414",
  border: "#262626",
  heading: "#ffffff",
  text: "#e5e5e5",
  body: "#a3a3a3",
  pink: "#ef426f",
  teal: "#00b2a9",
  orange: "#ff8200",
} as const

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

/**
 * Escape a value that came from a person (a name, a talk title). Existing
 * entities are left alone, because some routes already escape their input and
 * escaping twice would print "&amp;amp;".
 */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&(?!(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);)/gi, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function firstNameOf(name?: string | null): string {
  const first = (name ?? "").trim().split(/\s+/)[0]
  return first ? esc(first) : "there"
}

/** Small uppercase label above a heading or a panel. */
export function eyebrow(text: string, color: string = C.body): string {
  return `<p style="margin: 0 0 10px 0; font-family: ${MONO}; font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 1.5px;">${text}</p>`
}

export function heading(html: string): string {
  return `<h1 style="margin: 0 0 18px 0; font-size: 24px; font-weight: 800; color: ${C.heading}; line-height: 1.3; letter-spacing: -0.4px;">${html}</h1>`
}

export function paragraph(html: string, opts: { last?: boolean } = {}): string {
  return `<p style="margin: 0 0 ${opts.last ? 0 : 20}px 0; font-size: 16px; color: ${C.body}; line-height: 1.6;">${html}</p>`
}

/** Bold-ish inline emphasis in body copy. */
export function strong(html: string): string {
  return `<strong style="color: ${C.text}; font-weight: 600;">${html}</strong>`
}

/** An inset box: an optional label, then whatever goes inside. */
export function panel(inner: string, opts: { label?: string; accent?: string } = {}): string {
  const edge = opts.accent ? `border-left: 3px solid ${opts.accent};` : ""
  return `<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
  <tr>
    <td style="padding: 20px 22px; background-color: ${C.ground}; border: 1px solid ${C.border}; ${edge} border-radius: 12px;">
      ${opts.label ? eyebrow(opts.label) : ""}
      ${inner}
    </td>
  </tr>
</table>`
}

/** Label/value rows, e.g. a receipt. Rows with an empty value are dropped. */
export function rows(items: [label: string, valueHtml: string | null | undefined][]): string {
  const kept = items.filter(([, v]) => v)
  return `<table role="presentation" style="width: 100%; border-collapse: collapse;">
${kept
  .map(
    ([label, value], i) => `  <tr>
    <td style="padding: 9px 16px 9px 0; ${i < kept.length - 1 ? `border-bottom: 1px solid ${C.border};` : ""} font-size: 14px; color: ${C.body}; vertical-align: top; white-space: nowrap;">${label}</td>
    <td style="padding: 9px 0; ${i < kept.length - 1 ? `border-bottom: 1px solid ${C.border};` : ""} font-size: 14px; color: ${C.text}; font-weight: 600; text-align: right; vertical-align: top;">${value}</td>
  </tr>`
  )
  .join("\n")}
</table>`
}

export function list(items: string[]): string {
  return `<ul style="margin: 0; padding: 0 0 0 20px; color: ${C.body}; font-size: 15px; line-height: 1.7;">
${items.map((i) => `  <li style="margin-bottom: 6px;">${i}</li>`).join("\n")}
</ul>`
}

export function chips(labels: (string | null | undefined)[], tone: { bg: string; fg: string }): string {
  return labels
    .filter(Boolean)
    .map(
      (l) =>
        `<span style="display: inline-block; margin: 0 6px 6px 0; padding: 4px 12px; background-color: ${tone.bg}; border-radius: 999px; font-size: 13px; color: ${tone.fg}; font-weight: 600;">${esc(l)}</span>`
    )
    .join("")
}

export function button(href: string, label: string, color: string = C.pink, textColor = "#ffffff"): string {
  return `<table role="presentation" style="border-collapse: collapse; margin: 8px 0 0 0;">
  <tr>
    <td style="border-radius: 8px; background-color: ${color};">
      <a href="${href}" style="display: inline-block; padding: 13px 26px; font-size: 14px; font-weight: 700; color: ${textColor}; text-decoration: none;">${label}</a>
    </td>
  </tr>
</table>`
}

/** The site's three logo colors as a 4px rule across the top of the card. */
function brandBar(colors: [string, string, string]): string {
  return `<table role="presentation" style="width: 100%; border-collapse: collapse;">
  <tr>
    <td width="33.33%" height="4" style="background-color: ${colors[0]}; line-height: 4px; font-size: 0;">&nbsp;</td>
    <td width="33.33%" height="4" style="background-color: ${colors[1]}; line-height: 4px; font-size: 0;">&nbsp;</td>
    <td width="33.34%" height="4" style="background-color: ${colors[2]}; line-height: 4px; font-size: 0;">&nbsp;</td>
  </tr>
</table>`
}

const footerLink = (href: string, label: string) =>
  `<a href="${href}" style="color: ${C.text}; text-decoration: underline; font-size: 14px;">${label}</a>`

interface ShellOptions {
  /** The <title>, and what some clients show as the subject in previews. */
  title: string
  /** The grey preview line in an inbox list. Keep it a sentence. */
  preheader: string
  /** The card's contents. */
  body: string
  /**
   * Replaces the logo above the card — an event lockup, for instance. Event
   * emails keep their own identity; everything else carries the DEVSA mark.
   */
  header?: string
  /** The 4px rule across the card. Defaults to the logo's three colors. */
  bar?: [string, string, string]
  /**
   * "public" for mail to people outside DEVSA; "internal" for notifications
   * to an organizer, which drop the logo and the site footer.
   */
  audience?: "public" | "internal"
  /** A line above the footer links, e.g. partner names on an event email. */
  footerNote?: string
}

export function emailShell({
  title,
  preheader,
  body,
  header,
  bar = [C.teal, C.pink, C.orange],
  audience = "public",
  footerNote,
}: ShellOptions): string {
  const isPublic = audience === "public"
  const top = isPublic
    ? header ??
      `<img src="${LOGO_URL}" alt="DEVSA" width="96" style="display: block; width: 96px; height: auto; border: 0;" />`
    : ""

  const footer = isPublic
    ? `${footerNote ? `<p style="margin: 0 0 14px 0; font-size: 13px; color: ${C.body}; line-height: 1.6;">${footerNote}</p>` : ""}
<p style="margin: 0 0 14px 0;">
  ${footerLink(`${SITE}/events`, "Community Calendar")}
  <span style="color: ${C.body};">&nbsp;&middot;&nbsp;</span>
  ${footerLink(`${SITE}/buildingtogether`, "Building Together")}
  <span style="color: ${C.body};">&nbsp;&middot;&nbsp;</span>
  ${footerLink(`${SITE}/about`, "About")}
</p>
<p style="margin: 0; font-size: 12px; color: ${C.body}; line-height: 1.6;">
  DEVSA &middot; San Antonio, Texas &middot; a 501(c)(3) nonprofit &middot; EIN ${EIN}
</p>`
    : `<p style="margin: 0; font-size: 12px; color: ${C.body}; line-height: 1.6;">
  Sent automatically by devsa.community. Everything here is also in the
  <a href="${SITE}/admin" style="color: ${C.text};">admin portal</a>.
</p>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${C.ground}; font-family: ${FONT};">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: ${C.ground};">${preheader}</div>
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${C.ground};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          ${top ? `<tr><td style="padding: 0 4px 24px 4px;">${top}</td></tr>` : ""}
          <tr>
            <td style="background-color: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; overflow: hidden;">
              ${brandBar(bar)}
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 32px 32px 36px 32px;">
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 4px 0 4px;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Label-over-value fields for internal notifications, where values run long
 * (a bio, a message) and right-aligned receipt rows would read badly.
 */
export function fields(items: [label: string, valueHtml: string | null | undefined][]): string {
  return items
    .filter(([, v]) => v)
    .map(
      ([label, value]) => `<div style="margin: 0 0 14px 0;">
  <p style="margin: 0 0 3px 0; font-size: 12px; color: ${C.body}; text-transform: uppercase; letter-spacing: 1px;">${label}</p>
  <div style="font-size: 15px; color: ${C.text}; line-height: 1.6; white-space: pre-wrap;">${value}</div>
</div>`
    )
    .join("\n")
}
