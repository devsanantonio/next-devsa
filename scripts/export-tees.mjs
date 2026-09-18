// Writes every design, on both garments, as print-ready files.
//
//   node scripts/export-tees.mjs [outdir]      # default: ./tee-exports
//
// The page at /branding/tees does the same thing one design at a time in the browser;
// this is the bulk version, for handing a whole range to a printer at once.
//
// SVGs are self-contained — fonts and images are inlined as base64 — because a
// referenced asset silently vanishes the moment the file leaves this repo, and a shirt
// printed from it would come out with the type missing. PNGs are rasterised from those
// same SVGs by headless Chrome at 300 DPI on a transparent ground.

import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { DESIGNS, GARMENTS, renderDesign } from "../lib/tee-designs.mjs"

const DPI = 300
const root = (rel) => new URL(rel, import.meta.url).pathname
const outDir = process.argv[2] ?? root("../tee-exports")

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

// Mirrors the @font-face block in globals.css and FONT_FILES in tee-studio.tsx.
const FONTS = {
  TeeSans: [
    [500, "Geist-Medium.ttf", "truetype"],
    [700, "Geist-Bold.ttf", "truetype"],
    [900, "Geist-Black.ttf", "truetype"],
  ],
  TeeMono: [
    [400, "GeistMono-Regular.ttf", "truetype"],
    [500, "GeistMono-Medium.ttf", "truetype"],
  ],
  TeePixel: [[400, "GeistPixel-Square.woff2", "woff2"]],
}

const MIME = { png: "image/png", svg: "image/svg+xml", jpg: "image/jpeg", ttf: "font/ttf", woff2: "font/woff2" }
const b64 = (path) => readFileSync(path).toString("base64")

function standalone(svg) {
  const faces = Object.keys(FONTS)
    .filter((family) => svg.includes(`font-family="${family}"`))
    .flatMap((family) =>
      FONTS[family].map(([weight, file, format]) => {
        const data = b64(root(`../public/tees/fonts/${file}`))
        return `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:${MIME[format === "woff2" ? "woff2" : "ttf"]};base64,${data}) format("${format}")}`
      })
    )

  let out = svg
  for (const href of new Set([...svg.matchAll(/href="(\/[^"]+)"/g)].map((m) => m[1]))) {
    const ext = href.split(".").pop()
    out = out.replaceAll(`href="${href}"`, `href="data:${MIME[ext]};base64,${b64(root(`../public${href}`))}"`)
  }
  return out.replace(/(<svg[^>]*>)/, `$1<style>${faces.join("")}</style>`)
}

mkdirSync(outDir, { recursive: true })
const chrome = existsSync(CHROME)
if (!chrome) console.warn(`! ${CHROME} not found — writing SVGs only`)

for (const garment of Object.values(GARMENTS)) {
  for (const design of DESIGNS) {
    const name = `devsa-${design.id}-${garment.id}`
    const svgPath = `${outDir}/${name}.svg`
    writeFileSync(svgPath, standalone(renderDesign(design, garment, { dpi: DPI })))

    if (!chrome) continue
    const w = Math.round((design.w / 100) * DPI)
    const h = Math.round((design.h / 100) * DPI)
    execFileSync(
      CHROME,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--allow-file-access-from-files",
        // Transparent, or every design would ship with a white box behind it.
        "--default-background-color=00000000",
        "--virtual-time-budget=8000",
        `--window-size=${w},${h}`,
        `--screenshot=${outDir}/${name}.png`,
        `file://${svgPath}`,
      ],
      { stdio: "ignore" }
    )
    console.log(`${name}  ${w}x${h}`)
  }
}
console.log(`\n→ ${outDir}`)
