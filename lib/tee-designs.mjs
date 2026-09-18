// DEVSA t-shirt artwork, as print-ready SVG.
//
// Plain .mjs rather than .ts so the same module can be imported by the preview page
// and by a node script that writes the files out — no build step in between.
//
// UNITS: 100 units = 1 inch. A design's `w`/`h` are therefore its physical print
// size, and a 300 DPI raster is just `w * 3` by `h * 3`. Nothing has a background
// rect: the garment shows through everywhere the art is transparent, which is what
// the press needs and what makes one design work on two shirt colours.
//
// Every design is authored once and rendered through a colourway (see GARMENTS), so
// the black and white versions can never drift apart.

import { LOGO_SIZES } from "./tee-logo-sizes.mjs"

/* -------------------------------------------------------------- colourways -- */

// Brand accents are identical on both garments — rose, teal and orange all clear
// 3:1 against black and against white, so they need no per-garment variant.
export const ACCENT = {
  rose: "#ef426f",
  teal: "#00b2a9",
  orange: "#ff8200",
  amber: "#fbbf24",
}

export const GRADIENT_STOPS = ["#4d8eff", "#c87bff", "#ff4d9a", "#ff3366", "#ff6b35"]

// Sampled from the Linux San Antonio lockup, so the reset wordmark matches the amber
// in the artwork it sits under.
export const LINUX_AMBER = "#fdc436"

export const GARMENTS = {
  black: {
    id: "black",
    label: "Black tee",
    garment: "#0e0e0e",
    ink: "#ffffff",
    ink2: "#a3a3a3",
    ink3: "#6e6e6e",
    // The logo is never re-coloured — only the body is dropped. On a black garment an
    // unprinted body reads exactly as the mark does on the site's dark surfaces: the
    // terminal bars and the "SA" float, and no ink is spent printing black on black.
    logoBody: "none",
    // PySanAntonio ships two wordmark cuts. The brand blue is only 2.9:1 on near-black,
    // so the dark-surface cut lifts it to the lighter UI blue.
    pysaWordmark: "/pysa/wordmark-dark.svg",
    pysaBlue: "#4a90d9",
    logoVariant: "light",
  },
  white: {
    id: "white",
    label: "White tee",
    garment: "#ffffff",
    ink: "#0a0a0a",
    ink2: "#525252",
    ink3: "#8a8a8a",
    logoBody: "#0a0a0a",
    pysaWordmark: "/pysa/wordmark.svg",
    pysaBlue: "#0059b7",
    logoVariant: "dark",
  },
}

/* ------------------------------------------------------------------ helpers -- */

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/**
 * A line of type. Font families are the aliases declared in globals.css, which point
 * at the Geist files in public/tees/fonts — the export inlines those same files as
 * base64 so a downloaded SVG carries its own type.
 *
 * SVG letter-spacing is added after every glyph including the last, which drags
 * centred text off-centre by half a step; `anchor: middle` compensates.
 */
function text(str, { x, y, size, fill, family = "TeeSans", weight = 900, anchor = "middle", tracking = 0, opacity = 1 }) {
  const cx = anchor === "middle" ? x + tracking / 2 : x
  return (
    `<text x="${cx}" y="${y}" font-family="${family}" font-weight="${weight}" font-size="${size}" ` +
    `fill="${fill}" text-anchor="${anchor}"` +
    (tracking ? ` letter-spacing="${tracking}"` : "") +
    (opacity !== 1 ? ` opacity="${opacity}"` : "") +
    `>${esc(str)}</text>`
  )
}

function gradient(uid, stops = GRADIENT_STOPS) {
  const s = stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)) * 100}%" stop-color="${c}"/>`).join("")
  return `<linearGradient id="grad-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">${s}</linearGradient>`
}

/** Horizontal scanline fill, for laying a CRT over a photo. */
function scanlines(uid, { pitch = 9, opacity = 0.38 } = {}) {
  return (
    `<pattern id="scan-${uid}" width="4" height="${pitch}" patternUnits="userSpaceOnUse">` +
    `<rect width="4" height="${pitch / 2}" fill="#000" opacity="${opacity}"/></pattern>`
  )
}

/** Receding floor grid — the horizon every 80s sleeve had under its title. */
function neonGrid({ cx, yTop, yBot, wTop, wBot, cols, rows, stroke, sw = 4 }) {
  const out = []
  for (let i = 0; i <= cols; i++) {
    const u = i / cols
    out.push(
      `<line x1="${(cx - wTop / 2 + wTop * u).toFixed(1)}" y1="${yTop}" ` +
        `x2="${(cx - wBot / 2 + wBot * u).toFixed(1)}" y2="${yBot}" stroke="${stroke}" stroke-width="${sw}"/>`
    )
  }
  for (let r = 0; r <= rows; r++) {
    // Squared spacing, so the rows bunch toward the horizon instead of stepping evenly.
    const t = (r / rows) ** 2
    const y = yTop + (yBot - yTop) * t
    const w = wTop + (wBot - wTop) * t
    out.push(
      `<line x1="${(cx - w / 2).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + w / 2).toFixed(1)}" ` +
        `y2="${y.toFixed(1)}" stroke="${stroke}" stroke-width="${sw}"/>`
    )
  }
  return out.join("")
}

/* ------------------------------------------------------------- DEVSA logo -- */

// The mark's viewBox width; every placement scales from it.
const LOGO_W = 735.7

const LOGO_PATHS = {
  body: "M0,107.3h735.7v413.8c0,16.8-13.8,30.7-30.7,30.7H30.6c-16.9,0-30.6-13.8-30.6-30.7V107.3Z",
  teal: "M235,0H30.6C13.8,0,0,13.8,0,30.6v61.3h235V0Z",
  rose: "M250.3,0h235v91.9h-235Z",
  orange: "M705,0h-204.5v91.9h235.1V30.6c0-16.9-13.8-30.6-30.7-30.6h0Z",
  mark: [
    "M352.5,459.8c0,9.2,6.1,15.3,15.3,15.3h245.2c9.2,0,15.3-6.1,15.3-15.3v-46c0-9.2-6.1-15.3-15.3-15.3h-245.3c-9.2,0-15.3,6.1-15.3,15.3v46h0Z",
    "M193.1,320.3l-95,95c-7.7,7.7-7.7,18.4,0,24.5l27.6,27.6c7.7,7.7,18.4,7.7,24.5,0l134.9-134.9c6.8-5.6,7.7-15.7,2.1-22.4-.6-.8-1.3-1.5-2.1-2.1l-134.9-134.9c-6.1-6.1-18.4-6.1-24.5,0l-27.6,27.6c-7.7,6.1-7.7,16.9,0,24.5l95,95h0Z",
    "M370.3,359.6c-11.3-8.5-17.2-20.8-17.8-36.8l49.2,1.1c.5,8.5,4.2,12.8,11,13,2.5,0,4.6-.5,6.4-1.6,1.8-1.1,2.7-3,2.7-5.5,0-3.5-1.7-6.3-5.4-8.6-3.7-2.2-9.5-4.8-17.4-7.8-9.4-3.5-17.1-7-23.2-10.3-6.1-3.3-11.3-8.1-15.6-14.3-4.3-6.2-6.3-14.1-5.9-23.7.2-9.6,2.9-17.7,8-24.3s12-11.6,20.6-14.9c8.6-3.3,18.3-4.8,29-4.6,18.1.4,32.3,4.9,42.8,13.5,10.5,8.6,15.8,20.5,16,35.6l-49.9-1.1c0-4.2-1-7.2-2.9-9-1.9-1.9-4.2-2.8-7-2.9-2,0-3.6.6-4.8,1.9s-2,3.1-2,5.5c0,3.3,1.7,6.1,5.3,8.4,3.6,2.2,9.5,5,17.5,8.2,9.2,3.7,16.8,7.2,22.8,10.5,6,3.3,11.1,7.9,15.4,13.7,4.3,5.8,6.4,13,6.2,21.6-.2,9-2.6,17.1-7.2,24.1-4.6,7.1-11.2,12.5-19.8,16.3-8.6,3.8-18.7,5.6-30.4,5.4-17.7-.4-32.1-4.9-43.4-13.4h0Z",
    "M573.3,348.2l-48.5-.3-7.3,22-47.9-.3,54.1-145.2,52.6.3,52.2,145.8-48.1-.3-7.1-22h0ZM561.4,318l-13.6-40.3-12.7,40.6,26.3-.3h0Z",
  ],
}

// public/branding/devsa-logo.svg, reproduced path-for-path. The mark's own colours are
// fixed — #eee for the "SA", teal/rose/orange for the terminal bars. Only `logoBody`
// varies, and only ever to drop out.
const LOGO_MARK_FILL = "#eeeeee"

/** public/branding/devsa-logo.svg — the primary mark. */
export function devsaLogo(c, { x, y, width }) {
  const s = width / LOGO_W
  return (
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<path d="${LOGO_PATHS.body}" fill="${c.logoBody}"/>` +
    `<path d="${LOGO_PATHS.teal}" fill="${ACCENT.teal}"/>` +
    `<path d="${LOGO_PATHS.rose}" fill="${ACCENT.rose}"/>` +
    `<path d="${LOGO_PATHS.orange}" fill="${ACCENT.orange}"/>` +
    LOGO_PATHS.mark.map((d) => `<path d="${d}" fill="${LOGO_MARK_FILL}"/>`).join("") +
    `</g>`
  )
}

/* ------------------------------------------------------------ communities -- */

// Snapshot of /api/communities. Firestore is the live source of truth — re-pull this
// list before a print run rather than trusting it.
export const COMMUNITIES = [
  "DEF CON Group SATX", "Alamo City AI", "ACM UTSA", "Alamo Tech Collective", "ACM SA",
  "Alamo Python", "Geeks && {...}", "AWS User Group", "Greater Gaming Society", ".NET User Group",
  "AITX", "Alamo Agents", "Google Developer Group", "SAHA", "Datanauts",
  "Alamo City Locksport", "OWASP San Antonio", "Alamo Regional Data Alliance", "Bitcoin Club",
  "Women in Data", "Unreal Engine SA", "Red Hat User Group", "UXSA", "Dungo Digital",
  "Linux San Antonio",
]

/** Greedy line-packer, so the roster stays centred and never overruns the print area. */
function packNames(names, maxChars) {
  const lines = []
  let line = ""
  for (const name of names) {
    const next = line ? `${line} · ${name}` : name
    if (line && next.length > maxChars) {
      lines.push(line)
      line = name
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

/* ---------------------------------------------------------------- designs -- */

export const DESIGNS = [
  {
    id: "find-your-people",
    name: "Find Your People",
    blurb: "The tagline, set big. Gradient on the two payoff words.",
    placement: "Front · full",
    w: 1100,
    h: 1000,
    render: (c, uid) =>
      `<defs>${gradient(uid)}</defs>` +
      text("FIND YOUR", { x: 550, y: 120, size: 108, fill: c.ink2, tracking: 8 }) +
      text("PEOPLE.", { x: 550, y: 350, size: 235, fill: `url(#grad-${uid})`, tracking: -6 }) +
      `<rect x="240" y="405" width="620" height="16" fill="${c.ink3}"/>` +
      text("BUILD YOUR", { x: 550, y: 580, size: 108, fill: c.ink2, tracking: 8 }) +
      text("FUTURE.", { x: 550, y: 810, size: 235, fill: c.ink, tracking: -6 }) +
      text("DEVSA · SAN ANTONIO, TX", {
        x: 550, y: 940, size: 40, fill: c.ink3, family: "TeeMono", weight: 500, tracking: 10,
      }),
  },
  {
    id: "shell",
    name: "Shell",
    blurb: "A terminal window you can read across a room.",
    placement: "Front · full",
    w: 1200,
    h: 720,
    render: (c) => {
      const lines = [
        [["$ ", ACCENT.teal], ["cd ~/san-antonio", c.ink]],
        [["$ ", ACCENT.teal], ["devsa join --all", c.ink]],
        [["> ", ACCENT.rose], ["25 communities found", c.ink2]],
        [["> ", ACCENT.rose], ["find your people", c.ink2]],
      ]
      // Monospace means a run's width is exactly its character count, so each span
      // can be placed by counting characters instead of measuring.
      const adv = 54 * 0.6
      const rows = lines
        .map((spans, i) => {
          let col = 0
          return spans
            .map(([s, fill]) => {
              const out = text(s, {
                x: 100 + col * adv, y: 300 + i * 82, size: 54, fill, family: "TeeMono", weight: 500, anchor: "start",
              })
              col += s.length
              return out
            })
            .join("")
        })
        .join("")
      return (
        `<rect x="30" y="30" width="1140" height="600" rx="30" fill="none" stroke="${c.ink}" stroke-width="9"/>` +
        `<line x1="30" y1="165" x2="1170" y2="165" stroke="${c.ink}" stroke-width="9"/>` +
        `<circle cx="96" cy="98" r="20" fill="${ACCENT.teal}"/>` +
        `<circle cx="156" cy="98" r="20" fill="${ACCENT.rose}"/>` +
        `<circle cx="216" cy="98" r="20" fill="${ACCENT.orange}"/>` +
        text("devsa — zsh", { x: 600, y: 113, size: 40, fill: c.ink2, family: "TeeMono", weight: 500 }) +
        rows +
        `<rect x="${100 + 18 * adv}" y="${300 + 3 * 82 - 42}" width="${adv}" height="52" fill="${ACCENT.orange}"/>`
      )
    },
  },
  {
    id: "ecosystem",
    name: "Lineup",
    blurb: "The ecosystem billed like a festival. Headliners big, the rest tapering down the poster.",
    placement: "Back · full",
    w: 1150,
    h: 1600,
    render: (c, uid) => {
      // Billing follows the order set in the admin, not a judgement about which group is
      // bigger — that is not a call this file should be making. Change the order there
      // and the poster re-bills itself.
      //
      // `chars` is how many characters fit a line at that size: Geist Black runs about
      // 0.62em per capital, against a 1020-unit measure.
      const TIERS = [
        { names: COMMUNITIES.slice(0, 3), size: 78, lead: 94, chars: 21, fill: c.ink },
        { names: COMMUNITIES.slice(3, 9), size: 50, lead: 64, chars: 32, fill: c.ink },
        { names: COMMUNITIES.slice(9), size: 34, lead: 46, chars: 48, fill: c.ink2 },
      ]

      let y = 442
      const billing = TIERS.map(({ names, size, lead, chars, fill }) => {
        const lines = packNames(names.map((n) => n.toUpperCase()), chars)
        const block = lines
          .map((line, i) => text(line, { x: 575, y: y + i * lead, size, fill, tracking: -1 }))
          .join("")
        y += lines.length * lead + 34
        return block
      }).join("")

      const foot = y + 30
      return (
        `<defs>${gradient(uid)}</defs>` +
        text("SAN ANTONIO", { x: 575, y: 150, size: 138, fill: c.ink, tracking: -4 }) +
        text("TECH ECOSYSTEM", {
          x: 575, y: 222, size: 46, fill: c.ink2, family: "TeeMono", weight: 500, tracking: 18,
        }) +
        `<rect x="325" y="278" width="500" height="10" fill="url(#grad-${uid})"/>` +
        text(`${COMMUNITIES.length} COMMUNITIES · ONE CITY · EST. 2024`, {
          x: 575, y: 336, size: 30, fill: c.ink3, family: "TeeMono", weight: 500, tracking: 10,
        }) +
        billing +
        `<rect x="325" y="${foot}" width="500" height="10" fill="url(#grad-${uid})"/>` +
        text("DEVSA.COMMUNITY", {
          x: 575, y: foot + 76, size: 42, fill: c.ink2, family: "TeeMono", weight: 500, tracking: 16,
        })
      )
    },
  },
  {
    id: "wordmark",
    name: "Gradient Wordmark",
    blurb: "One word, one rule. Cheapest thing here to print and the easiest to wear.",
    placement: "Front · full",
    w: 1100,
    h: 460,
    render: (c, uid) =>
      `<defs>${gradient(uid)}</defs>` +
      text("DEVSA", { x: 550, y: 300, size: 300, fill: `url(#grad-${uid})`, tracking: -8 }) +
      text("FIND YOUR PEOPLE. BUILD YOUR FUTURE.", {
        x: 550, y: 400, size: 42, fill: c.ink2, family: "TeeMono", weight: 500, tracking: 5,
      }),
  },
  {
    id: "mhth-80s",
    name: "More Human Than Human",
    blurb: "An 80s one-sheet for an AI conference. Duotone still, scanlines, neon grid.",
    placement: "Front · full",
    w: 1100,
    h: 1400,
    render: (c, uid) => {
      // 1913x1700 off scripts/portrait-tee.mjs --duotone.
      const pw = 780
      const ph = Math.round(pw * (1700 / 1913))
      const px = (1100 - pw) / 2
      const py = 360
      const gTop = py + ph + 54
      const gBot = py + ph + 224
      const neon = ["#48e8ff", "#e6288f", "#ff7a1a"]
      return (
        `<defs>${gradient(`${uid}-neon`, neon)}${scanlines(uid)}</defs>` +
        // No mark on this one, so the event name is the only thing at the top and takes
        // the full 128pt it had before the lockup — and the photograph still keeps the
        // height the lockup freed up. DEVSA is credited as type in the footer instead.
        text("MORE HUMAN", {
          x: 550, y: 158, size: 128, fill: `url(#grad-${uid}-neon)`, tracking: -2,
        }) +
        text("THAN HUMAN", {
          x: 550, y: 286, size: 128, fill: `url(#grad-${uid}-neon)`, tracking: -2,
        }) +
        `<image href="/tees/art/mhth-duotone.png" x="${px}" y="${py}" width="${pw}" height="${ph}"/>` +
        `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="url(#scan-${uid})"/>` +
        `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" ` +
        `stroke="url(#grad-${uid}-neon)" stroke-width="10"/>` +
        neonGrid({
          cx: 550, yTop: gTop, yBot: gBot, wTop: 300, wBot: 1060, cols: 12, rows: 6,
          stroke: "#e6288f", sw: 3,
        }) +
        text("AI CONFERENCE · DEVSA", {
          x: 550, y: gBot + 62, size: 34, fill: c.ink2, family: "TeeMono", weight: 500, tracking: 14,
        })
      )
    },
  },
  {
    id: "tour-halftone",
    name: "Tour Tee",
    blurb: "A vertical still from the floor, screened to one ink. Cheapest photo tee here to print.",
    placement: "Front · full",
    w: 1100,
    h: 1470,
    render: (c, uid) => {
      // 2087x2800 off scripts/portrait-tee.mjs --halftone, from a vertical crop of the
      // 5063x3798 S3 original — one of only two DEVSA event photos big enough to survive
      // being cropped to portrait and still screen at print size.
      const pw = 720
      const ph = Math.round(pw * (2800 / 2087))
      const top = 50
      const base = top + ph
      // "SAN ANTONIO" is sized to the photograph's width, not the shirt's. Set larger it
      // overhangs the image on both sides and the column stops lining up.
      return (
        `<defs>${gradient(uid)}</defs>` +
        `<image href="/tees/art/tour-halftone-${c.logoVariant}.png" x="${(1100 - pw) / 2}" y="${top}" ` +
        `width="${pw}" height="${ph}"/>` +
        `<rect x="${(1100 - pw) / 2}" y="${base + 30}" width="${pw}" height="10" fill="url(#grad-${uid})"/>` +
        text("SAN ANTONIO", { x: 550, y: base + 164, size: 104, fill: c.ink, tracking: -3 }) +
        text("FIND YOUR PEOPLE. BUILD YOUR FUTURE.", {
          x: 550, y: base + 220, size: 28, fill: c.ink2, family: "TeeMono", weight: 500, tracking: 3,
        }) +
        // The mark signs off at the bottom rather than heading the tee, so the read runs
        // straight down: picture, place, mission, mark.
        devsaLogo(c, { x: 455, y: base + 264, width: 190 })
      )
    },
  },
  {
    id: "pysanantonio-plain",
    name: "PySanAntonio · Plain",
    blurb: "The same tee without the host credits. Mascot runs larger with the strip gone.",
    placement: "Front · full",
    w: 1100,
    h: 1290,
    render: (c) => {
      // 9in off an 1800px source is 200 DPI. Reclaiming the credit strip's height would
      // allow more, but the art has no more resolution to give — so the space goes to
      // margin instead of to a softer print.
      const mascotH = 900
      const mascotW = Math.round((838 / 1800) * mascotH)
      return (
        `<image href="${c.pysaWordmark}" x="110" y="60" width="880" height="207"/>` +
        `<image href="/tees/art/pysa-mascot.png" x="${(1100 - mascotW) / 2}" y="330" width="${mascotW}" height="${mascotH}"/>`
      )
    },
  },
  {
    id: "alamo-python",
    name: "Alamo Python",
    blurb: "The starburst at full chest. Rule picks up Python's own blue and gold.",
    placement: "Front · full",
    w: 1100,
    h: 1350,
    render: (c, uid) => {
      const mark = `alamo-python-${c.logoVariant}`
      // Everything is built to this one width. Set on a single line, "ALAMO PYTHON" runs
      // about 1030 units at display size — two thirds wider than the mark above it and
      // twice the rule below — so the lockup read as three unrelated widths stacked up.
      // Breaking it over two lines brings the word block to roughly the mark's width and
      // the column lines up.
      // The mark is a circle, and a circle reads smaller than a square of the same width —
      // the starburst's gaps cost it more mass still. Matched to the wordmark's ~594 it
      // looked like the junior element; at 760 it leads, which is right, since the
      // starburst is the part of this identity anyone recognises.
      const size = 760
      const markH = size / (LOGO_SIZES[mark][0] / LOGO_SIZES[mark][1])
      // Clearance between the mark and the wordmark. It was 25 units, which is less than
      // the 31 that separates the two words — so the gap holding two different elements
      // apart was tighter than the gap inside one of them, and the starburst's spikes
      // sat right on the type. A lockup wants the outer space clearly larger.
      const CLEARANCE = 110
      const WORD = 150
      const LEADING = 138
      const first = 30 + markH + CLEARANCE + WORD * 0.71
      return (
        // The one flourish that isn't theirs: Python's official blue and gold, for a
        // group in the PyTexas network whose own mark carries no colour at all. Drop
        // this rule if the chapter would rather stay strictly monochrome.
        `<defs>${gradient(uid, ["#3776ab", "#ffd43b"])}</defs>` +
        `<image href="/tees/logos/${mark}.png" x="${(1100 - size) / 2}" y="30" ` +
        `width="${size}" height="${markH}"/>` +
        text("ALAMO", { x: 550, y: first, size: WORD, fill: c.ink, tracking: -2 }) +
        text("PYTHON", { x: 550, y: first + LEADING, size: WORD, fill: c.ink, tracking: -2 }) +
        `<rect x="${(1100 - size) / 2}" y="${first + LEADING + 40}" width="${size}" height="12" fill="url(#grad-${uid})"/>` +
        text("SAN ANTONIO · PYTEXAS NETWORK", {
          x: 550, y: first + LEADING + 126, size: 34, fill: c.ink2, family: "TeeMono", weight: 500, tracking: 6,
        })
      )
    },
  },
  {
    id: "alamo-python-color",
    name: "Alamo Python · Colour",
    blurb: "Mark and wordmark only, split into Python's own blue and gold. No rule, no strapline.",
    placement: "Front · full",
    w: 1100,
    h: 1210,
    render: (c) => {
      const mark = `alamo-python-${c.logoVariant}`
      // The mark is a circle, and a circle reads smaller than a square of the same width —
      // the starburst's gaps cost it more mass still. Matched to the wordmark's ~594 it
      // looked like the junior element; at 760 it leads, which is right, since the
      // starburst is the part of this identity anyone recognises.
      const size = 760
      const markH = size / (LOGO_SIZES[mark][0] / LOGO_SIZES[mark][1])
      // Clearance between the mark and the wordmark. It was 25 units, which is less than
      // the 31 that separates the two words — so the gap holding two different elements
      // apart was tighter than the gap inside one of them, and the starburst's spikes
      // sat right on the type. A lockup wants the outer space clearly larger.
      const CLEARANCE = 110
      const WORD = 150
      const LEADING = 138
      const first = 30 + markH + CLEARANCE + WORD * 0.71
      // Python's official pair, used on the words rather than as a rule under them.
      const PY_BLUE = "#3776ab"
      const PY_GOLD = "#ffd43b"
      return (
        `<image href="/tees/logos/${mark}.png" x="${(1100 - size) / 2}" y="30" ` +
        `width="${size}" height="${markH}"/>` +
        text("ALAMO", { x: 550, y: first, size: WORD, fill: PY_BLUE, tracking: -2 }) +
        text("PYTHON", { x: 550, y: first + LEADING, size: WORD, fill: PY_GOLD, tracking: -2 })
      )
    },
  },
  {
    id: "linux-san-antonio",
    name: "Linux San Antonio",
    blurb: "Tux as the group draws him, with the wordmark reset in Geist Pixel.",
    placement: "Front · full",
    w: 1100,
    h: 1080,
    render: (c) => {
      const tuxW = 560
      const tuxH = Math.round(tuxW / (LOGO_SIZES["linux-tux"][0] / LOGO_SIZES["linux-tux"][1]))
      return (
        `<image href="/tees/logos/linux-tux.png" x="${(1100 - tuxW) / 2}" y="30" width="${tuxW}" height="${tuxH}"/>` +
        // Their lockup sets LINUX in white and SAN ANTONIO in amber. White would vanish
        // on a white tee, so only that half follows the garment; the amber is theirs and
        // holds on both.
        text("LINUX", { x: 550, y: 880, size: 300, fill: c.ink, family: "TeePixel", weight: 400, tracking: 8 }) +
        text("SAN ANTONIO", {
          x: 550, y: 1010, size: 116, fill: LINUX_AMBER, family: "TeePixel", weight: 400, tracking: 8,
        })
      )
    },
  },
]

/* ----------------------------------------------------------------- render -- */

/** Wrap a design's body in an <svg> root. A non-zero `dpi` stamps an export size on it. */
export function renderDesign(design, colorway, { uid = `${design.id}-${colorway.id}`, dpi = 0 } = {}) {
  const size = dpi ? ` width="${(design.w / 100) * dpi}" height="${(design.h / 100) * dpi}"` : ""
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"` +
    ` viewBox="0 0 ${design.w} ${design.h}"${size}>` +
    design.render(colorway, uid) +
    `</svg>`
  )
}

export const printSize = (design) => `${(design.w / 100).toFixed(1)}in × ${(design.h / 100).toFixed(1)}in`
