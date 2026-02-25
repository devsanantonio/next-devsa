import sanitize from "sanitize-html"

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allows safe formatting tags while stripping dangerous elements.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "strong", "em", "b", "i", "u", "s", "del",
      "a", "code", "pre", "blockquote",
      "table", "thead", "tbody", "tr", "th", "td",
      "img", "span", "div", "sub", "sup",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "width", "height"],
      "*": ["class", "id"],
    },
  })
}
