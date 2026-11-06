// The DEVSA logo's own terminal prompt, for anything that types or shows a prompt
// beside the mark: the spotlight hooks, the YouTube banner, future spots.
//
// Drawn from the logo's coordinates (assets/devsa-logo.svg, viewBox 735.7 x 551.8),
// not from a font. The spotlights used Geist Mono's ">" and a tall block cursor,
// which read as a different terminal from the one in the mark: a thin glyph next
// to a heavy rounded chevron, a block next to an underline bar.
//
// In the logo:
//   chevron   x 92-292, y 185-475  (290 tall)
//   cursor    x 352.5-628.3, y 398.5-475.1, corners 15.3: an underline bar,
//             3.6x as wide as tall, its bottom on the chevron's bottom tip
//   gap       ~60 between them, a fifth of the chevron's height
//
// Sizes below are in em against cap height (.71em for Geist Black), so the prompt
// scales with whatever text it introduces.
;(function () {
  const CHEVRON = 'M193.1,320.3l-95,95c-7.7,7.7-7.7,18.4,0,24.5l27.6,27.6c7.7,7.7,18.4,7.7,24.5,0l134.9-134.9c6.8-5.6,7.7-15.7,2.1-22.4-.6-.8-1.3-1.5-2.1-2.1l-134.9-134.9c-6.1-6.1-18.4-6.1-24.5,0l-27.6,27.6c-7.7,6.1-7.7,16.9,0,24.5l95,95h0Z'
  const CAP = 0.71 // em: the chevron is as tall as a capital letter
  const UNIT = CAP / 290 // em per logo unit

  window.DEVSA_PROMPT = {
    CHEVRON,
    // Inline chevron, sitting on the baseline like a capital.
    chevron(color) {
      return `<svg class="dv-chev" viewBox="88 183 208 294" style="display:inline-block;height:${(294 * UNIT).toFixed(3)}em;width:auto;vertical-align:${(-2 * UNIT).toFixed(3)}em;margin-right:${(60 * UNIT).toFixed(3)}em" aria-hidden="true"><path fill="${color}" d="${CHEVRON}"/></svg>`
    },
    // The underline-bar cursor, as CSS for an inline-block element.
    cursorCSS(color) {
      return `display:inline-block;width:${(275.8 * UNIT).toFixed(3)}em;height:${(76.6 * UNIT).toFixed(3)}em;border-radius:${(15.3 * UNIT).toFixed(3)}em;background:${color};margin-left:${(60 * UNIT).toFixed(3)}em;vertical-align:baseline`
    },
    // The whole prompt as one standalone SVG (chevron + cursor), for static art.
    standalone(chevronColor, cursorColor) {
      return `<svg viewBox="88 183 545 296" aria-hidden="true"><path fill="${chevronColor}" d="${CHEVRON}"/><rect x="352.5" y="398.5" width="275.8" height="76.6" rx="15.3" fill="${cursorColor}"/></svg>`
    },
  }
})()
