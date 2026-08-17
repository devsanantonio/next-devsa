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
const LIGHT_PARTNER_IDS = ["youth-code-jam"]

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

/** `"invert"` when the mark is light artwork, otherwise `""`. */
export function logoOnLight(logo: {
  id?: string
  name?: string
  type?: "community" | "partner"
}): string {
  const isLightPartner = !!logo.id && LIGHT_PARTNER_IDS.includes(logo.id)
  const name = (logo.name || "").toLowerCase()
  const isLightCommunity = LIGHT_COMMUNITY_NAMES.some((n) => name.includes(n))

  // `type` narrows the check where the caller knows it (the mixed logo walls).
  // Where it does not — a detail page rendering one known record — matching on
  // either is correct, because ids and names do not collide across the two.
  if (logo.type === "partner") return isLightPartner ? "invert" : ""
  if (logo.type === "community") return isLightCommunity ? "invert" : ""
  return isLightPartner || isLightCommunity ? "invert" : ""
}
