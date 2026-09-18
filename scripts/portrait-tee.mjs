// Turns a headshot into bootleg-portrait tee art.
//
//   node scripts/portrait-tee.mjs <photo.png> [options]
//
//     --colors N     flat inks to posterise to (default 6)
//     --duotone A,B,C  grade through a 3-stop hex ramp (shadow,mid,highlight)
//     --crop x0,y0,x1,y1  frame first, as fractions of the source
//     --halftone     1-ink halftone screen instead of flat colour
//     --cell N       halftone dot pitch in pixels (default 9 ≈ 33 LPI at 300 DPI)
//     --ink R,G,B    halftone ink (default 255,255,255 — white, for a black tee)
//     --height N     output height in pixels (default 3600 = 12in at 300 DPI)
//     --out FILE     destination (default public/tees/art/portrait.png)
//
// Two looks, same pipeline:
//
//   posterise  — k-means the photo down to a handful of flat inks. Bold, cheap to
//                print, and the closest thing to a screenprint. Keeps colour.
//   halftone   — one ink, dot size carried by tone. This is the vintage look, and it
//                is the only one that reliably survives a dark garment, because there
//                is no continuous tone for the press to wash out.
//
// The photo must already be a cutout (transparent background). Backgrounds are a
// matting problem, not an image-processing one — do that in Photoshop or a remove-bg
// tool first, then run this.

import { readFileSync, writeFileSync } from "node:fs"
import { decodePng, encodePng, resample, luminance } from "./png.mjs"

const args = process.argv.slice(2)
const src = args[0]
if (!src || src.startsWith("--")) {
  console.error("usage: node scripts/portrait-tee.mjs <photo.png> [--colors N] [--halftone] [--out FILE]")
  process.exit(1)
}
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const has = (name) => args.includes(`--${name}`)

const COLORS = Number(flag("colors", 6))
const CELL = Number(flag("cell", 9))
const HEIGHT = Number(flag("height", 3600))
const INK = flag("ink", "255,255,255").split(",").map(Number)
const OUT = flag("out", new URL("../public/tees/art/portrait.png", import.meta.url).pathname)
const DUOTONE = flag("duotone", null)
const CROP = flag("crop", null)

const hexToRgb = (h) => {
  const v = h.replace("#", "").trim()
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16))
}

/* ------------------------------------------------------------------ prep -- */

function cropToContent(img) {
  const { width, height, data } = img
  let minX = width, minY = height, maxX = -1, maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 16) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (maxX < 0) throw new Error("image is fully transparent — is it a cutout?")
  const w = maxX - minX + 1
  const h = maxY - minY + 1
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    data.copy(out, y * w * 4, ((y + minY) * width + minX) * 4, ((y + minY) * width + minX + w) * 4)
  }
  return { width: w, height: h, data: out }
}

/** Push tone to the ends. Flat midtones posterise into mush and halftone into grey. */
function boostContrast(img, amount = 0.35) {
  const { data } = img
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    for (let c = 0; c < 3; c++) {
      const v = data[i + c] / 255
      // Smoothstep around mid-grey, mixed back by `amount`.
      const s = v * v * (3 - 2 * v)
      data[i + c] = Math.round(255 * (v * (1 - amount) + s * amount))
    }
  }
  return img
}

/**
 * Grade the whole image through one ramp. Unlike posterise this keeps continuous tone —
 * it just replaces the photograph's colour with a chosen one, which is how an 80s poster
 * gets a whole scene reading as two neon inks.
 */
function duotone(img, stops) {
  const { data } = img
  const n = stops.length - 1
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    const lum = luminance(data[i], data[i + 1], data[i + 2])
    const band = Math.min(n - 1, Math.floor(lum * n))
    const t = lum * n - band
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(stops[band][c] + (stops[band + 1][c] - stops[band][c]) * t)
    }
  }
  return img
}

function cropFraction(img, [x0, y0, x1, y1]) {
  const sx = Math.round(x0 * img.width)
  const sy = Math.round(y0 * img.height)
  const w = Math.round((x1 - x0) * img.width)
  const h = Math.round((y1 - y0) * img.height)
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    img.data.copy(out, y * w * 4, ((y + sy) * img.width + sx) * 4, ((y + sy) * img.width + sx + w) * 4)
  }
  return { width: w, height: h, data: out }
}

/* ------------------------------------------------------------- posterise -- */

// k-means over a sample of the opaque pixels. A fixed luminance ramp was tried first
// and loses hue entirely — skin, hair and clothing all collapse onto one grey scale,
// which is exactly what this style must not do.
function posterise(img, k) {
  const { data } = img
  // Strided across the whole image, not "take the first N that pass". Filling a quota
  // in scan order samples only the top few rows of the picture — on a portrait that is
  // sky and hair, and every cluster comes back a shade of the same thing.
  const target = 24000
  const pixels = data.length / 4
  const step = Math.max(1, Math.floor(pixels / target))
  const sample = []
  for (let px = 0; px < pixels; px += step) {
    const i = px * 4
    if (data[i + 3] < 200) continue
    sample.push([data[i], data[i + 1], data[i + 2]])
  }
  if (!sample.length) throw new Error("no opaque pixels to cluster")

  // Seed along the tonal range so clusters don't all land in the same region.
  sample.sort((a, b) => luminance(...a) - luminance(...b))
  let centres = Array.from({ length: k }, (_, i) => sample[Math.floor((i / k) * (sample.length - 1))].slice())

  for (let pass = 0; pass < 12; pass++) {
    const sums = Array.from({ length: k }, () => [0, 0, 0, 0])
    for (const px of sample) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < k; c++) {
        const d = (px[0] - centres[c][0]) ** 2 + (px[1] - centres[c][1]) ** 2 + (px[2] - centres[c][2]) ** 2
        if (d < bestD) { bestD = d; best = c }
      }
      sums[best][0] += px[0]; sums[best][1] += px[1]; sums[best][2] += px[2]; sums[best][3]++
    }
    centres = centres.map((c, i) =>
      sums[i][3] ? [sums[i][0] / sums[i][3], sums[i][1] / sums[i][3], sums[i][2] / sums[i][3]] : c
    )
  }

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    let best = 0
    let bestD = Infinity
    for (let c = 0; c < k; c++) {
      const d =
        (data[i] - centres[c][0]) ** 2 + (data[i + 1] - centres[c][1]) ** 2 + (data[i + 2] - centres[c][2]) ** 2
      if (d < bestD) { bestD = d; best = c }
    }
    data[i] = Math.round(centres[best][0])
    data[i + 1] = Math.round(centres[best][1])
    data[i + 2] = Math.round(centres[best][2])
    data[i + 3] = 255
  }
  return { img, centres: centres.map((c) => c.map(Math.round)) }
}

/* -------------------------------------------------------------- halftone -- */

// One ink, tone carried by dot area. Rotated 45° because a dot grid square to the
// garment reads as a screen-door artefact, while 45° reads as texture.
function halftone(img, { cell, ink }) {
  const { width, height, data } = img
  const out = Buffer.alloc(width * height * 4)
  // Which end of the tonal range the ink stands for depends on the garment. Dark ink on
  // a white shirt paints the shadows; white ink on a black shirt paints the highlights.
  // Getting this backwards prints a photographic negative — the hair goes solid and the
  // face disappears.
  const inkIsLight = luminance(...ink) > 0.5
  const ANGLE = Math.PI / 4
  const cos = Math.cos(ANGLE)
  const sin = Math.sin(ANGLE)
  const R = cell * 0.76 // a full dot slightly overlaps its neighbours, so blacks go solid

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Rotate into screen space, find the cell centre, rotate back.
      const u = x * cos + y * sin
      const v = -x * sin + y * cos
      const cu = (Math.floor(u / cell) + 0.5) * cell
      const cv = (Math.floor(v / cell) + 0.5) * cell
      const sx = cu * cos - cv * sin
      const sy = cu * sin + cv * cos

      const px = Math.min(width - 1, Math.max(0, Math.round(sx)))
      const py = Math.min(height - 1, Math.max(0, Math.round(sy)))
      const s = (py * width + px) * 4
      if (data[s + 3] < 128) continue

      const lum = luminance(data[s], data[s + 1], data[s + 2])
      const tone = inkIsLight ? lum : 1 - lum
      const r = R * Math.sqrt(tone)
      const d = Math.hypot(x - sx, y - sy)
      if (d > r) continue

      const i = (y * width + x) * 4
      out[i] = ink[0]
      out[i + 1] = ink[1]
      out[i + 2] = ink[2]
      // Feather the last pixel so dot edges aren't stair-stepped.
      out[i + 3] = Math.round(255 * Math.min(1, r - d))
    }
  }
  return { width, height, data: out }
}

/* ------------------------------------------------------------------- run -- */

let img = decodePng(readFileSync(src))
img = CROP ? cropFraction(img, CROP.split(",").map(Number)) : cropToContent(img)
const scale = HEIGHT / img.height
if (Math.abs(scale - 1) > 0.01) {
  img = resample(img, Math.round(img.width * scale), HEIGHT)
}
if (scale > 1.05) {
  console.warn(
    `! upscaling ${(scale).toFixed(2)}x — the source is too small for a ${(HEIGHT / 300).toFixed(1)}in print.\n` +
      `  Shoot tighter or larger rather than relying on this.`
  )
}
boostContrast(img)

if (DUOTONE) {
  duotone(img, DUOTONE.split(",").map(hexToRgb))
  writeFileSync(OUT, encodePng(img))
  console.log(`duotone · ${img.width}x${img.height} · ${DUOTONE} → ${OUT}`)
} else if (has("halftone")) {
  const dotted = halftone(img, { cell: CELL, ink: INK })
  writeFileSync(OUT, encodePng(dotted))
  console.log(`halftone · ${dotted.width}x${dotted.height} · ${CELL}px dot (~${Math.round(300 / CELL)} LPI) → ${OUT}`)
} else {
  const { centres } = posterise(img, COLORS)
  writeFileSync(OUT, encodePng(img))
  console.log(`posterised · ${img.width}x${img.height} · ${COLORS} inks → ${OUT}`)
  console.log("  inks:", centres.map((c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("")).join(" "))
}
