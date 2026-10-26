"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

/**
 * Outrun the 4: VIA's section of /localhost.
 *
 * You start at Navarro & Houston, a block from Geekdom, and the real next Route 4
 * is one stop behind you. The bus keeps VIA's published schedule, stop by stop
 * and to the second, sped up 24 times: slow through downtown, faster up San
 * Pedro. You run at one steady pace, set just fast enough that a clean run beats
 * that trip to North Star Transit Center. Hit something on the sidewalk and you
 * lose a beat, and the bus doesn't.
 *
 * Which trip you race depends on when you press play (San Antonio time, with
 * VIA's holiday service), so rush hour plays differently from midnight. When it
 * ends you get the next real departures from Navarro & Houston, and the rows of
 * stop_times.txt the bus ran on.
 *
 * Drawn on a dot matrix, like a bus's LED headsign. Schedule from
 * public/localhost/via-route-4.json (scripts/build-via-game.py).
 */

type Service = "weekday" | "saturday" | "sunday"
type Stop = { id: string; name: string; d: number }
type Trip = [string, number[]]
type Via = {
  feed: { version: string; start: string; end: string; url: string }
  route: { short: string; long: string; headsign: string; color: string }
  stops: Stop[]
  trips: Record<Service, Trip[]>
  exceptions: Record<string, Service>
}
type Pick = { service: Service; list: Trip[]; i: number; tomorrow: boolean }
type Result = { won: boolean; beaten: number; miles: number; after: string; at: number }

const TZ = "America/Chicago"
/** Scheduled seconds per game second. */
const SPEEDUP = 24
/** How much faster than the bus's best average you run. A clean run wins by about this much. */
const MARGIN = 1.04
/** Game seconds lost to each stumble. */
const STUMBLE = 0.6
/** The matrix is always this many dots tall; the dot size follows the canvas. */
const ROWS = 48
const GROUND = ROWS - 7
/** Screen widths per game second at running pace. */
const PACE = 0.5
const JUMP_H = 13
const JUMP_T = 0.5
const G = (8 * JUMP_H) / (JUMP_T * JUMP_T)
const VY = (G * JUMP_T) / 2

const sprite = (rows: string[]) => {
  const cells: [number, number][] = []
  rows.forEach((r, y) => [...r].forEach((c, x) => c === "#" && cells.push([x, y])))
  return { cells, w: rows[0].length, h: rows.length }
}
const RUN = [
  sprite(["...###....", "...###....", "...###....", "....#.....", "..#####...", ".#.###.#..", "#..###..#.", "...###....", "...#.#....", "..#...#...", ".#....#...", ".#.....#.."]),
  sprite(["...###....", "...###....", "...###....", "....#.....", "..#####...", "..####.#..", "..###.#...", "...###....", "....##....", "....#.#...", "...#..#...", "...#..#..."]),
]
const LEAP = sprite(["...###....", "...###....", "...###....", "....#.....", ".#######..", "#..###..#.", "...###....", "...###....", "..#...#...", ".#.....#..", "..........", ".........."])
const OBSTACLES = [
  { name: "cone", color: 4, s: sprite(["..#..", "..#..", ".###.", ".###.", "#####", "#####"]) },
  { name: "barricade", color: 4, s: sprite(["#.......#", "#########", "#.#.#.#.#", "#########", "#.......#", "#.......#", "#.......#"]) },
  { name: "scooter", color: 4, s: sprite([".......#", "......#.", "......#.", "#######.", "##....##", "##....##"]) },
  { name: "puddle", color: 5, s: sprite([".##########.", "############"]) },
]
const SIGN = sprite(["#####", "#...#", "#.#.#", "#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."])

/** A bus, built rather than drawn: body, a window band, the windshield, an amber headsign, two wheels. */
function busSprite() {
  const L = 46, H = 16
  const body: [number, number][] = [], dark: [number, number][] = [], sign: [number, number][] = [], wheel: [number, number][] = []
  for (let y = 0; y < H - 2; y++)
    for (let x = 0; x < L; x++) {
      if ((y === 0 && (x === 0 || x === L - 1)) || (y === H - 3 && (x === 0 || x === L - 1))) continue
      const front = x >= L - 6
      if (y >= 1 && y <= 2 && x >= L - 16 && x <= L - 3) sign.push([x, y])
      else if (y >= 4 && y <= 7 && !front && x >= 2 && (x - 2) % 6 !== 5) dark.push([x, y])
      else if (front && y >= 3 && y <= 8 && x <= L - 2) dark.push([x, y])
      else if (x >= L - 11 && x <= L - 8 && y >= 4 && y <= 12) dark.push([x, y])
      else body.push([x, y])
    }
  for (const cx of [8, L - 13]) for (let x = -2; x <= 2; x++) for (let y = 0; y < 3; y++) if (Math.abs(x) + y < 4) wheel.push([cx + x, H - 3 + y])
  return { body, dark, sign, wheel, w: L, h: H }
}
const BUS = busSprite()

const PALETTE = ["", "#232323", "#525252", "#f5f5f5", "#b5b5b5", "#6fa8e0", "#ff8200", "", "#ffb547"]

function partsOf(date: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(date).map((x) => [x.type, x.value]),
  )
  return { ymd: `${p.year}${p.month}${p.day}`, wd: p.weekday, secs: +p.hour * 3600 + +p.minute * 60 + +p.second }
}

/** The next Route 4 to leave Navarro & Houston, on whichever service VIA runs today. */
function pickTrip(data: Via, now: Date): Pick {
  const service = (d: { ymd: string; wd: string }): Service =>
    data.exceptions[d.ymd] ?? (d.wd === "Sat" ? "saturday" : d.wd === "Sun" ? "sunday" : "weekday")
  const today = partsOf(now)
  // GTFS keeps a late trip on the day it started, at 24:10:00 and so on.
  const yesterday = partsOf(new Date(now.getTime() - 864e5))
  const late = data.trips[service(yesterday)]
  const j = late.findIndex((t) => t[1][1] >= today.secs + 86400)
  if (j >= 0) return { service: service(yesterday), list: late, i: j, tomorrow: false }
  const list = data.trips[service(today)]
  const i = list.findIndex((t) => t[1][1] >= today.secs)
  if (i >= 0) return { service: service(today), list, i, tomorrow: false }
  const next = data.trips[service(partsOf(new Date(now.getTime() + 864e5)))]
  return { service: service(partsOf(new Date(now.getTime() + 864e5))), list: next, i: 0, tomorrow: true }
}

function clock(s: number, seconds = false) {
  const h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, sec = Math.floor(s) % 60
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${seconds ? `:${String(sec).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`
}
const hms = (s: number) =>
  [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((v) => String(v).padStart(2, "0")).join(":")

/** Where the bus is, in miles, at a scheduled time: VIA's times, straight lines between stops. */
function busAt(stops: Stop[], times: number[], t: number) {
  if (t <= times[0]) return stops[0].d
  for (let k = 0; k < times.length - 1; k++)
    if (t < times[k + 1]) return stops[k].d + ((stops[k + 1].d - stops[k].d) * (t - times[k])) / Math.max(1, times[k + 1] - times[k])
  return stops[stops.length - 1].d
}

export function OutrunThe4() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  // The readouts change every frame, so the loop writes them directly rather than through state.
  const nextRef = useRef<HTMLSpanElement>(null)
  const distRef = useRef<HTMLSpanElement>(null)
  const gapRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const youRef = useRef<HTMLSpanElement>(null)
  const busRef = useRef<HTMLSpanElement>(null)
  const [data, setData] = useState<Via | null>(null)
  const [pick, setPick] = useState<Pick | null>(null)
  const [phase, setPhase] = useState<"ready" | "running" | "over">("ready")
  const [result, setResult] = useState<Result | null>(null)
  const [best, setBest] = useState(0)
  const [copied, setCopied] = useState(false)
  const control = useRef<{ start: () => void; jump: () => void } | null>(null)

  useEffect(() => {
    fetch("/localhost/via-route-4.json")
      .then((r) => r.json())
      .then((d: Via) => {
        setData(d)
        setPick(pickTrip(d, new Date()))
        try {
          setBest(Number(localStorage.getItem("localhost:via-best")) || 0)
        } catch {}
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || !pick) return
    const ctx = canvas.getContext("2d")!
    const stops = data.stops
    const end = stops[stops.length - 1].d
    const times = pick.list[pick.i][1]
    const t0 = times[0]
    // Fast enough to beat the bus to every stop on a clean run, not just the last one.
    const v = MARGIN * Math.max(...stops.slice(1).map((s, k) => s.d / Math.max(1, times[k + 1] - t0))) * SPEEDUP
    const font = getComputedStyle(canvas).fontFamily

    let W = 0, H = 0, dpr = 1, cell = 6, cols = 0, ppm = 0, runCol = 0
    let grid = new Uint8Array(0)
    let backdrop: HTMLCanvasElement | null = null

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas!.clientWidth
      H = canvas!.clientHeight
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      cell = H / ROWS
      cols = Math.ceil(W / cell)
      runCol = Math.round(cols * 0.24)
      ppm = (PACE * cols) / v
      grid = new Uint8Array(cols * ROWS)
      // The unlit matrix, drawn once.
      backdrop = document.createElement("canvas")
      backdrop.width = W * dpr
      backdrop.height = H * dpr
      const b = backdrop.getContext("2d")!
      b.scale(dpr, dpr)
      b.fillStyle = "#141414"
      b.beginPath()
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < cols; x++) {
          b.moveTo((x + 0.5) * cell + cell * 0.38, (y + 0.5) * cell)
          b.arc((x + 0.5) * cell, (y + 0.5) * cell, cell * 0.38, 0, Math.PI * 2)
        }
      b.fill()
    }

    // One run's state.
    let d = 0, t = 0, y = 0, vy = 0, lostUntil = -1, buffered = -1, raf = 0, last = 0, visible = true
    let running = false, seed = 1
    let obstacles: { d: number; k: number; hit: boolean }[] = []
    let nextOb = 0.05
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }
    const sky: { x: number; w: number; h: number }[] = []
    const skyAt = (x: number) => {
      while (!sky.length || sky[sky.length - 1].x < x + cols) {
        const prev = sky[sky.length - 1]
        const sx = prev ? prev.x + prev.w + 1 + Math.floor(Math.random() * 3) : -cols
        // Tall downtown, lower up San Pedro: the skyline follows where the route is.
        const mi = sx / 0.35 / ppm
        const tall = mi < 0.75 ? 26 : mi < 2.5 ? 12 : 7
        sky.push({ x: sx, w: 5 + Math.floor(Math.random() * 9), h: 3 + Math.floor(Math.random() * tall) })
      }
    }

    function reset() {
      d = 0; t = 0; y = 0; vy = 0; lostUntil = -1; buffered = -1
      obstacles = []
      nextOb = 0.05
      seed = (Date.now() & 0xffff) + 7
    }

    const put = (x: number, yy: number, c: number) => {
      if (x >= 0 && x < cols && yy >= 0 && yy < ROWS) grid[yy * cols + x] = c
    }

    function paint() {
      grid.fill(0)
      const cam = Math.floor(d * ppm)
      const col = (mi: number) => runCol + Math.floor(mi * ppm) - cam
      // Skyline, at a third of the speed.
      const skyCam = Math.floor(cam * 0.35)
      skyAt(skyCam)
      for (const b of sky) {
        const x0 = b.x - skyCam
        if (x0 > cols || x0 + b.w < 0) continue
        for (let x = 0; x < b.w; x++) for (let k = 0; k < b.h; k++) put(x0 + x, GROUND - 1 - k, 1)
      }
      // Sidewalk, and grit that moves with it.
      for (let x = 0; x < cols; x++) {
        put(x, GROUND, 2)
        const wx = x + cam
        for (let r = 2; r < 6; r++) if (((wx * 73856093) ^ (r * 19349663)) % 23 === 0) put(x, GROUND + r, 2)
      }
      for (const s of stops) {
        const x = col(s.d)
        if (x < -10 || x > cols + 10) continue
        SIGN.cells.forEach(([sx, sy]) => put(x - 6 + sx, GROUND - SIGN.h + sy, 6))
      }
      for (const o of obstacles) {
        const x = col(o.d)
        const s = OBSTACLES[o.k].s
        if (x > cols || x + s.w < 0) continue
        s.cells.forEach(([sx, sy]) => put(x + sx, GROUND - s.h + sy + (o.hit ? 1 : 0), o.hit ? 2 : OBSTACLES[o.k].color))
      }
      const bx = col(busAt(stops, times, t0 + t * SPEEDUP)) - BUS.w
      if (bx < cols && bx + BUS.w > 0) {
        const by = GROUND - BUS.h + 1
        BUS.body.forEach(([sx, sy]) => put(bx + sx, by + sy, 7))
        BUS.sign.forEach(([sx, sy]) => put(bx + sx, by + sy, 8))
        BUS.wheel.forEach(([sx, sy]) => put(bx + sx, by + sy, 2))
      }
      const blink = t < lostUntil + 0.6 && Math.floor(t * 12) % 2 === 0
      if (!blink) {
        const s = y > 0.5 ? LEAP : RUN[running ? Math.floor(t * 9) % 2 : 0]
        const top = GROUND - s.h - Math.round(y)
        s.cells.forEach(([sx, sy]) => put(runCol + sx, top + sy, 3))
      }
    }

    function draw() {
      paint()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (backdrop) ctx.drawImage(backdrop, 0, 0, W, H)
      const r = cell * 0.38
      PALETTE[7] = data!.route.color
      for (let c = 1; c < PALETTE.length; c++) {
        ctx.fillStyle = PALETTE[c]
        ctx.beginPath()
        for (let i = 0; i < grid.length; i++) {
          if (grid[i] !== c) continue
          const cx = ((i % cols) + 0.5) * cell, cy = (Math.floor(i / cols) + 0.5) * cell
          ctx.moveTo(cx + r, cy)
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
        }
        ctx.fill()
      }
      // Stop names above their signs, the next one brightest.
      const cam = Math.floor(d * ppm)
      ctx.font = `${Math.max(10, Math.round(cell * 1.9))}px ${font}`
      ctx.textBaseline = "bottom"
      let labelled = 0
      for (const s of stops) {
        const x = (runCol + Math.floor(s.d * ppm) - cam) * cell
        if (x < -300 || x > W + 20) continue
        const ahead = s.d > d
        ctx.fillStyle = ahead && labelled === 0 ? "#ffffff" : "rgba(255,255,255,0.55)"
        if (ahead) labelled++
        ctx.fillText(s.name, x - 6 * cell, (GROUND - SIGN.h - 0.6) * cell - (stops.indexOf(s) % 2) * cell * 2.4)
      }
    }

    function writeHud() {
      const bus = busAt(stops, times, t0 + t * SPEEDUP)
      const next = stops.find((s) => s.d > d) ?? stops[stops.length - 1]
      if (nextRef.current) nextRef.current.textContent = next.name
      if (distRef.current) distRef.current.textContent = `${Math.max(0, next.d - d).toFixed(2)} mi`
      if (gapRef.current) {
        const gap = d - bus
        gapRef.current.textContent = gap > 0 ? `${gap.toFixed(2)} mi behind you` : "caught you"
        gapRef.current.style.color = gap < 0.06 ? "#ef426f" : ""
      }
      if (timeRef.current) timeRef.current.textContent = clock(t0 + t * SPEEDUP, true)
      const pct = (mi: number) => `${((mi - stops[0].d) / (end - stops[0].d)) * 100}%`
      if (youRef.current) youRef.current.style.left = pct(Math.min(d, end))
      if (busRef.current) busRef.current.style.left = pct(bus)
    }

    function finish(won: boolean) {
      running = false
      const passed = stops.filter((s) => s.d > 0 && s.d <= d + 1e-6)
      const res: Result = {
        won,
        beaten: passed.length,
        miles: Math.min(d, end),
        after: (passed[passed.length - 1] ?? stops[1]).name,
        at: t0 + t * SPEEDUP,
      }
      setResult(res)
      setPhase("over")
      setBest((b) => {
        const nb = Math.max(b, res.beaten)
        try {
          localStorage.setItem("localhost:via-best", String(nb))
        } catch {}
        return nb
      })
    }

    function frame(now: number) {
      raf = 0
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      if (running && visible) {
        t += dt
        if (t >= lostUntil + STUMBLE) d += v * dt
        // Jump physics, with a short buffer so a press just before landing still counts.
        if (y > 0 || vy > 0) {
          vy -= G * dt
          y = Math.max(0, y + vy * dt)
          if (y === 0) {
            vy = 0
            if (t - buffered < 0.12) vy = VY
          }
        }
        // Sidewalk ahead: one thing every 0.7 to 1.7 seconds, a little closer together the farther you get.
        while (nextOb < d + cols / ppm) {
          const k = Math.floor(rand() * OBSTACLES.length)
          obstacles.push({ d: nextOb, k, hit: false })
          nextOb += (0.7 + rand() * (1 - Math.min(0.3, d / 30))) * v
        }
        obstacles = obstacles.filter((o) => o.d > d - 0.2)
        const cam = Math.floor(d * ppm)
        for (const o of obstacles) {
          if (o.hit || t < lostUntil + STUMBLE + 0.6) continue
          const s = OBSTACLES[o.k].s
          const ox = runCol + Math.floor(o.d * ppm) - cam
          if (ox < runCol + 8 && ox + s.w > runCol + 2 && y < s.h - 0.5) {
            o.hit = true
            lostUntil = t
          }
        }
        const bus = busAt(stops, times, t0 + t * SPEEDUP)
        if (d >= end) finish(true)
        else if (bus >= d) finish(false)
      }
      draw()
      writeHud()
      if (running && visible) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    control.current = {
      start() {
        reset()
        running = true
        setPhase("running")
        setResult(null)
        wrapRef.current?.focus({ preventScroll: true })
        kick()
      },
      jump() {
        if (!running) return
        if (y === 0 && vy === 0) vy = VY
        else buffered = t
      },
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && running) kick()
    })
    const onVis = () => {
      visible = document.visibilityState === "visible"
      if (visible && running) kick()
    }
    let resizeTimer = 0
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        layout()
        sky.length = 0
        kick()
      }, 150)
    }
    layout()
    reset()
    kick()
    io.observe(canvas)
    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVis)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      io.disconnect()
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVis)
      control.current = null
    }
  }, [data, pick])

  const press = () => {
    if (phase === "running") control.current?.jump()
    else control.current?.start()
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowUp" || e.key === "Enter") {
      e.preventDefault()
      press()
    }
  }

  const trip = pick ? pick.list[pick.i] : null
  const leaves = trip ? clock(trip[1][1]) : ""
  const following = pick ? pick.list.slice(pick.i + 1, pick.i + 4).map((t) => clock(t[1][1])) : []
  const serviceName = pick ? { weekday: "weekday", saturday: "Saturday", sunday: "Sunday" }[pick.service] : ""
  const caughtAt = result && data && !result.won ? data.stops.findIndex((s) => s.name === result.after) : -1
  const rows =
    trip && data
      ? data.stops
          .map((s, k) => ({ s, k, line: `${trip[0]},${hms(trip[1][k])},${s.id}` }))
          .filter(({ k }) => k <= 2 || k === data.stops.length - 1 || k === caughtAt || k === caughtAt + 1)
      : []
  const request = trip && data ? `${data.feed.url}\n# stop_times.txt\ntrip_id,arrival_time,stop_id\n${rows.map((r) => r.line).join("\n")}` : ""

  async function copy() {
    if (!request) return
    await navigator.clipboard.writeText(request)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // Full width: a runner needs to see what's coming. The cards sit in a row underneath.
  return (
    <div>
      <div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-widest text-white/50 sm:grid-cols-3">
          <p className="min-w-0">
            Next stop
            <span ref={nextRef} className="mt-1 block truncate text-sm normal-case tracking-normal text-white">
              {data?.stops[2].name ?? "…"}
            </span>
          </p>
          <p>
            To go
            <span ref={distRef} className="mt-1 block text-sm normal-case tracking-normal text-white">0.22 mi</span>
          </p>
          <p className="col-span-2 sm:col-span-1">
            Route {data?.route.short ?? "4"} ·{" "}
            <span ref={timeRef} className="normal-case tracking-normal">{leaves}</span>
            <span ref={gapRef} className="mt-1 block text-sm normal-case tracking-normal text-white">0.26 mi behind you</span>
          </p>
        </div>

        <div
          ref={wrapRef}
          tabIndex={0}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return
            e.preventDefault()
            press()
          }}
          className="relative mt-4 cursor-pointer touch-manipulation select-none overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a] outline-none focus-visible:border-neutral-500"
          aria-label="Outrun the 4. Press space or tap to start and to jump."
        >
          <canvas
            ref={canvasRef}
            className="block aspect-[2/1] w-full font-mono sm:aspect-[3/1]"
            role="img"
            aria-label="A runner on the sidewalk racing a Route 4 bus up Navarro and San Pedro, drawn as a dot-matrix sign"
          />
          {!data && <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white/50">Loading VIA&apos;s schedule…</div>}
          {data && pick && phase !== "running" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-4">
              <div className="max-w-md text-center">
                {phase === "ready" && (
                  <>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">
                      {pick.tomorrow ? "First bus tomorrow" : "The next real bus"}
                    </p>
                    <p className="mt-2 text-balance text-lg font-semibold leading-snug text-white md:text-xl">
                      The {leaves} Route 4 to North Star is one stop behind you.
                    </p>
                  </>
                )}
                {phase === "over" && result && (
                  <>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">
                      {result.won ? "You beat the bus" : `Caught at ${clock(result.at)}`}
                    </p>
                    <p className="mt-2 text-balance text-lg font-semibold leading-snug text-white md:text-xl">
                      {result.won
                        ? `North Star Transit Center, ${result.miles.toFixed(1)} miles, ahead of the 4.`
                        : result.beaten
                          ? `Just past ${result.after}. You beat the 4 to ${result.beaten} ${result.beaten === 1 ? "stop" : "stops"}.`
                          : "Right at Navarro & Houston. The 4 got there first."}
                    </p>
                  </>
                )}
                <button
                  type="button"
                  onClick={press}
                  className="mt-4 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100"
                >
                  {phase === "ready" ? "Run" : "Run it again"}
                </button>
                <p className="mt-2 font-mono text-[11px] text-white/60">Space or tap to jump</p>
              </div>
            </div>
          )}
        </div>

        {data && (
          <div className="mt-4" aria-hidden>
            <div className="relative h-4">
              <div className="absolute inset-x-0 top-1/2 h-px bg-neutral-800" />
              {data.stops.map((s) => (
                <span
                  key={s.id}
                  className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff8200]/70"
                  style={{ left: `${((s.d - data.stops[0].d) / (data.stops[data.stops.length - 1].d - data.stops[0].d)) * 100}%` }}
                />
              ))}
              <span ref={busRef} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm" style={{ left: "0%", backgroundColor: data.route.color }} />
              <span ref={youRef} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: `${(-data.stops[0].d / (data.stops[data.stops.length - 1].d - data.stops[0].d)) * 100}%` }} />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[11px] text-white/50">
              <span>Downtown</span>
              <span>North Star · {data.stops[data.stops.length - 1].d.toFixed(1)} mi</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start" aria-live="polite">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">
            {result ? "If you'd rather ride it" : "How to play"}
          </p>
          {!result && (
            <p className="mt-3 leading-relaxed text-white/80">
              Jump the cones, puddles and scooters. Each one you hit costs you a beat, and the bus doesn&apos;t wait.
              It&apos;s slow through downtown and fast up San Pedro, exactly as VIA schedules it, so build your lead
              early.
              {best > 0 && <span className="mt-2 block text-sm text-white/60">Your best: {best} stops.</span>}
            </p>
          )}
          {result && trip && (
            <>
              <p className="mt-3 leading-relaxed text-white/80">
                That was the {leaves} trip on VIA&apos;s {serviceName} schedule, North Star in{" "}
                {Math.round((trip[1][trip[1].length - 1] - trip[1][1]) / 60)} minutes.
              </p>
              {following.length > 0 && (
                <>
                  <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-white/50">Next from Navarro &amp; Houston</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {following.map((f) => (
                      <li key={f} className="rounded-md border border-neutral-700 px-2.5 py-1 text-sm text-white/80">{f}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-4 text-sm text-white/60">
                Scheduled times. VIA&apos;s{" "}
                <a href="https://www.viainfo.net" className="font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                  own tools
                </a>{" "}
                have where the bus is right now.
              </p>
            </>
          )}
        </div>

        {trip && (
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a]">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">The bus you&apos;re racing</p>
              <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-white/70 hover:text-white">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-white/70">
              <span className="text-[#ff8200]">GET</span> …/BusService/google_transit.zip{"\n"}
              <span className="text-white/50"># stop_times.txt, trip {trip[0]}</span>{"\n"}
              {rows.map((r, n) => (
                <span key={r.k}>
                  {n > 0 && r.k - rows[n - 1].k > 1 && <span className="text-white/50">…{"\n"}</span>}
                  {r.line}
                  <span className="text-white/50">  {r.s.name}</span>
                  {"\n"}
                </span>
              ))}
            </pre>
            <p className="border-t border-neutral-800 px-4 py-2 text-xs text-white/50">
              No key needed. One 6 MB zip holds every route, stop and trip.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
