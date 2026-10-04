/**
 * Which community and partner marks are white-on-transparent, and so need
 * inverting to read on the site's white surfaces.
 *
 * A checked-in list, deliberately. A per-record field set in the admin was
 * built and removed: it was more machinery than the problem needed once the
 * dark plates came off the detail pages, which is what actually caused the
 * bug it was meant to solve.
 *
 * The list is here rather than copied into each component because four
 * surfaces need it — the two logo walls and both detail-page hero marks, the
 * latter precisely because they no longer sit on a dark plate. It used to live
 * in three files and had already disagreed with itself.
 *
 * ## Its one failure mode, so nobody is surprised by it again
 *
 * These are keyed on the record, not the file. Swap a white logo for a black
 * one in the admin and the entry keeps inverting it — which is exactly what
 * happened to 434 MEDIA: a black wordmark replaced a white one, invert turned
 * it white again, and it disappeared into the page.
 *
 * So: changing a logo means checking this file. That is the trade for not
 * carrying a schema field and an admin control.
 */

/** Partner ids whose artwork is light. */
const LIGHT_PARTNER_IDS = ["youth-code-jam", "the-creative-futures"]

/**
 * Community names whose artwork is light, matched as a lowercase substring —
 * the same loose match the components used before, so "Unreal Engine SA"
 * matches on "unreal engine".
 */
const LIGHT_COMMUNITY_NAMES = [
  "aws user group",
  "alamo city locksport",
  "alamo python",
  "alamo tech collective",
  "datanauts",
  "greater gaming society",
  "red hat user group",
  "unreal engine",
  "women in data",
]

/**
 * Whether this mark's own artwork is light. The two exported helpers are just
 * the two answers to that question, so a logo can never be classified one way
 * for a white surface and the other way for a black one.
 */
function isLightArtwork(logo: {
  id?: string
  name?: string
  type?: "community" | "partner"
}): boolean {
  const isLightPartner = !!logo.id && LIGHT_PARTNER_IDS.includes(logo.id)
  const name = (logo.name || "").toLowerCase()
  const isLightCommunity = LIGHT_COMMUNITY_NAMES.some((n) => name.includes(n))

  // `type` narrows the check where the caller knows it (the mixed logo walls).
  // Where it does not — a detail page rendering one known record — matching on
  // either is correct, because ids and names do not collide across the two.
  if (logo.type === "partner") return isLightPartner
  if (logo.type === "community") return isLightCommunity
  return isLightPartner || isLightCommunity
}

/**
 * Partner ids whose artwork is dark — black or near-black on transparent, and
 * so lost on a near-black card.
 *
 * Its own list rather than "everything not in the light list", which is the
 * mistake this replaces. That treated "not white" as "needs inverting" and so
 * flattened Tech Bloc, DEF CON, SAHA, BSides and PyTexas — all of which are
 * *colour*, and colour reads on either ground. Marks come in three kinds, not
 * two, and only the third needs help here.
 *
 * One entry, and that is not an oversight. Every co-host mark on the site was
 * rendered uninverted on #0a0a0a to build this: 434 MEDIA was the only one
 * that disappeared. SA Startup Week was expected to be here too and is not —
 * its lockup is magenta and white and holds up fine, which contradicts a note
 * left on the host plate in c020d7f.
 */
const DARK_PARTNER_IDS = ["434media"]

/**
 * `"brightness-0 invert"` when the mark would be lost on a dark ground.
 *
 * Flattened to a white silhouette rather than inverted, because inverting a
 * colour is a hue rotation — a red wordmark would arrive cyan. A mark dark
 * enough to need this has no colour worth keeping anyway.
 */
export function logoOnDark(logo: {
  id?: string
  name?: string
  type?: "community" | "partner"
}): string {
  return !!logo.id && DARK_PARTNER_IDS.includes(logo.id) ? "brightness-0 invert" : ""
}

/** `"invert"` when the mark is light artwork, otherwise `""`. */
export function logoOnLight(logo: {
  id?: string
  name?: string
  type?: "community" | "partner"
}): string {
  return isLightArtwork(logo) ? "invert" : ""
}

/**
 * Marks that need a different file on light surfaces, not a filter.
 *
 * The third case, and the one neither helper above can serve. `invert` works
 * on a mark that is uniformly light; `brightness-0 invert` works on one that
 * is uniformly dark. Both assume a single tone, and a filter cannot tell the
 * part of a mark that needs help from the part that is already fine.
 *
 * Measured against the surfaces these actually render on — white, and #0a0a0a:
 *
 * - **Linux San Antonio** is three marks in one lockup. "LINUX" is #f0f0f0,
 *   1.14:1 on white — not faint, invisible, which is how this was reported.
 *   "SAN ANTONIO" is gold at 1.71:1 and also failing. The penguin is black and
 *   white and reads anywhere. Inverting the lockup would fix the wordmark and
 *   ruin the other two.
 * - **Alamo Agents** is gold #c09048 line art at 2.87:1 on white, under the
 *   3:1 floor WCAG 1.4.11 sets for graphical objects, and 6.91:1 on #0a0a0a.
 *   One colour, but no filter raises its contrast without rotating the hue.
 *
 * So a light-ground variant of each file, which is what a brand guide would
 * call it. In `public/community-logos/`, generated from the records' own
 * artwork, checked in so they are diffable:
 *
 * - Linux SA — the wordmark region (right of the 458–545px gap) only. The
 *   achromatic "LINUX" is inverted rather than flattened, so its baked-in
 *   antialiasing keeps its gradation; the gold is taken down to 4.5:1. The
 *   penguin is not touched at all.
 * - Alamo Agents — one value scale across the mark, the smallest that reaches
 *   4.5:1, so it stays the gold the group chose rather than becoming brown.
 *
 * A dark plate was tried first and rejected: it read as a sticker among marks
 * that otherwise sit bare on the canvas. Their own sites were checked for a
 * better file before any of this — alamoagents.org serves the identical
 * artwork byte for byte, and the copy in next-sasw differs from ours only in
 * compression. Neither has a light variant to borrow.
 *
 * **This means the site ships altered versions of two groups' marks.** It is
 * the standard light-background treatment and the alternative was one of them
 * being invisible, but it is worth replacing with whatever they supply when
 * asked. Ask Alamo Agents for the source of the solid silhouette their own
 * site uses at small sizes — it is the right mark for a 48px slot, and they
 * only serve it at 26px.
 */
const LIGHT_GROUND_SRC: Array<[string, string]> = [
  ["alamo agents", "/community-logos/alamo-agents-light.webp"],
  ["linux san antonio", "/community-logos/linux-satx-light.webp"],
]

/**
 * The file to render on a light surface — the light-ground variant where one
 * exists, otherwise the record's own logo unchanged.
 *
 * Matched on name as a lowercase substring, the same loose match
 * LIGHT_COMMUNITY_NAMES uses. Both entries are communities; a partner would be
 * keyed by id, as in the list above.
 *
 * No counterpart for dark surfaces. These marks were drawn for a dark ground
 * and the original file is already right there.
 */
export function logoSrcOnLight(
  logo: { id?: string; name?: string; type?: "community" | "partner" },
  src: string
): string {
  const name = (logo.name || "").toLowerCase()
  const match = LIGHT_GROUND_SRC.find(([key]) => name.includes(key))
  return match ? match[1] : src
}
