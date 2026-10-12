/**
 * Demo Day's look: a night of stars over San Antonio, strung with lights.
 *
 * Follows Fiesta 2027's Flambeau theme — "Cosmic Nights: A Universe of Lights"
 * — because Demo Day is planned for the run-up to Fiesta and the open evening
 * is a night under lights. It follows the theme; it does not borrow from it.
 * Nothing here copies the winning poster (Teresa Riojas's artwork, and hers),
 * and neither Fiesta's nor the parade association's name or marks are on the
 * page — Fiesta® is a registered mark. The ingredients are the city's common
 * vocabulary — stars, papel picado, strings of lights, the folklórico
 * palette — drawn fresh.
 *
 * ## The ground is site black
 *
 * A first pass put the page on a deep indigo night. It clashed with the black
 * navbar above and the footer below: two near-blacks meeting at an edge read as
 * a mistake, not a palette. The stars carry the night on their own.
 *
 * ## The palette
 *
 * Six festival colors, all measured against black as text rather than
 * eyeballed — the lowest, pink, clears 4.5:1 with room to spare, so any of them
 * can carry a label. Marigold is the accent because INK set on it measures
 * about 11:1; the site's pink button with white type is 3.6:1.
 *
 * When Demo Day gets a calendar event, this moves into lib/event-brands.ts.
 * It is not there yet because a key in that registry also appears in the
 * admin's brand picker, which expects a finished lockup.
 */
export const DD = {
  ink: "#0a0a0a",
  marigold: "#ffb81c",
  pink: "#ff4f9a",
  turquoise: "#22c7d6",
  violet: "#a78bfa",
  orange: "#ff8a3d",
  lime: "#a3e05f",
} as const

export const FESTIVAL = [DD.pink, DD.turquoise, DD.marigold, DD.violet, DD.orange, DD.lime]

/*
 * Stars, generated once at module load from a fixed seed so every render —
 * server and client — draws the same sky. Math.random() here would differ
 * between the two and fail hydration.
 */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const STAR_TILE = (() => {
  const rand = seeded(2027)
  const circles = Array.from({ length: 70 }, () => {
    const x = (rand() * 600).toFixed(1)
    const y = (rand() * 600).toFixed(1)
    const r = (0.4 + rand() * 1.1).toFixed(2)
    const o = (0.25 + rand() * 0.6).toFixed(2)
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" fill-opacity="${o}"/>`
  }).join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">${circles}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})()

/*
 * Eased fades. A two-stop linear gradient shows a visible edge where it starts
 * and stops — the eye picks up the corner in the ramp. Sampling an ease-in-out
 * curve into a dozen stops gives the same fade with no corner.
 */
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Stops for a fade from `from` to `to` (0–1 alpha) across [start, end]. */
function easedStops(start: string, end: string, from: number, to: number, steps = 12) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const a = (from + (to - from) * easeInOut(t)).toFixed(3)
    return `rgba(0,0,0,${a}) calc(${start} + (${end} - ${start}) * ${t.toFixed(3)})`
  }).join(", ")
}

/* Where the stars arrive under the navbar and leave above the footer. */
const FADE_IN = "320px"
const FADE_OUT = "520px"

const STAR_MASK = `linear-gradient(to bottom, ${easedStops("0px", FADE_IN, 0, 1)}, ${easedStops(
  `100% - ${FADE_OUT}`,
  "100%",
  1,
  0,
)})`

/**
 * The page ground. Black under the navbar, easing to the footer's
 * neutral-950 at the bottom so the two meet without a seam. Needs `isolate`
 * on the element so the star layer can sit beneath the content.
 */
export const NIGHT_SKY: React.CSSProperties = {
  backgroundColor: "#000000",
  backgroundImage: `linear-gradient(to bottom, #000000 0%, #000000 calc(100% - ${FADE_OUT}), #050505 calc(100% - ${FADE_OUT} * 0.5), #0a0a0a 100%)`,
}

/**
 * The stars, on their own layer so they can fade at both ends without fading
 * the content: in from nothing under the navbar, out to nothing above the
 * footer.
 */
export function StarField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage: STAR_TILE,
        backgroundRepeat: "repeat",
        backgroundSize: "600px 600px",
        maskImage: STAR_MASK,
        WebkitMaskImage: STAR_MASK,
      }}
    />
  )
}
