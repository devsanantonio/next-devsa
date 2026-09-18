// Builds the non-vector source art the tee designs need:
//
//   1. Light and dark cuts of the Alamo Python mark. It is a glyph knocked out of a
//      starburst disc, so each cut prints the disc in the ink that suits the garment
//      and leaves the glyph knocked out to the shirt.
//   2. A print-resolution crop of the PySanAntonio mariachi mascot.
//   3. lib/tee-logo-sizes.mjs, so a layout can derive a mark's height from its width.
//
// Outputs are committed. Re-run with `node scripts/build-tee-assets.mjs` only if a
// source logo or the mascot render changes.

import { readFileSync, writeFileSync } from "node:fs"
import { decodePng, encodePng, resample, luminance } from "./png.mjs"

const ROOT = new URL("..", import.meta.url)
const p = (rel) => new URL(rel, ROOT).pathname

/* ------------------------------------------------------------------ logos -- */

function cropToContent(img, pad = 2) {
  const { width, height, data } = img
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 12) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)
  const w = maxX - minX + 1
  const h = maxY - minY + 1
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    data.copy(out, y * w * 4, ((y + minY) * width + minX) * 4, ((y + minY) * width + minX + w) * 4)
  }
  return { width: w, height: h, data: out }
}

// Re-ink a logo in a single colour, using its own tonal range as the opacity ramp so
// internal structure survives the loss of hue.
//
// `floor` is what the darkest tone maps to. Marks whose dark areas are meant to read as
// holes — the Alamo Python glyph punched out of its starburst — need a floor of 0, so
// those pixels knock out to the garment on both colourways instead of going muddy grey.
// A two-tone mark whose darker half must stay visible needs a floor above 0 instead.
function monoize(img, { ink, invert, floor }) {
  const { width, height, data } = img
  let min = 1
  let max = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const l = luminance(data[i], data[i + 1], data[i + 2])
    if (l < min) min = l
    if (l > max) max = l
  }
  const range = max - min
  const out = Buffer.alloc(data.length)
  const [r, g, b] = ink
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    out[i] = r
    out[i + 1] = g
    out[i + 2] = b
    if (a === 0) continue
    if (range < 0.2) {
      out[i + 3] = a // single-tone mark: nothing to ramp, print it solid
      continue
    }
    let t = (luminance(data[i], data[i + 1], data[i + 2]) - min) / range
    if (invert) t = 1 - t
    out[i + 3] = Math.round(a * (floor + (1 - floor) * t))
  }
  return { width, height, data: out }
}

/**
 * `light` prints on a black tee, `dark` on a white tee.
 *
 * `invertDark` decides what "the dark cut" means for a given mark. For a tonal logo it
 * should be true, so the brighter half stays the brighter half relative to the garment.
 * For a mark built as solid-shape-with-a-hole it must be false: inverting Alamo Python
 * throws away the starburst and prints only the small glyph that was meant to be the
 * hole, which is most of the logo gone. Re-inking without inverting keeps the disc and
 * the knockout, so the mark reads the same on either shirt.
 */
function buildLogo(name, srcPath, { floor = 0.45, maxWidth = 420, invertDark = true } = {}) {
  let img = cropToContent(decodePng(readFileSync(srcPath)))
  if (img.width > maxWidth) {
    img = resample(img, maxWidth, Math.round((img.height / img.width) * maxWidth))
  }
  // Cropped per variant rather than once up front, since inverting can change which
  // part of the artwork survives and so how big it should render beside its neighbours.
  const out = {}
  for (const [variant, ink, invert] of [
    ["light", [255, 255, 255], false],
    ["dark", [13, 13, 13], invertDark],
  ]) {
    const cut = cropToContent(monoize(img, { ink, invert, floor }), 0)
    writeFileSync(p(`public/tees/logos/${name}-${variant}.png`), encodePng(cut))
    out[`${name}-${variant}`] = [cut.width, cut.height]
    console.log(`  ${name}-${variant}: ${cut.width}x${cut.height}`)
  }
  return out
}


/* ------------------------------------------------------------------ mascot -- */

// The PySanAntonio mariachi, prepared for print. The committed copies of this art
// are too small to press: mascot-og-figure.png is 280x601 and mascot-sticker.webp is
// 700x1503, which caps a sharp print at about 5 inches. The S3 original is 2550x3300,
// mostly transparent margin — so crop to the figure and land on a size that prints
// 6 inches at 300 DPI without carrying a 4 MB payload into every exported design.
const MASCOT_SRC = "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa2.PNG"
const MASCOT_PRINT_HEIGHT = 1800

async function buildMascot() {
  const res = await fetch(MASCOT_SRC)
  if (!res.ok) throw new Error(`mascot fetch failed: ${res.status}`)
  const full = decodePng(Buffer.from(await res.arrayBuffer()))
  const figure = cropToContent(full, 0)
  const width = Math.round((figure.width / figure.height) * MASCOT_PRINT_HEIGHT)
  const print = resample(figure, width, MASCOT_PRINT_HEIGHT)
  writeFileSync(p("public/tees/art/pysa-mascot.png"), encodePng(print))
  console.log(`  mascot: ${figure.width}x${figure.height} -> ${width}x${MASCOT_PRINT_HEIGHT}`)
}

/* --------------------------------------------------------------------- run -- */

console.log("logos:")
const sizes = {
  ...buildLogo("alamo-python", p("scripts/tee-sources/alamo-py.png"), { floor: 0, invertDark: false }),
}
// Linux San Antonio ships as one horizontal lockup: pixel Tux, then "LINUX" in white
// and "SAN ANTONIO" in amber. Only Tux is taken. The white half of that wordmark would
// be invisible on a white tee, so the tee sets its own type in Geist Pixel and inks it
// per garment; Tux himself is black, white and amber and reads on either.
const LINUX_LOCKUP_TUX_ENDS_AT = 458 // the blank column between the penguin and the type
const lockup = decodePng(readFileSync(p("scripts/tee-sources/linux-sa.png")))
const tux = cropToContent(
  {
    width: LINUX_LOCKUP_TUX_ENDS_AT,
    height: lockup.height,
    data: (() => {
      const out = Buffer.alloc(LINUX_LOCKUP_TUX_ENDS_AT * lockup.height * 4)
      for (let y = 0; y < lockup.height; y++) {
        lockup.data.copy(
          out,
          y * LINUX_LOCKUP_TUX_ENDS_AT * 4,
          y * lockup.width * 4,
          (y * lockup.width + LINUX_LOCKUP_TUX_ENDS_AT) * 4
        )
      }
      return out
    })(),
  },
  0
)
writeFileSync(p("public/tees/logos/linux-tux.png"), encodePng(tux))
sizes["linux-tux"] = [tux.width, tux.height]
console.log(`  linux-tux (original colour): ${tux.width}x${tux.height}`)

writeFileSync(
  p("lib/tee-logo-sizes.mjs"),
  "// GENERATED by scripts/build-tee-assets.mjs — do not edit by hand.\n" +
    "// Intrinsic [width, height] of each partner mark, so a layout can derive height from\n" +
    "// width and size by the artwork that actually prints rather than by a shared canvas.\n" +
    `export const LOGO_SIZES = ${JSON.stringify(sizes, null, 2)}\n`
)

console.log("art:")
await buildMascot()
