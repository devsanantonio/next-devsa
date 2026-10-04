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
 * Marks that are multi-tonal and only legible on a dark ground.
 *
 * The third case, and the one neither helper above can serve. `invert` works
 * on a mark that is uniformly light; `brightness-0 invert` works on one that
 * is uniformly dark. Both are wrong for a mark carrying two or three tones at
 * once, because a filter cannot tell the part that needs help from the part
 * that is already fine.
 *
 * Measured against the surfaces they actually render on — white, and #0a0a0a:
 *
 * - **Linux San Antonio** is three marks in one lockup. "LINUX" is #f0f0f0,
 *   which is 1.14:1 on white — invisible, which is how this was noticed.
 *   "SAN ANTONIO" is gold at 1.71:1, also failing. The penguin is black and
 *   white and reads on anything. Inverting would fix the wordmark and ruin the
 *   penguin and the gold.
 * - **Alamo Agents** is gold #c09048 line art at 2.87:1 on white, under the
 *   3:1 floor WCAG 1.4.11 sets for graphical objects, and 6.91:1 on #0a0a0a.
 *   One colour, but no filter raises contrast without changing the hue the
 *   group chose.
 *
 * A ground, then, rather than a filter: the artwork is left exactly as its
 * owner drew it and is given the background it was drawn for.
 *
 * Dark plates used to sit under every mark on the detail pages and were
 * removed, which is what the note at the top of this file refers to. This is
 * not that returning. That plate was unconditional and so was decoration;
 * this one is on the two records that measurably need it.
 */
const DARK_GROUND_PARTNER_IDS: string[] = []

/** Matched as a lowercase substring, same as LIGHT_COMMUNITY_NAMES. */
const DARK_GROUND_COMMUNITY_NAMES = ["alamo agents", "linux san antonio"]

/**
 * Plate classes for a light surface, or `""`.
 *
 * Applied to the `<img>` itself rather than a wrapper, so every caller stays a
 * className swap. `object-fit` resolves inside the content box and a
 * background paints out to the padding box, so padding insets the artwork and
 * the colour fills the slot behind it — a plate, without restructuring six
 * call sites around an extra element.
 *
 * Nothing here needs a counterpart for dark surfaces: these marks were drawn
 * for a dark ground and already have one there.
 */
export function logoPlateOnLight(logo: {
  id?: string
  name?: string
  type?: "community" | "partner"
}): string {
  const byId = !!logo.id && DARK_GROUND_PARTNER_IDS.includes(logo.id)
  const name = (logo.name || "").toLowerCase()
  const byName = DARK_GROUND_COMMUNITY_NAMES.some((n) => name.includes(n))

  const needsGround =
    logo.type === "partner" ? byId : logo.type === "community" ? byName : byId || byName

  // A mark cannot be both uniformly light and multi-tonal. If one ever appears
  // in both lists the plate wins, because inverting it was already wrong.
  return needsGround ? "rounded-md bg-[#0a0a0a] p-1" : ""
}
