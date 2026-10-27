"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

/**
 * Follow the water: Bexar County's section of /localhost.
 *
 * San Antonio from 1718, told through its ditches. Scroll and the years pass on
 * a map in the hero's dots: the river and San Pedro Creek, then the acequias
 * appearing in the year each was dug and going dry in the year it was
 * abandoned, the fields and land grants they fed, the 1896 city built over
 * them, and Geekdom's corner today.
 *
 * Every date and line is the County's: its Tricentennial layers, packed by
 * scripts/build-water.py into public/localhost/water.json, with the 1896
 * Sanborn map from sanborn.json on top (same origin, Main Plaza, in meters).
 * The last step queries the County's live acequia layer and shows the request.
 *
 * Grantees are named: settlers of the 1700s, many of them Canary Islanders.
 */

type Acequia = { name: string; for: string; dug: number; dry: number; paths: number[][] }
type Lot = { name: string; year: number | null; labor: string; rings: number[][] }
type Water = {
  origin: [number, number]
  river: number[][]
  creek: number[][]
  acequias: Acequia[]
  fields: { name: string; rings: number[][] }[]
  lots: Lot[]
  places: { name: string; at: [number, number] }[]
}
type Sanborn = { buildings: [number, number[]][]; blocks: number[][] }
type Step = { year: number; center: [number, number]; span: number; eyebrow: string; title: string; body: React.ReactNode }

const API = "https://services1.arcgis.com/8onVmslF2KXErTHT/arcgis/rest/services"
const GEEKDOM: [number, number] = [14, 199]
const GEEKDOM_LONLAT = [-98.49337, 29.42637]
const COLORS = { river: "#6fa8e0", acequia: "#00b2a9", field: "#e8c562", city: "#c9c9c9", block: "#262626", here: "#ff8200" }

/** Where along a path the first `f` of its length ends: the ditches draw themselves as they're dug. */
function partial(path: number[], f: number) {
  if (f >= 1) return path
  let total = 0
  for (let i = 2; i < path.length; i += 2) total += Math.hypot(path[i] - path[i - 2], path[i + 1] - path[i - 1])
  let left = total * f
  const out = [path[0], path[1]]
  for (let i = 2; i < path.length; i += 2) {
    const d = Math.hypot(path[i] - path[i - 2], path[i + 1] - path[i - 1])
    if (d >= left) {
      out.push(path[i - 2] + ((path[i] - path[i - 2]) * left) / d, path[i - 1] + ((path[i + 1] - path[i - 1]) * left) / d)
      return out
    }
    left -= d
    out.push(path[i], path[i + 1])
  }
  return out
}

function inside(x: number, y: number, ring: number[]) {
  let c = false
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2)
    if (ring[i + 1] > y !== ring[j + 1] > y && x < ((ring[j] - ring[i]) * (y - ring[i + 1])) / (ring[j + 1] - ring[i + 1]) + ring[i]) c = !c
  return c
}

function nearest(water: Water, [x, y]: [number, number]) {
  let best = { d: Infinity, a: water.acequias[0] }
  for (const a of water.acequias)
    for (const p of a.paths)
      for (let i = 2; i < p.length; i += 2) {
        const [x1, y1, x2, y2] = [p[i - 2], p[i - 1], p[i], p[i + 1]]
        const L = (x2 - x1) ** 2 + (y2 - y1) ** 2 || 1
        const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / L))
        const d = Math.hypot(x - (x1 + t * (x2 - x1)), y - (y1 + t * (y2 - y1)))
        if (d < best.d) best = { d, a }
      }
  return best
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

export function FollowTheWater({ today }: { today: { events: number; groups: string[] } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const [water, setWater] = useState<Water | null>(null)
  const [sanborn, setSanborn] = useState<Sanborn | null>(null)
  const [active, setActive] = useState(0)
  const [year, setYear] = useState(1700)
  const [tip, setTip] = useState<{ x: number; y: number; lot: Lot } | null>(null)
  const [live, setLive] = useState<{ loading: boolean; rows: { name: string; dug: number; dry: number }[] | null; error: boolean }>({ loading: false, rows: null, error: false })
  const [copied, setCopied] = useState(false)
  const view = useRef({ cx: -300, cy: 1500, span: 6500, year: 1700 })

  useEffect(() => {
    fetch("/localhost/water.json").then((r) => r.json()).then(setWater).catch(() => {})
    fetch("/localhost/sanborn.json").then((r) => r.json()).then(setSanborn).catch(() => {})
  }, [])

  const close = useMemo(() => (water ? nearest(water, GEEKDOM) : null), [water])
  const grantees1731 = useMemo(
    () => (water ? water.lots.filter((l) => l.year === 1731 && !/mission|presidio|casas|buildings/i.test(l.name)).map((l) => l.name) : []),
    [water],
  )

  const steps: Step[] = [
    {
      year: 1700, center: [-300, 1500], span: 6500,
      eyebrow: "Before 1718", title: "First, water.",
      body: <>Before there was a city there was the San Antonio River and San Pedro Creek, both fed by springs a few miles north of downtown. Everything that follows is about getting their water to where people lived.</>,
    },
    {
      year: 1720, center: [-300, 1500], span: 6500,
      eyebrow: "1718", title: "A presidio, a mission, and ditches.",
      body: <>In 1718 Spain founded the Presidio de Béxar and Mission San Antonio de Valero, later called the Alamo. The County dates the first acequias to that same year: the Acequia Principal and the San Pedro. A third, the Segundo, was abandoned a year later.</>,
    },
    {
      year: 1731, center: [1500, -5000], span: 17000,
      eyebrow: "1720 – 1731", title: "Down the river, four more missions.",
      body: <>Concepción, San José, San Juan and Espada lined the river to the south, each with its own acequia, dug by the Native people who lived and worked at the missions. Watch them reach out from the river one by one.</>,
    },
    {
      year: 1732, center: [-200, 300], span: 3400,
      eyebrow: "1731", title: "The Canary Islanders.",
      body: (
        <>
          In 1731 families from the Canary Islands arrived to found the Villa de San Fernando, San Antonio&apos;s first civil town,
          and were granted lots between the creek and the river
          {grantees1731.length > 0 && <>: {grantees1731.slice(0, 5).join(", ")} and more</>}. Hover a lot to read whose it was.
        </>
      ),
    },
    {
      year: 1794, center: [400, -2500], span: 11000,
      eyebrow: "1734 – 1794", title: "Ditches made fields.",
      body: <>The land along each acequia was split into long farm lots, the labores. The County maps {water ? water.lots.length : 348} land grants, each with its grantee and year. Hover one.</>,
    },
    {
      year: 1896, center: [0, 330], span: 2400,
      eyebrow: "1776 – 1912", title: "The city covers the water.",
      body: <>The Upper Labor ditch, dug from 1776, was the last big one. As the city piped in its water, the ditches went dry one by one: Concepción&apos;s in 1869, the Upper Labor in 1896, the Principal and the Alamo&apos;s in 1905, the San Pedro in 1912. By 1896 the Sanborn map shows downtown built over them. Look at where the blocks bend.</>,
    },
    {
      year: 2026, center: [GEEKDOM[0], GEEKDOM[1] + 60], span: 900,
      eyebrow: "Today", title: "Geekdom's corner.",
      body: close ? (
        <>
          The {close.a.name}, dug in {close.a.dug}, ran about {Math.round(close.d / 10) * 10} m from Houston and Soledad, the corner
          where Geekdom is now. It went dry in {close.a.dry}. DEVSA has brought {today.events} meetups from {today.groups.length} tech
          groups to this corner.
        </>
      ) : null,
    },
  ]

  // Which step is in the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step))
      },
      { rootMargin: "-45% 0px -45% 0px" },
    )
    stepRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [water])

  // Glide the camera and the clock to the active step, then stop drawing.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !water) return
    const ctx = canvas.getContext("2d")!
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const target = steps[active]
    const from = { ...view.current }
    const to = { cx: target.center[0], cy: target.center[1], span: target.span, year: target.year }
    const ms = reduced ? 0 : Math.min(2600, 1000 + Math.abs(to.year - from.year) * 12)
    const t0 = performance.now()
    let raf = 0

    const off = document.createElement("canvas")
    const o = off.getContext("2d", { willReadFrequently: true })!

    const draw = () => {
      const W = canvas.clientWidth, H = canvas.clientHeight
      // Mid-resize (a device toggle in dev tools, a collapsing layout) the canvas can be 0 wide for a frame; skip it.
      if (!W || !H) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.round(W * dpr)) {
        canvas.width = Math.round(W * dpr)
        canvas.height = Math.round(H * dpr)
      }
      if (off.width !== W) {
        off.width = W
        off.height = H
      }
      const v = view.current
      const s = Math.min(W, H) / v.span
      const X = (x: number) => W / 2 + (x - v.cx) * s, Y = (y: number) => H / 2 - (y - v.cy) * s
      const gap = W < 500 ? 3 : 4
      const path = (flat: number[], close: boolean) => {
        o.beginPath()
        for (let i = 0; i < flat.length; i += 2) (i ? o.lineTo : o.moveTo).call(o, X(flat[i]), Y(flat[i + 1]))
        if (close) o.closePath()
      }
      const stroke = (flat: number[], meters: number) => {
        path(flat, false)
        o.lineWidth = Math.max(gap * 0.9, meters * s)
        o.stroke()
      }
      const y = v.year
      o.globalAlpha = 1
      o.fillStyle = "#000"
      o.fillRect(0, 0, W, H)
      o.lineCap = o.lineJoin = "round"

      // 1896: blocks and buildings, growing in from the 1870s.
      const city = Math.max(0, Math.min(1, (y - 1866) / 30))
      if (sanborn && city > 0) {
        o.globalAlpha = city
        o.fillStyle = COLORS.block
        for (const b of sanborn.blocks) {
          path(b, true)
          o.fill()
        }
      }
      // Fields, then the grants on them, each in its year.
      const fieldA = Math.max(0, Math.min(1, (y - 1718) / 20)) * (city > 0 ? 0.08 : 0.16)
      if (fieldA > 0) {
        o.globalAlpha = fieldA
        o.fillStyle = COLORS.field
        for (const f of water.fields) for (const r of f.rings) {
          path(r, true)
          o.fill()
        }
      }
      o.fillStyle = COLORS.field
      for (const l of water.lots) {
        const when = l.year ?? 1794
        if (y < when) continue
        o.globalAlpha = Math.min(1, (y - when + 1) / 3) * (city > 0 ? 0.3 * (1 - city) + 0.1 : 0.55)
        for (const r of l.rings) {
          path(r, true)
          o.fill()
        }
      }
      // The water.
      o.globalAlpha = 1
      o.fillStyle = COLORS.river
      o.strokeStyle = COLORS.river
      for (const r of water.river) {
        path(r, true)
        o.fill()
      }
      for (const c of water.creek) stroke(c, 14)
      o.strokeStyle = COLORS.acequia
      for (const a of water.acequias) {
        if (y < a.dug) continue
        // A ditch draws itself over its first two years, and leaves a trace once it's dry. Today, the one
        // that ran past Geekdom lights up again.
        const grow = Math.min(1, (y - a.dug + 0.5) / 2)
        const lit = y >= 2000 && close && a.name === close.a.name
        o.globalAlpha = lit || y < a.dry ? 1 : Math.max(0.28, 1 - (y - a.dry) / 8)
        for (const p of a.paths) stroke(partial(p, grow), 9)
      }
      if (sanborn && city > 0) {
        // Today the 1896 city steps back: it's what was here, not what is.
        o.globalAlpha = y >= 2000 ? 0.4 : city
        o.fillStyle = COLORS.city
        for (const [, ring] of sanborn.buildings) {
          path(ring, true)
          o.fill()
        }
      }
      o.globalAlpha = 1

      // Read it back on the dot grid.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const img = o.getImageData(0, 0, W, H).data
      const r = gap * 0.38
      for (let py = gap / 2; py < H; py += gap)
        for (let px = gap / 2; px < W; px += gap) {
          const i = (Math.floor(py) * W + Math.floor(px)) * 4
          if (img[i] + img[i + 1] + img[i + 2] < 30) continue
          ctx.fillStyle = `rgb(${img[i]},${img[i + 1]},${img[i + 2]})`
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        }

      // Places, labeled. Geekdom only today.
      ctx.font = `${W < 500 ? 10 : 11}px ${getComputedStyle(canvas).fontFamily}`
      ctx.textBaseline = "middle"
      const label = (name: string, x: number, yy: number, color: string, size = 4) => {
        if (x < -20 || x > W + 20 || yy < -20 || yy > H + 20) return
        ctx.beginPath()
        ctx.arc(x, yy, size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = "#0a0a0a"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "rgba(255,255,255,0.85)"
        ctx.fillText(name, x + size + 4, yy)
      }
      if (y >= 1718 && y < 2000)
        for (const p of water.places) {
          const early = /Valero|Presidio/.test(p.name)
          if (!early && y < 1720) continue
          label(p.name.replace("Presidio San Antonio de Béxar", "Presidio de Béxar").replace("Mission de Valero", "Mission Valero"), X(p.at[0]), Y(p.at[1]), "#fafafa")
        }
      if (y >= 2000) label("Geekdom", X(GEEKDOM[0]), Y(GEEKDOM[1]), COLORS.here, 7)
    }

    const frame = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1
      const e = ease(t)
      // Zoom in log space, so a long zoom doesn't rush through the close-up.
      view.current = {
        cx: from.cx + (to.cx - from.cx) * e,
        cy: from.cy + (to.cy - from.cy) * e,
        span: Math.exp(Math.log(from.span) + (Math.log(to.span) - Math.log(from.span)) * e),
        year: from.year + (to.year - from.year) * Math.min(1, t * 1.15),
      }
      setYear(Math.round(view.current.year))
      draw()
      if (t < 1) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const onResize = () => draw()
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
    // steps is rebuilt each render from the same data; active, water and sanborn are what change it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, water, sanborn, close])

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas || !water || year < 1731 || year > 1900) return setTip(null)
    const r = canvas.getBoundingClientRect()
    const v = view.current
    const s = Math.min(r.width, r.height) / v.span
    const x = (e.clientX - r.left - r.width / 2) / s + v.cx, y = -(e.clientY - r.top - r.height / 2) / s + v.cy
    const lot = water.lots.find((l) => (l.year ?? 1794) <= year && l.name && l.rings.some((ring) => inside(x, y, ring)))
    setTip(lot ? { x: e.clientX - r.left, y: e.clientY - r.top, lot } : null)
  }

  const request = `${API}/RullmanAcequia/FeatureServer/0/query?geometry=${GEEKDOM_LONLAT.join(",")}&geometryType=esriGeometryPoint&inSR=4326&distance=400&units=esriSRUnit_Meter&outFields=Name,YrCreate,YrAband&returnGeometry=false&f=json`
  async function run() {
    setLive({ loading: true, rows: null, error: false })
    try {
      const d = await fetch(request).then((r) => r.json())
      if (d.error) throw new Error()
      const seen = new Set<string>()
      const rows = (d.features ?? [])
        .map((f: { attributes: { Name: string; YrCreate: number; YrAband: number } }) => ({ name: f.attributes.Name.replace(/\s+/g, " "), dug: f.attributes.YrCreate, dry: f.attributes.YrAband }))
        .filter((r: { name: string }) => (seen.has(r.name) ? false : (seen.add(r.name), true)))
      setLive({ loading: false, rows, error: false })
    } catch {
      setLive({ loading: false, rows: null, error: true })
    }
  }
  async function copy() {
    await navigator.clipboard.writeText(request)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
      {/* The map stays put while the story scrolls past it, square and never taller than the window, so a laptop
          sees all of it. */}
      <div className="sticky top-16 z-10 -mx-4 bg-neutral-950/95 px-4 py-2 lg:order-2 lg:top-24 lg:mx-0 lg:w-[min(calc(100svh-10rem),58vw)] lg:self-start lg:bg-transparent lg:p-0">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a]">
          <canvas
            ref={canvasRef}
            onPointerMove={onMove}
            onPointerLeave={() => setTip(null)}
            className="block aspect-[4/3] w-full font-mono lg:aspect-square"
            role="img"
            aria-label="Downtown San Antonio drawn in dots from Bexar County's maps: the river and San Pedro Creek, the Spanish acequias appearing as they were dug and fading as they went dry, the fields and land grants they fed, and the 1896 city over them."
          />
          {!water && <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white/50">Tracing the acequias…</div>}
          <p className="pointer-events-none absolute left-3 top-3 rounded-lg bg-[#0a0a0a]/85 px-3 py-1.5 font-mono text-2xl text-white md:text-3xl" aria-live="polite">
            {year < 1718 ? "Before 1718" : year}
          </p>
          {tip && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-white"
              style={{ left: tip.x, top: tip.y - 10 }}
            >
              <span className="font-semibold">{tip.lot.name}</span>
              <span className="text-white/60">
                {tip.lot.year ? ` · granted ${tip.lot.year}` : ""}
                {tip.lot.labor.trim() ? ` · ${tip.lot.labor}` : ""}
              </span>
            </div>
          )}
        </div>
        <ul className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-white/60 sm:flex" aria-label="Map key">
          {[["River and creek", COLORS.river], ["Acequias", COLORS.acequia], ["Fields and land grants", COLORS.field], ["1896 buildings", COLORS.city]].map(([l, c]) => (
            <li key={l} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c }} />
              {l}
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0 lg:order-1">
        {steps.map((s, i) => (
          <div
            key={s.eyebrow}
            ref={(el) => {
              stepRefs.current[i] = el
            }}
            data-step={i}
            className="flex min-h-[70vh] items-center py-8 first:min-h-[50vh]"
          >
            <div className={`w-full min-w-0 rounded-2xl border bg-neutral-900 p-6 transition-colors duration-300 ${active === i ? "border-neutral-600" : "border-neutral-800"}`}>
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">{s.eyebrow}</p>
              <h3 className="mt-2 text-xl font-bold leading-snug text-white md:text-2xl">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-white/75">{s.body}</p>
              {i === steps.length - 1 && (
                <div className="mt-5 overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a]">
                  <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">Ask the County</p>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-white/70 hover:text-white">
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <button type="button" onClick={run} className="rounded-md bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-gray-900 transition-colors hover:bg-gray-100">
                        Run it
                      </button>
                    </div>
                  </div>
                  <pre className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-white/70">
                    <span className="text-[#00b2a9]">GET</span> …/RullmanAcequia/FeatureServer/0/query{"\n"}
                    {"  "}?geometry={GEEKDOM_LONLAT.join(",")}&amp;distance=400{"\n"}
                    {"  "}&amp;outFields=Name,YrCreate,YrAband{"\n"}
                    {live.loading && <span className="text-white/50">→ asking…</span>}
                    {live.error && <span className="text-[#ff8200]">→ the County didn&apos;t answer; try again</span>}
                    {live.rows && (
                      <>
                        <span className="text-white/50">→ </span>
                        {live.rows.length ? live.rows.map((r) => `${r.name} (${r.dug}–${r.dry})`).join("\n  ") : "nothing within 400 m"}
                      </>
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
