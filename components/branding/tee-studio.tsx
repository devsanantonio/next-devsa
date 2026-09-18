"use client"

import { useCallback, useMemo, useState } from "react"
// Plain .mjs so the same module can be read by node scripts as well as bundled here.
import { DESIGNS, GARMENTS, renderDesign, printSize } from "@/lib/tee-designs.mjs"

type Garment = "black" | "white"
type View = "garment" | "artwork"

type Design = {
  id: string
  name: string
  blurb: string
  placement: string
  w: number
  h: number
  render: (c: Colorway, uid: string) => string
}

type Colorway = {
  id: Garment
  label: string
  garment: string
  ink: string
  ink2: string
  logoVariant: string
}

const designs = DESIGNS as unknown as Design[]
const garments = GARMENTS as unknown as Record<Garment, Colorway>

/* ------------------------------------------------------------------ export -- */

// Weight → file, per aliased family. Mirrors the @font-face block in globals.css.
const FONT_FILES: Record<string, [number, string, string][]> = {
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

/** btoa only takes latin-1, and the artwork carries "·" and "—". */
function utf8ToBase64(str: string) {
  const bytes = new TextEncoder().encode(str)
  let bin = ""
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

const assetCache = new Map<string, Promise<string>>()

function asBase64(url: string) {
  let hit = assetCache.get(url)
  if (!hit) {
    hit = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${url} → ${r.status}`)
        return r.arrayBuffer()
      })
      .then((buf) => {
        // Chunked so a 2 MB mascot doesn't blow the argument limit on String.fromCharCode.
        const bytes = new Uint8Array(buf)
        let bin = ""
        for (let i = 0; i < bytes.length; i += 0x8000) {
          bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
        }
        return btoa(bin)
      })
    assetCache.set(url, hit)
  }
  return hit
}

const MIME: Record<string, string> = { png: "image/png", svg: "image/svg+xml", jpg: "image/jpeg" }

/**
 * Turn a design into a file that stands on its own: fonts and images inlined as data
 * URIs. A referenced font or logo would silently drop out the moment the SVG left
 * this origin — which, for a file being handed to a print service, means shipping a
 * shirt with the type missing.
 */
async function standalone(svg: string) {
  const families = Object.keys(FONT_FILES).filter((f) => svg.includes(`font-family="${f}"`))
  const faces = await Promise.all(
    families.flatMap((family) =>
      FONT_FILES[family].map(async ([weight, file, format]) => {
        const b64 = await asBase64(`/tees/fonts/${file}`)
        const mime = format === "woff2" ? "font/woff2" : "font/ttf"
        return `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:${mime};base64,${b64}) format("${format}")}`
      })
    )
  )

  const hrefs = [...new Set([...svg.matchAll(/href="(\/[^"]+)"/g)].map((m) => m[1]))]
  let out = svg
  for (const href of hrefs) {
    const ext = href.split(".").pop() ?? ""
    const b64 = await asBase64(href)
    out = out.replaceAll(`href="${href}"`, `href="data:${MIME[ext] ?? "application/octet-stream"};base64,${b64}"`)
  }

  return out.replace(/(<svg[^>]*>)/, `$1<style>${faces.join("")}</style>`)
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const DPI = 300

async function exportDesign(design: Design, colorway: Colorway, format: "svg" | "png") {
  const svg = await standalone(renderDesign(design, colorway, { uid: `x-${design.id}`, dpi: DPI }))
  const name = `devsa-${design.id}-${colorway.id}`
  if (format === "svg") return save(new Blob([svg], { type: "image/svg+xml" }), `${name}.svg`)

  const img = new Image()
  img.src = `data:image/svg+xml;base64,${utf8ToBase64(svg)}`
  await img.decode()

  const canvas = document.createElement("canvas")
  canvas.width = Math.round((design.w / 100) * DPI)
  canvas.height = Math.round((design.h / 100) * DPI)
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"))
  if (blob) save(blob, `${name}.png`)
}

/* ------------------------------------------------------------------ mockup -- */

// Flat-lay tee. Deliberately plain line art — a photoreal mockup would sell the
// shirt, but this has to show the artwork's proportion on the garment honestly.
// Drawn clockwise from the left shoulder: neck, shoulder seam, sleeve, armpit, side
// seam, hem, then mirrored, closing through the neckline.
const TEE_PATH =
  "M232,70 L121,96 L40,150 C30,158 28,172 34,184 L62,238 C68,250 80,254 92,250 " +
  "L98,246 L98,612 C98,626 106,632 120,632 L480,632 C494,632 502,626 502,612 " +
  "L502,246 L508,250 C520,254 532,250 538,238 L566,184 C572,172 570,158 560,150 " +
  "L479,96 L368,70 C356,112 332,126 300,126 C268,126 244,112 232,70 Z"

// Placements sized against the garment rather than eyeballed. The silhouette is built
// to a real flat-lay: 29in length, 21in chest, 27in across the sleeves. The body runs
// 98→502, so one inch of shirt is ~19.2 units and a 12x16in full-front print is
// 231x308 — which is what that print actually covers on a shirt.
//
// Left chest is the wearer's left, which is the viewer's right on a front view.
const PRINT_AREA: Record<string, { x: number; y: number; w: number; h: number }> = {
  "Front · full": { x: 185, y: 150, w: 231, h: 308 },
  "Back · full": { x: 178, y: 140, w: 245, h: 326 },
  "Front · left chest": { x: 329, y: 165, w: 77, h: 77 },
}

function TeeArtwork({ design, colorway, uid }: { design: Design; colorway: Colorway; uid: string }) {
  const area = PRINT_AREA[design.placement] ?? PRINT_AREA["Front · full"]
  return (
    <svg
      x={area.x}
      y={area.y}
      width={area.w}
      height={area.h}
      viewBox={`0 0 ${design.w} ${design.h}`}
      preserveAspectRatio="xMidYMid meet"
      dangerouslySetInnerHTML={{ __html: design.render(colorway, uid) }}
    />
  )
}

function TeeMockup({ design, colorway }: { design: Design; colorway: Colorway }) {
  const dark = colorway.id === "black"
  const seam = dark ? "#333333" : "#d9d9d9"
  return (
    <svg viewBox="0 0 600 700" className="w-full h-auto" role="img" aria-label={`${design.name} on a ${colorway.label}`}>
      <path d={TEE_PATH} fill={colorway.garment} stroke={seam} strokeWidth="2.5" />
      {/* Collar rib, sleeve hems and bottom hem — enough stitching to read as a
          garment without competing with the artwork. */}
      <path
        d="M232,70 C244,112 268,126 300,126 C332,126 356,112 368,70"
        fill="none"
        stroke={seam}
        strokeWidth="8"
      />
      <path d="M62,238 L98,246 M502,246 L538,238" fill="none" stroke={seam} strokeWidth="2.5" />
      <path d="M98,600 L502,600" fill="none" stroke={seam} strokeWidth="2" opacity="0.6" />
      <TeeArtwork design={design} colorway={colorway} uid={`${design.id}-${colorway.id}`} />
    </svg>
  )
}

/** The artwork on its own, on the garment colour, for judging the design itself. */
function FlatArtwork({ design, colorway }: { design: Design; colorway: Colorway }) {
  return (
    <svg
      viewBox={`0 0 ${design.w} ${design.h}`}
      className="w-full h-auto"
      role="img"
      aria-label={`${design.name} artwork`}
      dangerouslySetInnerHTML={{ __html: design.render(colorway, `flat-${design.id}-${colorway.id}`) }}
    />
  )
}

/* -------------------------------------------------------------------- page -- */

function Card({ design, colorway, view }: { design: Design; colorway: Colorway; view: View }) {
  const [busy, setBusy] = useState<string | null>(null)

  const download = useCallback(
    async (format: "svg" | "png") => {
      setBusy(format)
      try {
        await exportDesign(design, colorway, format)
      } catch (err) {
        console.error(err)
        alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setBusy(null)
      }
    },
    [design, colorway]
  )

  return (
    <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 overflow-hidden flex flex-col">
      <div
        className="p-4 flex items-center justify-center min-h-[300px]"
        style={{ background: colorway.garment }}
      >
        {view === "garment" ? (
          <TeeMockup design={design} colorway={colorway} />
        ) : (
          <div className="w-full max-w-[280px]">
            <FlatArtwork design={design} colorway={colorway} />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-white font-semibold">{design.name}</h3>
          <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap mt-1">{design.placement}</span>
        </div>
        <p className="text-sm text-neutral-400 leading-relaxed flex-1">{design.blurb}</p>
        <p className="text-[11px] font-mono text-neutral-600">
          {printSize(design)} · {DPI} DPI
        </p>
        <div className="flex gap-2 pt-1">
          {(["png", "svg"] as const).map((f) => (
            <button
              key={f}
              onClick={() => download(f)}
              disabled={busy !== null}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-neutral-700/50 rounded-lg transition-colors cursor-pointer"
            >
              {busy === f ? "Preparing…" : f === "png" ? `PNG · ${DPI} DPI` : "SVG"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TeeStudio() {
  const [garment, setGarment] = useState<Garment>("black")
  const [view, setView] = useState<View>("garment")
  const colorway = garments[garment]
  const [bulk, setBulk] = useState(false)

  const total = useMemo(() => designs.length, [])

  const downloadAll = useCallback(async () => {
    setBulk(true)
    try {
      for (const design of designs) {
        await exportDesign(design, colorway, "png")
        // Browsers drop rapid programmatic downloads; give each one room to land.
        await new Promise((r) => setTimeout(r, 400))
      }
    } catch (err) {
      console.error(err)
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBulk(false)
    }
  }, [colorway])

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="page-shell pt-16 pb-10">
        <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-3">Branding · Apparel</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">T-Shirt Designs</h1>
        <p className="text-neutral-400 max-w-2xl leading-relaxed">
          {total} designs, each authored once and rendered for both garments so the black and white versions can
          never drift apart. Artwork is vector with a transparent background — nothing here prints a rectangle.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-neutral-800 p-1 bg-neutral-900/50">
            {(Object.keys(garments) as Garment[]).map((g) => (
              <button
                key={g}
                onClick={() => setGarment(g)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  garment === g ? "bg-white text-neutral-950" : "text-neutral-400 hover:text-white"
                }`}
              >
                {garments[g].label}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-neutral-800 p-1 bg-neutral-900/50">
            {([["garment", "On garment"], ["artwork", "Artwork"]] as [View, string][]).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  view === v ? "bg-white text-neutral-950" : "text-neutral-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={downloadAll}
            disabled={bulk}
            className="px-4 py-2 text-sm font-medium text-white bg-[#ef426f] hover:bg-[#d93862] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            {bulk ? "Exporting…" : `Download all ${total} as PNG`}
          </button>
        </div>
      </section>

      <section className="page-shell pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <Card key={design.id} design={design} colorway={colorway} view={view} />
          ))}
        </div>
      </section>

      <section className="page-shell pb-24">
        <div className="rounded-2xl border border-neutral-800/50 bg-neutral-900/30 p-6 max-w-3xl">
          <h2 className="text-sm font-medium text-white mb-3">Sending these to Printify</h2>
          <ul className="text-xs text-neutral-400 space-y-2 leading-relaxed">
            <li>
              <span className="text-neutral-200">Upload the PNGs, not the SVGs.</span> Printify accepts PNG and JPG
              only. The SVGs are here as the editable source.
            </li>
            <li>
              <span className="text-neutral-200">Export each colourway separately.</span> A design is re-inked for its
              garment — the black-tee file will disappear on a white shirt.
            </li>
            <li>
              <span className="text-neutral-200">The stated size is the intended print size.</span> Scaling a design up
              in Printify past that will soften it.
            </li>
            <li>
              <span className="text-neutral-200">Transparent areas are unprinted garment.</span> That is deliberate —
              the DEVSA mark&apos;s body and the Alamo Python knockouts are shirt showing through, not white ink.
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
