/**
 * Structured data for a `<script type="application/ld+json">`, safe to inline.
 *
 * JSON.stringify leaves `<` alone, so a string containing `</script>` closes
 * the tag and whatever follows runs as HTML. Event titles are typed by
 * organizers, so on /events/<slug> that was a way to run script on the site.
 * `<` is the same character to a JSON parser and inert to the HTML one.
 * Every JSON-LD script on the site goes through this, not JSON.stringify.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
