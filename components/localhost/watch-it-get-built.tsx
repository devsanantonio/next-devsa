"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy, Pause, Play } from "lucide-react"

/**
 * Watch downtown get built: the City of San Antonio's section of /localhost.
 *
 * Every building permit the City has issued downtown since January 2025, lit in
 * the order it was issued, on the City's own street centerlines, in the hero's
 * pink. Press play, or drag through the months. New buildings are the big dots,
 * electrical, plumbing and mechanical permits the small ones, demolitions gray.
 *
 * The time-lapse plays from public/localhost/permits.json
 * (scripts/build-permits.py). A click doesn't: it asks the City's live CKAN API
 * for the permits around that spot, and shows the SQL it sent, with a copy
 * button, as the County section does.
 *
 * The public side sits on top: the City's bond projects downtown, as teal rings
 * sized by budget, bright while the City has them under construction and dim once
 * they're done. Private permits in pink, public money in teal, on the same blocks.
 * Their dates are the City's seasons ("Summer 2023"); scripts/build-permits.py
 * says how they're read and which citywide programs are left out.
 *
 * The dataset names a primary contact on every permit, often a private person.
 * The query never asks for it. Project names and full addresses show only on
 * commercial permits; everything else is shown by its block.
 */

type Bond = { name: string; kind: string; x: number; y: number; start: number; end: number; from: string; to: string; budget: number; phase: string; status: string; bond: number }
type Permits = { origin: [number, number]; start: string; asOf: string; kinds: string[]; permits: number[]; streets: number[][]; public: Bond[] }
type Row = { type: string; work: string; name: string; place: string; submitted: string; issued: string; value: number | null; area: number | null }
type Answer = { label: string; rows: Row[]; total: number; request: string }

const SQL_API = "https://data.sanantonio.gov/api/3/action/datastore_search_sql"
const RESOURCE = "c21106f9-3ef5-4f3a-8604-f992b4db7512"
const PINK = "#ef426f"
const TEAL = "#00b2a9"
/** A bond project's ring: about 5 px for $1 million, 14 px for $60 million, before the map's scale factor. */
const ringRadius = (budget: number) => 3 + Math.sqrt(budget / 1e6) * 1.4
const NOT_BUILDING = ["Garage Sale", "Tree Affidavit Permit", "Tree Permit", "On Premise Sign", "Across the Street Banner", "Temporary Weekend Sign", "Feather Sign", "Avenue Sign", "Event Sign", "Inflatable Sign", "Off Premise Billboard", "Billboard Demolition"]
/** The window: about 3.7 km square, from San Pedro Creek to VelocityTX, Main Plaza a little south and west of center. */
const SPAN = 3700, CENTER: [number, number] = [100, 330]
/** How long a full play-through takes, in seconds. */
const PLAY_SECONDS = 24

/**
 * Places the DEVSA crowd knows downtown. LaunchSA is inside the Central Library; Texas Public Radio is at
 * 321 W Commerce; VelocityTX is the bioscience campus at the old Merchant's Ice building. VelocityTX and the
 * convention center are placed where the City's own permits put them, the other two by OpenStreetMap.
 */
const PRESETS = [
  { name: "Geekdom", lon: -98.49337, lat: 29.42637 },
  { name: "LaunchSA", lon: -98.49283, lat: 29.43238 },
  { name: "Texas Public Radio", lon: -98.49652, lat: 29.42525 },
  { name: "VelocityTX", lon: -98.476962, lat: 29.425681 },
  { name: "Henry B. González Convention Center", lon: -98.482753, lat: 29.421226 },
]
/** How far around a spot to look, each way: a building and its neighbors, not just one lot. */
const RADIUS = 120

/** Dot size and ink by kind: new, other building work, trades, demolition. */
const KIND_STYLE = [
  { r: 2.4, color: PINK, alpha: 1, label: "New building" },
  { r: 1.5, color: PINK, alpha: 0.9, label: "Remodel, finish-out, repair" },
  { r: 1.1, color: PINK, alpha: 0.55, label: "Electrical, plumbing, mechanical" },
  { r: 1.5, color: "#b5b5b5", alpha: 0.9, label: "Demolition" },
]

const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
const money = (v: number) => (v >= 1e6 ? `$${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)} million` : `$${Math.round(v).toLocaleString("en-US")}`)
const dateOf = (start: string, day: number) => new Date(Date.parse(`${start}T12:00:00`) + day * 864e5)
const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

/** "AFF - 1231 E COMMERCE ST - Central at Commerce" → "Central at Commerce"; unit and building numbers say nothing. */
function projectName(raw: string | null, address: string) {
  if (!raw || /building no|bldg no|unit no/i.test(raw)) return ""
  const parts = raw.split(/\s+-\s*|-(?=[A-Z][a-z])/).map((p) => p.trim()).filter(Boolean)
  const keep = parts.filter((p) => !/^(aff|sp|spl|sch|express|phased|complex plans|special projects?)$/i.test(p) && !address.toUpperCase().startsWith(p.toUpperCase()))
  // The project's own name comes last ("SP-Special Project-Perlen House-1210 ELMIRA ST").
  return keep[keep.length - 1] ?? ""
}

/** "122 E HOUSTON ST, City of San Antonio, TX 78205" → "100 block of E Houston St". */
function block(address: string) {
  const street = address.split(",")[0].trim()
  const m = street.match(/^(\d+)\s+(.*)$/)
  return m ? `${Math.floor(Number(m[1]) / 100) * 100} block of ${title(m[2])}` : title(street)
}

export function WatchItGetBuilt() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<Permits | null>(null)
  const [day, setDay] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [point, setPoint] = useState<{ lon: number; lat: number; label: string } | null>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [hoverMonth, setHoverMonth] = useState<number | null>(null)
  const streetsRef = useRef<HTMLCanvasElement | null>(null)
  const [layer, setLayer] = useState(0)
  const startedRef = useRef(false)
  const dayRef = useRef(0)
  useEffect(() => {
    dayRef.current = day
  }, [day])

  const lastDay = data ? data.permits[data.permits.length - 4] : 0
  const kx = data ? 111_320 * Math.cos((data.origin[1] * Math.PI) / 180) : 1

  useEffect(() => {
    fetch("/localhost/permits.json")
      .then((r) => r.json())
      .then((d: Permits) => {
        setData(d)
        // Without motion, start at the end: the whole picture, no time-lapse.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setDay(d.permits[d.permits.length - 4])
      })
      .catch(() => {})
  }, [])

  // Months for the bar strip under the slider.
  const months = useMemo(() => {
    if (!data) return []
    const out: { label: string; from: number; to: number; count: number }[] = []
    const [sy, sm, sd] = data.start.split("-").map(Number)
    const [ey, em] = data.asOf.split("-").map(Number)
    const t0 = Date.UTC(sy, sm - 1, sd)
    // Month n counted from the start month; Date.UTC rolls month 13 into the next year.
    for (let n = 0; n <= (ey - sy) * 12 + (em - sm); n++) {
      const from = Math.round((Date.UTC(sy, sm - 1 + n, 1) - t0) / 864e5)
      const to = Math.round((Date.UTC(sy, sm + n, 1) - t0) / 864e5) - 1
      const label = new Date(Date.UTC(sy, sm - 1 + n, 15)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
      out.push({ label, from, to, count: 0 })
    }
    for (let i = 0; i < data.permits.length; i += 4) {
      const mo = out.find((o) => data.permits[i] >= o.from && data.permits[i] <= o.to)
      if (mo) mo.count++
    }
    return out
  }, [data])
  const maxMonth = Math.max(1, ...months.map((m) => m.count))

  // Start playing the first time the map comes into view.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !startedRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        startedRef.current = true
        setPlaying(true)
      }
    }, { threshold: 0.4 })
    io.observe(canvas)
    return () => io.disconnect()
  }, [data])

  useEffect(() => {
    if (!playing || !data) return
    let raf = 0, last = performance.now()
    // Pressing play at the end starts over; otherwise it picks up where the slider is.
    let d = dayRef.current >= lastDay ? 0 : dayRef.current
    const tick = (now: number) => {
      d = Math.min(lastDay, d + (Math.max(0, now - last) / 1000) * (lastDay / PLAY_SECONDS))
      last = now
      setDay(d)
      if (d >= lastDay) setPlaying(false)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, data, lastDay])

  // Streets: drawn once per size, as faint dots on a grid, the way the County map draws 1896.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    const build = () => {
      const W = canvas.clientWidth, H = canvas.clientHeight
      // Mid-resize (a device toggle in dev tools, a collapsing layout) the canvas can be 0 wide for a frame; skip it.
      if (!W || !H) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const off = document.createElement("canvas")
      off.width = W
      off.height = H
      const o = off.getContext("2d", { willReadFrequently: true })!
      const s = Math.min(W, H) / SPAN
      const gap = W < 500 ? 3 : 4
      o.strokeStyle = "#fff"
      // One dot wide: thinner lines fall between the grid's dots and break up into noise.
      o.lineWidth = gap
      o.lineCap = "round"
      for (const line of data.streets) {
        o.beginPath()
        for (let i = 0; i < line.length; i += 2) (i ? o.lineTo : o.moveTo).call(o, W / 2 + (line[i] - CENTER[0]) * s, H / 2 - (line[i + 1] - CENTER[1]) * s)
        o.stroke()
      }
      const img = o.getImageData(0, 0, W, H).data
      const dots = document.createElement("canvas")
      dots.width = W * dpr
      dots.height = H * dpr
      const l = dots.getContext("2d")!
      l.scale(dpr, dpr)
      l.fillStyle = "#2e2e2e"
      l.beginPath()
      for (let y = gap / 2; y < H; y += gap)
        for (let x = gap / 2; x < W; x += gap) {
          if (img[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] < 128) continue
          l.moveTo(x + gap * 0.34, y)
          l.arc(x, y, gap * 0.34, 0, Math.PI * 2)
        }
      l.fill()
      streetsRef.current = dots
      setLayer((n) => n + 1)
    }
    const first = requestAnimationFrame(build)
    let t = 0
    const onResize = () => {
      clearTimeout(t)
      t = window.setTimeout(build, 150)
    }
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(first)
      clearTimeout(t)
      window.removeEventListener("resize", onResize)
    }
  }, [data])

  // Every frame: streets, then each permit issued by `day`. The last three weeks glow.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || !streetsRef.current) return
    const W = canvas.clientWidth, H = canvas.clientHeight
    if (!W || !H) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.width !== W * dpr) {
      canvas.width = W * dpr
      canvas.height = H * dpr
    }
    const ctx = canvas.getContext("2d")!
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(streetsRef.current, 0, 0)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const s = Math.min(W, H) / SPAN
    const k = Math.min(1.4, Math.max(0.8, W / 560))
    const p = data.permits
    for (let i = 0; i < p.length && p[i] <= day; i += 4) {
      const age = day - p[i]
      const st = KIND_STYLE[p[i + 3]]
      const x = W / 2 + (p[i + 1] - CENTER[0]) * s, y = H / 2 - (p[i + 2] - CENTER[1]) * s
      const glow = age < 21 ? 1 - age / 21 : 0
      ctx.globalAlpha = Math.min(1, st.alpha + glow * 0.5)
      ctx.fillStyle = glow > 0.6 ? "#ffd1dc" : st.color
      ctx.beginPath()
      ctx.arc(x, y, st.r * k * (1 + glow * 1.6), 0, Math.PI * 2)
      ctx.fill()
    }
    // Public money on top: bond projects under construction on this day, and the ones already done.
    for (const b of data.public) {
      if (b.start > day) continue
      const done = day > b.end
      const x = W / 2 + (b.x - CENTER[0]) * s, y = H / 2 - (b.y - CENTER[1]) * s
      ctx.globalAlpha = done ? 0.55 : 1
      ctx.strokeStyle = TEAL
      ctx.lineWidth = done ? 1.2 : 2
      ctx.beginPath()
      ctx.arc(x, y, ringRadius(b.budget) * k, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    if (point) {
      const px = W / 2 + ((point.lon - data.origin[0]) * kx - CENTER[0]) * s, py = H / 2 - ((point.lat - data.origin[1]) * 111_320 - CENTER[1]) * s
      ctx.beginPath()
      ctx.arc(px, py, Math.max(8, RADIUS * s), 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255,255,255,0.7)"
      ctx.setLineDash([4, 4])
      ctx.lineWidth = 1.2
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [data, day, point, kx, layer])

  const shown = useMemo(() => {
    if (!data) return { total: 0, built: 0, underway: 0 }
    let total = 0, built = 0
    for (let i = 0; i < data.permits.length && data.permits[i] <= day; i += 4) {
      total++
      if (data.permits[i + 3] === 0) built++
    }
    const underway = data.public.filter((b) => b.start <= day && day <= b.end).length
    return { total, built, underway }
  }, [data, day])

  /** Bond projects within 400 m of the picked spot, from the same file: a street project's point can sit a block or two off. */
  const nearbyPublic = useMemo(() => {
    if (!data || !point) return []
    const px = (point.lon - data.origin[0]) * kx, py = (point.lat - data.origin[1]) * 111_320
    return data.public.filter((b) => Math.hypot(b.x - px, b.y - py) <= 400).sort((a, b) => b.budget - a.budget)
  }, [data, point, kx])

  async function lookUp(lon: number, lat: number, label: string) {
    setPoint({ lon, lat, label })
    setLoading(true)
    setError(null)
    const dx = RADIUS / kx, dy = RADIUS / 111_320
    const sql = `SELECT "PERMIT TYPE","WORK TYPE","PROJECT NAME","ADDRESS","DATE SUBMITTED","DATE ISSUED","DECLARED VALUATION","AREA (SF)"
FROM "${RESOURCE}"
WHERE "X_COORD" <> '' AND "Y_COORD" <> ''
  AND CAST("X_COORD" AS float) BETWEEN ${(lon - dx).toFixed(5)} AND ${(lon + dx).toFixed(5)}
  AND CAST("Y_COORD" AS float) BETWEEN ${(lat - dy).toFixed(5)} AND ${(lat + dy).toFixed(5)}
  AND "PERMIT TYPE" NOT IN (${NOT_BUILDING.map((t) => `'${t}'`).join(",")})
ORDER BY "DATE ISSUED" DESC`
    const request = `${SQL_API}?sql=${encodeURIComponent(sql)}`
    try {
      const r = await fetch(request).then((x) => x.json())
      if (!r.success) throw new Error("The City's API returned an error")
      const records: Record<string, string | null>[] = r.result.records
      const rows: Row[] = records.map((x) => {
        const type = x["PERMIT TYPE"] ?? "Permit"
        const address = x["ADDRESS"] ?? ""
        const commercial = /^comm\b/i.test(type)
        return {
          type: type.replace(/\s*Permit$/, ""),
          work: x["WORK TYPE"] ?? "",
          name: commercial ? projectName(x["PROJECT NAME"], address) : "",
          place: commercial ? title(address.split(",")[0]) : block(address),
          submitted: x["DATE SUBMITTED"] ?? "",
          issued: x["DATE ISSUED"] ?? "",
          value: x["DECLARED VALUATION"] ? Number(x["DECLARED VALUATION"]) : null,
          area: x["AREA (SF)"] ? Number(x["AREA (SF)"]) : null,
        }
      })
      // The biggest first, then the newest.
      rows.sort((a, b) => (b.value ?? 0) - (a.value ?? 0) || b.issued.localeCompare(a.issued))
      setAnswer({ label, rows, total: rows.length, request })
    } catch (e) {
      setAnswer(null)
      setError(e instanceof Error ? e.message : "Lookup failed")
    } finally {
      setLoading(false)
    }
  }

  function onClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    const r = canvas.getBoundingClientRect()
    const s = Math.min(r.width, r.height) / SPAN
    const x = (e.clientX - r.left - r.width / 2) / s + CENTER[0], y = -(e.clientY - r.top - r.height / 2) / s + CENTER[1]
    void lookUp(data.origin[0] + x / kx, data.origin[1] + y / 111_320, "This spot")
  }

  async function copy() {
    if (!answer) return
    await navigator.clipboard.writeText(answer.request)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5)
  const current = data ? dateOf(data.start, day) : null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-8">
      {/* Map, slider and key together never outgrow the window, so a laptop sees the whole time-lapse. */}
      <div className="lg:w-[min(calc(100svh-14rem),56vw)]">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a]">
          <canvas
            ref={canvasRef}
            onClick={onClick}
            className="block aspect-square w-full cursor-crosshair"
            role="img"
            aria-label="Downtown San Antonio's streets in dots, with every building permit the City has issued there since January 2025 appearing in the order it was issued, and the City's bond projects as rings while they're under construction. Click a spot to see the permits there."
          />
          {!data && <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white/50">Loading the City&apos;s permits…</div>}
          {current && (
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-[#0a0a0a]/85 px-3 py-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Issued by</p>
              <p className="font-mono text-lg text-white">{fmtDay(current)}</p>
              <p className="mt-1 font-mono text-[11px] text-white/60">
                {shown.total.toLocaleString("en-US")} permits · {shown.built} new {shown.built === 1 ? "building" : "buildings"}
              </p>
              <p className="font-mono text-[11px]" style={{ color: TEAL }}>
                {shown.underway} public {shown.underway === 1 ? "project" : "projects"} under construction
              </p>
            </div>
          )}
        </div>

        {data && (
          <div className="mt-4">
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-900 transition-colors hover:bg-gray-100"
                aria-label={playing ? "Pause the time-lapse" : "Play the time-lapse"}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
              </button>
              <div className="relative min-w-0 flex-1">
                {/* Permits issued each month: one series, so one hue and no legend. Months not yet reached stay dim. */}
                <div className="flex h-10 items-end gap-[2px]" onMouseLeave={() => setHoverMonth(null)}>
                  {months.map((m, i) => (
                    <div
                      key={m.label}
                      className="flex h-full flex-1 items-end"
                      onMouseEnter={() => setHoverMonth(i)}
                      onClick={() => {
                        setPlaying(false)
                        setDay(m.to)
                      }}
                    >
                      <div
                        className="w-full rounded-t-[3px]"
                        style={{ height: `${(m.count / maxMonth) * 100}%`, backgroundColor: day >= m.from ? PINK : "#333" }}
                      />
                    </div>
                  ))}
                </div>
                {hoverMonth !== null && months[hoverMonth] && (
                  <div
                    className="pointer-events-none absolute bottom-12 -translate-x-1/2 whitespace-nowrap rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 font-mono text-[11px] text-white"
                    style={{ left: `${((hoverMonth + 0.5) / months.length) * 100}%` }}
                  >
                    {months[hoverMonth].label} · {months[hoverMonth].count} permits
                  </div>
                )}
                <input
                  type="range"
                  min={0}
                  max={lastDay}
                  step={1}
                  value={Math.round(day)}
                  onChange={(e) => {
                    setPlaying(false)
                    setDay(Number(e.target.value))
                  }}
                  aria-label="Date"
                  aria-valuetext={current ? fmtDay(current) : undefined}
                  className="mt-2 block w-full accent-[#ef426f]"
                />
              </div>
            </div>
            <div className="mt-1 flex justify-between pl-12 font-mono text-[11px] text-white/50">
              <span>Jan 2025</span>
              <span>{fmtDay(new Date(`${data.asOf}T12:00:00`))}</span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-white/60" aria-label="Permit key">
              {KIND_STYLE.map((k) => (
                <li key={k.label} className="inline-flex items-center gap-1.5">
                  <span className="rounded-full" style={{ width: k.r * 3, height: k.r * 3, backgroundColor: k.color, opacity: k.alpha }} />
                  {k.label}
                </li>
              ))}
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2" style={{ borderColor: TEAL }} />
                City bond project, under construction
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border opacity-60" style={{ borderColor: TEAL }} />
                done
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">Try</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => void lookUp(p.lon, p.lat, p.name)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                point?.label === p.name ? "border-white bg-white text-black" : "border-neutral-800 text-white/70 hover:border-neutral-600 hover:text-white"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          {!point && (
            <>
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">What&apos;s being built?</p>
              <p className="mt-3 text-lg leading-relaxed text-white/80">
                Click the map or pick a place, and the page asks the City&apos;s API what&apos;s being built there.
              </p>
            </>
          )}
          {point && (
            <>
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">{point.label} · since Jan 2025</p>
              {loading && <p className="mt-3 text-white/60">Asking the City…</p>}
              {error && <p className="mt-3 text-[#ff8200]">{error}. Try again in a moment.</p>}
              {answer && !loading && (
                <>
                  {answer.rows.length ? (
                    <>
                      <p className="mt-3 text-white">
                        <span className="font-semibold">
                          {answer.total} {answer.total === 1 ? "permit" : "permits"}
                        </span>{" "}
                        <span className="text-white/60">within about {RADIUS} m</span>
                      </p>
                      <ul className="mt-3 space-y-3">
                        {answer.rows.slice(0, 5).map((r, i) => (
                          <li key={i} className="text-sm leading-relaxed">
                            <span className="font-semibold text-white">{r.name || r.type}</span>
                            {r.value ? <span className="text-white"> · {money(r.value)}</span> : null}
                            <span className="block text-white/60">
                              {r.name ? `${r.type} · ` : ""}
                              {r.place}
                              {r.issued ? ` · issued ${fmtDay(new Date(`${r.issued.slice(0, 10)}T12:00:00`))}` : ""}
                              {r.submitted && r.issued
                                ? days(r.submitted, r.issued) > 0
                                  ? `, ${days(r.submitted, r.issued)} ${days(r.submitted, r.issued) === 1 ? "day" : "days"} after it was filed`
                                  : ", the day it was filed"
                                : ""}
                              {r.area ? ` · ${r.area.toLocaleString("en-US")} sq ft` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {answer.rows.length > 5 && <p className="mt-3 text-sm text-white/50">and {answer.rows.length - 5} more in the response.</p>}
                    </>
                  ) : (
                    <p className="mt-3 text-white/70">No building permits right here since January 2025.</p>
                  )}
                </>
              )}
              {nearbyPublic.length > 0 && (
                <div className="mt-5 border-t border-neutral-800 pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: TEAL }}>
                    Public money nearby · City bond projects
                  </p>
                  <ul className="mt-3 space-y-3">
                    {nearbyPublic.map((b) => (
                      <li key={b.name + b.start} className="text-sm leading-relaxed">
                        <span className="font-semibold text-white">{b.name}</span>
                        {b.budget ? <span className="text-white"> · {money(b.budget)}</span> : null}
                        <span className="block text-white/60">
                          {b.phase === "Complete" ? "Done" : `Under ${b.phase.toLowerCase()}`} · {b.status.toLowerCase()} · construction {b.from} to {b.to}, by the City&apos;s estimate · {b.bond} bond
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {answer && (
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a]">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">The request</p>
              <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-white/70 hover:text-white">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-white/70">
              <span className="text-[#ef426f]">GET</span> …/datastore_search_sql?sql={"\n"}
              {"  "}SELECT &quot;PERMIT TYPE&quot;, &quot;DATE ISSUED&quot;, …{"\n"}
              {"  "}FROM &quot;{RESOURCE.slice(0, 8)}…&quot;{"\n"}
              {"  "}WHERE X_COORD, Y_COORD within {RADIUS} m of{"\n"}
              {"  "}{point?.lon.toFixed(5)}, {point?.lat.toFixed(5)}
            </pre>
            <p className="border-t border-neutral-800 px-4 py-2 text-xs text-white/50">
              No key needed. Copy gives you the whole request; the SQL in it is plain Postgres.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
