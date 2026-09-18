// Renders every design on both garments into one HTML page, for reviewing the
// artwork itself rather than the shop page around it.
//
//   node scripts/tee-contact-sheet.mjs [outfile]
//
// Fonts and images are rewritten to file:// URLs, so open the result directly — or
// screenshot it headless with --allow-file-access-from-files.

import { writeFileSync } from "node:fs"
import { DESIGNS, GARMENTS, renderDesign, printSize } from "../lib/tee-designs.mjs"

const PUBLIC = new URL("../public/", import.meta.url).href
const out = process.argv[2] ?? "/tmp/tee-contact-sheet.html"

const cards = Object.values(GARMENTS)
  .map((garment) =>
    DESIGNS.map((design) => {
      const svg = renderDesign(design, garment)
        // Same-origin absolute paths only resolve when served; this sheet is a file.
        .replaceAll('href="/', `href="${PUBLIC}`)
        .replace("<svg ", '<svg style="width:100%;height:auto;display:block" ')
      return `<figure class="card ${garment.id}">
  <div class="art">${svg}</div>
  <figcaption><b>${design.name}</b><span>${garment.label} · ${design.placement} · ${printSize(design)}</span></figcaption>
</figure>`
    }).join("\n")
  )
  .join("\n")

writeFileSync(
  out,
  `<!doctype html><meta charset="utf-8"><title>DEVSA tee contact sheet</title>
<style>
  @font-face{font-family:"TeeSans";src:url("${PUBLIC}tees/fonts/Geist-Medium.ttf");font-weight:500}
  @font-face{font-family:"TeeSans";src:url("${PUBLIC}tees/fonts/Geist-Bold.ttf");font-weight:700}
  @font-face{font-family:"TeeSans";src:url("${PUBLIC}tees/fonts/Geist-Black.ttf");font-weight:900}
  @font-face{font-family:"TeeMono";src:url("${PUBLIC}tees/fonts/GeistMono-Regular.ttf");font-weight:400}
  @font-face{font-family:"TeeMono";src:url("${PUBLIC}tees/fonts/GeistMono-Medium.ttf");font-weight:500}
  @font-face{font-family:"TeePixel";src:url("${PUBLIC}tees/fonts/GeistPixel-Square.woff2");font-weight:400}
  body{margin:0;padding:24px;background:#1c1c1c;font:13px/1.4 system-ui,sans-serif;
       display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
  .card{margin:0;border-radius:10px;overflow:hidden;border:1px solid #333}
  .art{padding:18px;display:flex;align-items:center;justify-content:center;min-height:210px}
  .black .art{background:#0e0e0e} .white .art{background:#fff}
  figcaption{padding:8px 10px;background:#232323;color:#eee;display:flex;flex-direction:column;gap:2px}
  figcaption span{color:#999;font-size:11px}
</style>
${cards}
`
)
console.log(out)
