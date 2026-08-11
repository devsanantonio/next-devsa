import { ACCESS_GREEN } from "@/data/access-granted/2026"

/**
 * The schematic field the padlock sits in, as an inline SVG data URI.
 *
 * Shared by both Access Granted cards — the 1200x630 share card and the
 * 1080x1350 Instagram post — so the two cannot drift.
 *
 * The PAGE builds this field from two tiled `linear-gradient`s under a
 * `mask-image` (see the hero). Neither survives in satori: it does not tile a
 * gradient via `background-size`, and it has no `mask-image` at all, so the
 * grid would render as a single smear with hard edges at its box, or not at
 * all. An SVG carries all three parts natively and resvg rasterises them
 * faithfully:
 *
 *   · a 34px `<pattern>`, matching the page's grid exactly
 *   · a radial `<mask>` standing in for GRID_FADE, so the lines dissolve
 *     rather than ending at an edge
 *   · the lock's own green spill underneath
 *
 * The lines are carried at 0.12 rather than the page's 0.055. A card is looked
 * at small, inside a feed, and often re-compressed by whoever is showing it —
 * at the page's value the grid was gone by the time it got there.
 *
 * @param width  box width in px
 * @param height box height in px
 * @param focusX horizontal centre of the fade and the glow, as a CSS
 *   percentage. Defaults to 70%, matching GRID_FADE, which puts the field on
 *   the lock and lets it reach left under the copy. The portrait card centres
 *   its art, so it passes 50%.
 */
export function accessGrantedGridSvg(
  width: number,
  height: number,
  focusX = "70%"
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<defs>
<pattern id="p" width="34" height="34" patternUnits="userSpaceOnUse">
<path d="M34 0 H0 V34" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1"/>
</pattern>
<radialGradient id="f" cx="${focusX}" cy="52%" r="62%">
<stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
<stop offset="34%" stop-color="#ffffff" stop-opacity="1"/>
<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
</radialGradient>
<mask id="m"><rect width="${width}" height="${height}" fill="url(#f)"/></mask>
<radialGradient id="g" cx="${focusX}" cy="58%" r="56%">
<stop offset="0%" stop-color="${ACCESS_GREEN}" stop-opacity="0.28"/>
<stop offset="100%" stop-color="${ACCESS_GREEN}" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="${width}" height="${height}" fill="url(#g)"/>
<rect width="${width}" height="${height}" fill="url(#p)" mask="url(#m)"/>
</svg>`

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}
