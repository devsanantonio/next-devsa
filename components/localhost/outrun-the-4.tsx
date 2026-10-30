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
 * VIA's holiday service), so rush hour plays differently from midnight, and the
 * trip's scheduled time sets the sky. When it ends you get the next real
 * departures from Navarro & Houston, and the rows of stop_times.txt the bus ran on.
 *
 * Drawn on a dot matrix, like a bus's LED headsign, and the readout is one: an
 * amber strip across the top. The bus stays on screen the whole run, drawn at a
 * compressed distance that closes as the real gap does, and at true scale once
 * it's close. Its doors open whenever VIA's schedule has it at a stop.
 *
 * Schedule from public/localhost/via-route-4.json (scripts/build-via-game.py).
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
const GROUND = ROWS - 6
/** The headsign strip across the top: text on rows 1-5. */
const SIGN_ROWS = 7
/** Screen widths per game second at running pace. */
const PACE = 0.5
/** A held jump; letting go early cuts it short. */
const JUMP_H = 13
const JUMP_T = 0.5
const G = (8 * JUMP_H) / (JUMP_T * JUMP_T)
const VY = (G * JUMP_T) / 2

/* Colors, by index into the palette below. */
const C = { sky: 1, ground: 2, runner: 3, obstacle: 4, puddle: 5, stop: 6, bus: 7, amber: 8, window: 9, star: 10, tree: 12, pink: 13, teal: 14, sun: 15, house: 16, shirt: 17, pole: 18, air1: 19, air2: 20, air3: 21 }

type Mode = "night" | "dawn" | "day"
const modeAt = (secs: number): Mode => {
  const h = Math.floor(secs / 3600) % 24
  // No dusk: it read as murk, not a sunset. Day runs until dark.
  return h < 6 || h >= 20 ? "night" : h < 8 ? "dawn" : "day"
}
function palette(mode: Mode, route: string) {
  const night = mode === "night"
  const p: string[] = []
  // C.sky is the buildings' body: the skyline, dark against whatever the sky is doing.
  p[C.sky] = night ? "#1c1c1c" : mode === "day" ? "#2a2a2a" : "#242424"
  p[C.ground] = "#525252"
  p[C.runner] = "#f5f5f5"
  p[C.obstacle] = "#b5b5b5"
  p[C.puddle] = "#6fa8e0"
  p[C.stop] = "#ff8200"
  p[C.bus] = route
  p[C.amber] = "#ffb547"
  p[C.window] = "#8f6a26"
  p[C.star] = "#5e5e5e"
  // Scenery sits back so the sidewalk reads first: trees, houses and streetlight poles are dim.
  p[C.tree] = night ? "#1b3226" : "#24493a"
  p[C.pink] = "#ef426f"
  p[C.teal] = "#00b2a9"
  p[C.sun] = night ? "#a3a3a3" : mode === "day" ? "#ffd23f" : "#ff8200"
  p[C.house] = night ? "#232323" : "#2e2e2e"
  p[C.shirt] = "#3d3d3d"
  p[C.pole] = "#333333"
  // The sky, top band to horizon. By day a dim blue that fades toward the street (an LED sign
  // can't go white, but blue says daytime); at dawn, pink into the logo's orange.
  const air =
    mode === "day" ? ["#1e3247", "#1a2a3b", "#172230"]
    : mode === "dawn" ? ["#22202f", "#45283a", "#6e4419"]
    : ["#141414", "#141414", "#141414"]
  ;[p[C.air1], p[C.air2], p[C.air3]] = air
  return p
}

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
const DUCK = sprite(["....###...", "....###...", "..######..", ".#.###.#..", "...###....", "..#...#...", ".##...##.."])

/**
 * The runner wears a DEVSA tee: dark, with the logo's three bars across the chest in its colors,
 * teal, pink, orange. At five dots across, the bars are the part of the mark that survives.
 * `chest` is the shoulder row of each pose; the tee runs down the torso's middle three columns.
 */
const TEE = { chest: { run: 4, leap: 4, duck: 2 }, rows: { run: 4, leap: 4, duck: 3 } }
function teeColor(pose: "run" | "leap" | "duck", x: number, y: number) {
  const top = TEE.chest[pose]
  if (y < top || y >= top + TEE.rows[pose]) return 0
  const mid = pose === "duck" ? 4 : 3
  if (y === top) return x === mid ? C.teal : x === mid + 1 ? C.pink : x === mid + 2 ? C.stop : x >= mid - 1 && x <= mid + 3 ? C.shirt : 0
  return x >= mid && x <= mid + 2 ? C.shirt : 0
}
const OBSTACLES = [
  { color: C.obstacle, s: sprite(["..#..", "..#..", ".###.", ".###.", "#####", "#####"]) },
  { color: C.obstacle, s: sprite(["#.......#", "#########", "#.#.#.#.#", "#########", "#.......#", "#.......#", "#.......#"]) },
  { color: C.obstacle, s: sprite([".......#", "......#.", "......#.", "#######.", "##....##", "##....##"]) },
  { color: C.puddle, s: sprite([".##########.", "############"]) },
]
/** Papel picado strung across the sidewalk, low enough that you duck it. Its lowest dots sit at GARLAND_LOW. */
const GARLAND_W = 18
const GARLAND_LOW = GROUND - 8
const SIGN = sprite(["#####", "#...#", "#.#.#", "#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."])
const HOUSE = sprite(["...#...", "..###..", ".#####.", "#######", ".#####.", ".##.##.", ".##.##."])
const TREE = sprite([".###.", "#####", "#####", ".###.", "..#..", "..#.."])

/** A 3x5 dot font for the headsign, five rows of three per character. Anything missing prints as a space. */
const FONT: Record<string, string> = {
  A: ".#.#.#####.##.#",
  B: "##.#.###.#.###.",
  C: ".###..#..#...##",
  D: "##.#.##.##.###.",
  E: "####..##.#..###",
  F: "####..##.#..#..",
  G: ".###..#.##.#.##",
  H: "#.##.#####.##.#",
  I: "###.#..#..#.###",
  J: "..#..#..##.#.#.",
  K: "#.##.###.#.##.#",
  L: "#..#..#..#..###",
  M: "#.########.##.#",
  N: "##.#.##.##.##.#",
  O: ".#.#.##.##.#.#.",
  P: "##.#.###.#..#..",
  Q: ".#.#.##.###..##",
  R: "##.#.###.#.##.#",
  S: ".###...#...###.",
  T: "###.#..#..#..#.",
  U: "#.##.##.##.####",
  V: "#.##.##.##.#.#.",
  W: "#.##.########.#",
  X: "#.##.#.#.#.##.#",
  Y: "#.##.#.#..#..#.",
  Z: "###..#.#.#..###",
  "0": "####.##.##.####",
  "1": ".#.##..#..#.###",
  "2": "##...#.#.#..###",
  "3": "##...#.#...###.",
  "4": "#.##.####..#..#",
  "5": "####..##...###.",
  "6": ".###..####.####",
  "7": "###..#.#..#..#.",
  "8": "####.#####.####",
  "9": "####.####..###.",
  "&": ".#.#.#.#.#.#.##",
  ".": ".............#.",
  ":": "....#.....#....",
  "'": ".#..#..........",
  "-": "......###......",
  "/": "..#..#.#.#..#..",
  "·": ".......#.......",
  "+": "....#.###.#....",
}
const textWidth = (s: string) => Math.max(0, s.length * 4 - 1)

/** A bus, built rather than drawn: body, window band, windshield, a door, a destination sign, two wheels. */
function busSprite() {
  const L = 46, H = 20
  const body: [number, number][] = [], door: [number, number][] = [], wheel: [number, number][] = []
  const sign = { x0: L - 31, x1: L - 3, y0: 1, y1: 5 }
  for (let y = 0; y < H - 2; y++)
    for (let x = 0; x < L; x++) {
      if ((y === 0 && (x === 0 || x === L - 1)) || (y === H - 3 && (x === 0 || x === L - 1))) continue
      const front = x >= L - 6
      if (y >= sign.y0 && y <= sign.y1 && x >= sign.x0 && x <= sign.x1) continue
      if (y >= 7 && y <= 11 && !front && x >= 2 && (x - 2) % 6 !== 5) continue
      if (front && y >= 7 && y <= 13 && x <= L - 2) continue
      if (x >= L - 11 && x <= L - 8 && y >= 7 && y <= 16) {
        door.push([x, y])
        continue
      }
      body.push([x, y])
    }
  for (const cx of [8, L - 14]) for (let x = -2; x <= 2; x++) for (let y = 0; y < 3; y++) if (Math.abs(x) + y < 4) wheel.push([cx + x, H - 3 + y])
  return { body, door, wheel, sign, w: L, h: H }
}
const BUS = busSprite()

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

const hash = (a: number, b = 0) => {
  let h = (a * 374761393 + b * 668265263) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

export function OutrunThe4() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  // A text copy of the headsign for screen readers; the loop writes it directly rather than through state.
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
  const control = useRef<{ start: () => void; jump: () => void; release: () => void; duck: (on: boolean) => void } | null>(null)

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
    // The San Antonio College and North Towne Plaza stops get their own buildings; nothing else is named.
    const sac = stops.find((s) => /S\.A\.C\./.test(s.name))?.d ?? -1
    const plaza = stops.find((s) => /Towne Plaza/.test(s.name))?.d ?? -1
    const olmos = stops.find((s) => /Olmos/.test(s.name))?.d ?? 5.3
    const downtownEnd = stops.find((s) => /Augusta/.test(s.name))?.d ?? 0.75

    let W = 0, H = 0, dpr = 1, cell = 6, cols = 0, ppm = 0, runCol = 0
    let grid = new Uint8Array(0)
    let backdrop: HTMLCanvasElement | null = null

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas!.clientWidth
      H = canvas!.clientHeight
      // Mid-resize (a device toggle in dev tools, a collapsing layout) the canvas can be 0 wide for a frame; skip it.
      if (!W || !H) {
        cols = 0
        grid = new Uint8Array(0)
        backdrop = null
        return
      }
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      cell = H / ROWS
      cols = Math.ceil(W / cell)
      runCol = Math.round(cols * 0.38)
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
    let running = false, over = false, caught = false, seed = 1, ducking = false, held = false, shakeUntil = -1, passed = 0
    let obstacles: { d: number; k: number; hit: boolean }[] = []
    let nextOb = 0.05
    let dust: { x: number; y: number; vx: number; born: number }[] = []
    let floats: { x: number; born: number }[] = []
    let flash: { name: string; until: number } | null = null
    const flashed = new Map<number, number>()
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }

    // Two layers behind the sidewalk, generated as they scroll in. Far: towers downtown, low blocks up
    // San Pedro, the odd low building north of Olmos. Near: trees, then houses.
    type Item = { x: number; w: number; h: number; kind: "tower" | "block" | "campus" | "strip" | "low" | "tree" | "house" }
    const far: Item[] = [], near: Item[] = []
    let placedCampus = false, placedStrip = false
    const FAR = 0.25, NEAR = 0.55
    const grow = (layer: Item[], p: number, upto: number) => {
      while (!layer.length || layer[layer.length - 1].x < upto) {
        const prev = layer[layer.length - 1]
        let x = prev ? prev.x + prev.w : -cols
        const mi = (x - runCol * p) / (p * ppm)
        const r = Math.random()
        if (p === FAR) {
          if (!placedCampus && sac > 0 && mi > sac - 0.12 && mi < sac + 0.1) {
            placedCampus = true
            layer.push({ x: x + 2, w: 28, h: 9, kind: "campus" })
          } else if (!placedStrip && plaza > 0 && mi > plaza - 0.12 && mi < plaza + 0.1) {
            placedStrip = true
            layer.push({ x: x + 2, w: 24, h: 6, kind: "strip" })
          } else if (mi < downtownEnd) layer.push({ x: x + 1 + Math.floor(r * 2), w: 6 + Math.floor(hash(x, 1) * 7), h: 13 + Math.floor(hash(x, 2) * 14), kind: "tower" })
          else if (mi < olmos) layer.push({ x: x + 2 + Math.floor(r * 4), w: 7 + Math.floor(hash(x, 1) * 8), h: 5 + Math.floor(hash(x, 2) * 7), kind: "block" })
          else layer.push({ x: x + 6 + Math.floor(r * 10), w: 8 + Math.floor(hash(x, 1) * 6), h: 3 + Math.floor(hash(x, 2) * 3), kind: "low" })
        } else {
          if (mi < downtownEnd) x += 18 + Math.floor(r * 20)
          else if (mi < olmos) x += 8 + Math.floor(r * 16)
          else x += 2 + Math.floor(r * 5)
          const house = mi >= olmos && hash(x, 3) < 0.6
          layer.push(house ? { x, w: HOUSE.w, h: HOUSE.h, kind: "house" } : { x, w: TREE.w, h: TREE.h, kind: "tree" })
        }
      }
    }

    function reset() {
      d = 0; t = 0; y = 0; vy = 0; lostUntil = -1; buffered = -1; passed = 0
      over = false; caught = false; ducking = false; held = false; shakeUntil = -1
      obstacles = []; dust = []; floats = []; flash = null
      flashed.clear()
      nextOb = 0.05
      seed = (Date.now() & 0xffff) + 7
    }

    const put = (x: number, yy: number, c: number) => {
      if (x >= 0 && x < cols && yy >= 0 && yy < ROWS) grid[yy * cols + x] = c
    }
    const text = (s: string, x: number, yy: number, c: number, clip0 = 0, clip1 = cols - 1) => {
      let cx = x
      for (const ch of s.toUpperCase()) {
        const g = FONT[ch]
        if (g) for (let i = 0; i < 15; i++) if (g[i] === "#") {
          const px = cx + (i % 3)
          if (px >= clip0 && px <= clip1) put(px, yy + Math.floor(i / 3), c)
        }
        cx += 4
      }
    }
    /** A message on the headsign: centered if it fits, scrolled across if it doesn't. */
    const headsign = (s: string, phaseT: number, c: number, x0: number, x1: number, yy: number) => {
      const w = textWidth(s), room = x1 - x0 + 1
      if (w <= room) return text(s, x0 + Math.floor((room - w) / 2), yy, c, x0, x1)
      const travel = w - room + 4
      const off = Math.min(travel, Math.max(0, (phaseT - 0.5) * 22))
      text(s, x0 + 2 - Math.round(off), yy, c, x0, x1)
    }

    function busFront() {
      const sched = t0 + t * SPEEDUP
      const gap = d - busAt(stops, times, sched)
      if (caught) return runCol + 10
      // True scale when it's close; compressed beyond that, so it's always on screen and closes as the gap does.
      // Never further back than its front third, sign and all.
      const squeezed = 2 + (runCol - 20) * Math.pow(Math.min(1, Math.max(0, gap) / 0.6), 0.6)
      return runCol - Math.round(Math.min(gap * ppm, squeezed))
    }

    function paint() {
      grid.fill(0)
      const sched = t0 + t * SPEEDUP
      const mode = modeAt(sched)
      const cam = Math.floor(d * ppm)
      const col = (mi: number) => runCol + Math.floor(mi * ppm) - cam

      // Sky: stars and a moon at night, a warm glow and a low sun at dawn, a blue sky and a yellow sun by day.
      if (mode === "night")
        for (let x = 0; x < cols; x++) {
          const h = hash(x + Math.floor(cam * 0.05), 7)
          if (h < 0.06 && (Math.floor(t * 2 + h * 40) % 9 !== 0)) put(x, SIGN_ROWS + 2 + Math.floor(hash(x, 8) * 14), C.star)
        }
      // By day the whole sky is lit, in three bands; at dawn only the lower half glows,
      // in solid rows rather than scattered dots, so it reads as a sunset and not as static.
      if (mode !== "night") {
        const top = mode === "day" ? SIGN_ROWS + 1 : GROUND - 18
        const span = GROUND - top
        for (let yy = top; yy < GROUND; yy++) {
          const band = (yy - top) / span < 1 / 3 ? C.air1 : (yy - top) / span < 2 / 3 ? C.air2 : C.air3
          for (let x = 0; x < cols; x++) put(x, yy, band)
        }
      }
      // At dawn the sun sits on top of the glow, clear of the stop signs (same orange). By day it has
      // rays, so it can't be mistaken for the moon, which is the same disc without them.
      {
        const cx = cols - Math.round(cols * 0.12), cy = mode === "night" ? SIGN_ROWS + 6 : mode === "day" ? SIGN_ROWS + 8 : GROUND - 19
        for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (dx * dx + dy * dy <= 10) put(cx + dx, cy + dy, C.sun)
        if (mode === "day")
          for (const [rx, ry] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
            const reach = rx && ry ? [4, 5] : [5, 6]
            for (const k of reach) put(cx + rx * k, cy + ry * k, C.sun)
          }
      }

      // The skyline: windows lit at night, dark by day.
      const lit = mode === "night" ? 0.45 : mode === "day" ? 0 : 0.18 // dawn: a few still on
      const farCam = Math.floor(cam * FAR)
      grow(far, FAR, farCam + cols)
      for (const b of far) {
        const x0 = b.x - farCam
        if (x0 > cols || x0 + b.w < 0) continue
        for (let x = 0; x < b.w; x++)
          for (let k = 0; k < b.h; k++) {
            const yy = GROUND - 1 - k
            const win = b.kind !== "low" && x % 3 === 1 && k % 3 === 1 && k < b.h - 1
            if (!win) put(x0 + x, yy, C.sky)
            else if (hash(b.x + x, k) < lit) put(x0 + x, yy, C.window)
          }
        if (b.kind === "campus") for (let x = 0; x < b.w; x++) put(x0 + x, GROUND - b.h - 1, C.ground)
      }
      const nearCam = Math.floor(cam * NEAR)
      grow(near, NEAR, nearCam + cols)
      for (const n of near) {
        const x0 = n.x - nearCam
        if (x0 > cols || x0 + n.w < 0) continue
        const s = n.kind === "house" ? HOUSE : TREE
        s.cells.forEach(([sx, sy]) => put(x0 + sx, GROUND - s.h + sy, n.kind === "house" ? C.house : sy >= 4 ? C.ground : C.tree))
        if (n.kind === "house" && mode !== "day") put(x0 + 3, GROUND - 3, C.window)
      }
      // Streetlights along the sidewalk, lit after dark.
      for (let x = -(cam % 52); x < cols; x += 52) {
        for (let k = 1; k <= 18; k++) put(x, GROUND - k, C.pole)
        put(x + 1, GROUND - 18, C.pole)
        put(x + 2, GROUND - 18, mode === "day" ? C.pole : C.amber)
      }

      // The sidewalk: one clean line. (It had grit under it that scrolled along; it read as noise.)
      for (let x = 0; x < cols; x++) put(x, GROUND, C.ground)
      stops.forEach((s, k) => {
        const x = col(s.d)
        if (x < -10 || x > cols + 10) return
        const f = flashed.get(k)
        const c = f !== undefined && t < f && Math.floor(t * 10) % 2 === 0 ? C.runner : C.stop
        SIGN.cells.forEach(([sx, sy]) => put(x - 6 + sx, GROUND - SIGN.h + sy, c))
      })
      for (const o of obstacles) {
        const x = col(o.d)
        if (o.k === OBSTACLES.length) {
          if (x > cols || x + GARLAND_W < 0) continue
          // The string sags in the middle; flags hang off it in the logo's colors.
          for (let gx = 0; gx < GARLAND_W; gx++) {
            const sag = Math.round(Math.sin((gx / (GARLAND_W - 1)) * Math.PI) * 1.5)
            put(x + gx, GARLAND_LOW - 3 + sag, C.ground)
            if (gx % 3 !== 2 && !o.hit) {
              const fc = [C.pink, C.teal, C.stop][Math.floor(gx / 3) % 3]
              put(x + gx, GARLAND_LOW - 2 + sag, fc)
              if (gx % 3 === 0) put(x + gx, GARLAND_LOW - 1 + sag, fc)
            }
          }
          // Strung between buildings: the ends rise away out of frame.
          for (let k = 1; k <= 6; k++) {
            put(x - k, GARLAND_LOW - 3 - k, C.ground)
            put(x + GARLAND_W - 1 + k, GARLAND_LOW - 3 - k, C.ground)
          }
          continue
        }
        const s = OBSTACLES[o.k].s
        if (x > cols || x + s.w < 0) continue
        s.cells.forEach(([sx, sy]) => put(x + sx, GROUND - s.h + sy + (o.hit ? 1 : 0), o.hit ? C.ground : OBSTACLES[o.k].color))
      }
      for (const p of dust) {
        const age = t - p.born
        put(Math.round(p.x + p.vx * age) - cam, p.y - (age > 0.15 ? 1 : 0), C.ground)
      }

      // The bus. Doors open whenever the schedule has it at a stop; the sign flashes when it's within a block.
      const gap = d - busAt(stops, times, sched)
      const front = busFront()
      const bx = front - BUS.w
      if (bx < cols && front > 0) {
        const by = GROUND - BUS.h + 1
        const atStop = caught || times.some((tk) => Math.abs(sched - tk) < 5)
        BUS.body.forEach(([sx, sy]) => put(bx + sx, by + sy, C.bus))
        BUS.wheel.forEach(([sx, sy]) => put(bx + sx, by + sy, C.ground))
        if (!atStop) BUS.door.forEach(([sx, sy]) => put(bx + sx, by + sy, C.bus))
        else BUS.door.forEach(([sx, sy]) => sy > 8 && sx % 2 === 0 && put(bx + sx, by + sy, C.amber))
        const closeBy = gap < 0.08 && !caught && Math.floor(t * 6) % 2 === 0
        if (!closeBy) {
          const label = `${data!.route.short} NORTH STAR`
          const room = BUS.sign.x1 - BUS.sign.x0 + 1
          const w = textWidth(label)
          const off = Math.round((t * 10) % (w + room))
          text(label, bx + BUS.sign.x1 - off, by + BUS.sign.y0, C.amber, bx + BUS.sign.x0, bx + BUS.sign.x1)
        }
      }

      const blink = t < lostUntil + 0.6 && Math.floor(t * 12) % 2 === 0
      if (!blink) {
        const pose = ducking && y < 0.5 ? "duck" : y > 0.5 ? "leap" : "run"
        const s = pose === "duck" ? DUCK : pose === "leap" ? LEAP : RUN[running ? Math.floor(t * 9) % 2 : 0]
        const top = GROUND - s.h - Math.round(y)
        s.cells.forEach(([sx, sy]) => put(runCol + sx, top + sy, teeColor(pose, sx, sy) || C.runner))
      }
      for (const f of floats) {
        const age = t - f.born
        text("+1", f.x - cam, GROUND - SIGN.h - 6 - Math.round(age * 8), C.amber)
      }

      // The headsign: what's next, how far, where the 4 is, and the time, in turn.
      for (let x = 0; x < cols; x++) if (x % 2 === 0) put(x, SIGN_ROWS - 1, C.sky)
      const next = stops.find((s) => s.d > d) ?? stops[stops.length - 1]
      let msg: string, c = C.amber
      const slot = Math.floor(t / 2.8) % 4, slotT = t % 2.8
      if (over) msg = caught ? `THE 4 CAUGHT YOU · ${passed} STOPS` : "YOU BEAT THE 4 TO NORTH STAR"
      else if (!running) msg = `${data!.route.short} NORTH STAR · ${clock(times[1])}`
      // The +1 floats over the stop itself; the headsign just names it.
      else if (flash && t < flash.until) msg = `BEAT IT TO ${flash.name}`
      else if (slot === 0) msg = `NEXT ${next.name}`
      else if (slot === 1) msg = `${Math.max(0, next.d - d).toFixed(2)} MI TO GO`
      else if (slot === 2) {
        msg = gap < 0.06 ? "THE 4 IS RIGHT BEHIND YOU" : `THE 4 IS ${gap.toFixed(2)} MI BACK`
        if (gap < 0.06) c = C.pink
      } else msg = clock(sched)
      headsign(msg, flash && t < flash.until ? t - (flash.until - 1.6) : slotT, c, 2, cols - 3, 1)
    }

    function draw() {
      paint()
      const pal = palette(modeAt(t0 + t * SPEEDUP), data!.route.color)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (t < shakeUntil) ctx.translate((Math.random() - 0.5) * cell * 1.2, (Math.random() - 0.5) * cell * 0.8)
      if (backdrop) ctx.drawImage(backdrop, 0, 0, W, H)
      const r = cell * 0.38
      const paths: Path2D[] = []
      for (let i = 0; i < grid.length; i++) {
        const c = grid[i]
        if (!c) continue
        const p = paths[c] ?? (paths[c] = new Path2D())
        const cx = ((i % cols) + 0.5) * cell, cy = (Math.floor(i / cols) + 0.5) * cell
        p.moveTo(cx + r, cy)
        p.arc(cx, cy, r, 0, Math.PI * 2)
      }
      paths.forEach((p, c) => {
        if (!p) return
        ctx.fillStyle = pal[c]
        ctx.fill(p)
      })
    }

    function writeHud() {
      const bus = busAt(stops, times, t0 + t * SPEEDUP)
      const next = stops.find((s) => s.d > d) ?? stops[stops.length - 1]
      if (nextRef.current) nextRef.current.textContent = next.name
      if (distRef.current) distRef.current.textContent = `${Math.max(0, next.d - d).toFixed(2)} mi`
      if (gapRef.current) gapRef.current.textContent = d - bus > 0 ? `${(d - bus).toFixed(2)} mi behind you` : "caught you"
      if (timeRef.current) timeRef.current.textContent = clock(t0 + t * SPEEDUP, true)
      const pct = (mi: number) => `${((mi - stops[0].d) / (end - stops[0].d)) * 100}%`
      if (youRef.current) youRef.current.style.left = pct(Math.min(d, end))
      if (busRef.current) busRef.current.style.left = pct(bus)
    }

    function finish(won: boolean) {
      running = false
      over = true
      caught = !won
      const done = stops.filter((s) => s.d > 0 && s.d <= d + 1e-6)
      const res: Result = {
        won,
        beaten: done.length,
        miles: Math.min(d, end),
        after: (done[done.length - 1] ?? stops[1]).name,
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
        // Jump physics: let go early and the jump is cut short; a press just before landing still counts.
        if (y > 0 || vy > 0) {
          if (!held && vy > VY * 0.35) vy = VY * 0.35
          vy -= G * dt * (ducking ? 2.5 : 1)
          y = Math.max(0, y + vy * dt)
          if (y === 0) {
            vy = 0
            const feet = Math.floor(d * ppm) + runCol + 2
            for (let k = 0; k < 4; k++) dust.push({ x: feet + k * 2, y: GROUND - 1, vx: (k < 2 ? -1 : 1) * (6 + k * 3), born: t })
            if (t - buffered < 0.12) vy = VY
          }
        }
        dust = dust.filter((p) => t - p.born < 0.3)
        floats = floats.filter((f) => t - f.born < 0.9)
        // Sidewalk ahead: one thing every 0.7 to 1.7 seconds, a little closer together the farther you get.
        // About one in six is a garland to duck, with room around it.
        while (nextOb < d + cols / ppm) {
          const garland = nextOb > 0.12 && rand() < 0.16
          const k = garland ? OBSTACLES.length : Math.floor(rand() * OBSTACLES.length)
          if (garland) nextOb += 0.3 * v
          obstacles.push({ d: nextOb, k, hit: false })
          nextOb += (0.7 + rand() * (1 - Math.min(0.3, d / 30)) + (garland ? 0.4 : 0)) * v
        }
        obstacles = obstacles.filter((o) => o.d > d - 0.2)
        const cam = Math.floor(d * ppm)
        for (const o of obstacles) {
          if (o.hit || t < lostUntil + STUMBLE + 0.6) continue
          const ox = runCol + Math.floor(o.d * ppm) - cam
          const hitIt =
            o.k === OBSTACLES.length
              ? ox < runCol + 8 && ox + GARLAND_W > runCol + 2 && !(ducking && y < 0.5)
              : ox < runCol + 8 && ox + OBSTACLES[o.k].s.w > runCol + 2 && y < OBSTACLES[o.k].s.h - 0.5
          if (hitIt) {
            o.hit = true
            lostUntil = t
            shakeUntil = t + 0.25
          }
        }
        // Passing a stop before the bus: the sign flashes, a +1 rises, and the headsign says so.
        const bus = busAt(stops, times, t0 + t * SPEEDUP)
        stops.forEach((s, k) => {
          if (k === 0 || flashed.has(k) || s.d > d) return
          if (s.d <= 0) {
            flashed.set(k, -1)
            return
          }
          flashed.set(k, t + 0.6)
          passed++
          floats.push({ x: Math.floor(s.d * ppm) + runCol - 6, born: t })
          flash = { name: s.name, until: t + 1.6 }
        })
        if (d >= end) finish(true)
        else if (bus >= d) finish(false)
      }
      draw()
      writeHud()
      if ((running || t < shakeUntil) && visible) raf = requestAnimationFrame(frame)
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
        held = true
        ducking = false
        if (y === 0 && vy === 0) vy = VY
        else buffered = t
      },
      release() {
        held = false
      },
      duck(on) {
        ducking = on && running
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
        far.length = 0
        near.length = 0
        placedCampus = placedStrip = false
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
      if (!e.repeat) press()
    } else if (e.key === "ArrowDown" || e.key === "s") {
      e.preventDefault()
      control.current?.duck(true)
    }
  }
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowUp" || e.key === "Enter") control.current?.release()
    else if (e.key === "ArrowDown" || e.key === "s") control.current?.duck(false)
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
        {/* The headsign in the canvas is the readout; this is its text, for screen readers. */}
        <p className="sr-only">
          Next stop <span ref={nextRef}>{data?.stops[2].name ?? ""}</span>, <span ref={distRef}>0.22 mi</span> to go.
          Route {data?.route.short ?? "4"} at <span ref={timeRef}>{leaves}</span>, <span ref={gapRef}>0.26 mi behind you</span>.
        </p>

        <div
          ref={wrapRef}
          tabIndex={0}
          onKeyDown={onKey}
          onKeyUp={onKeyUp}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return
            e.preventDefault()
            // Holding the lower part of the game ducks; anywhere else jumps, higher the longer you hold.
            const r = e.currentTarget.getBoundingClientRect()
            if (phase === "running" && e.clientY > r.top + r.height * 0.62) control.current?.duck(true)
            else press()
          }}
          onPointerUp={() => {
            control.current?.release()
            control.current?.duck(false)
          }}
          onPointerCancel={() => {
            control.current?.release()
            control.current?.duck(false)
          }}
          className="relative cursor-pointer touch-manipulation select-none [-webkit-touch-callout:none] overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a] outline-none focus-visible:border-neutral-500"
          aria-label="Outrun the 4. Press space or tap to start and to jump; hold to jump higher. Press down, or hold the bottom of the game, to duck."
        >
          <canvas
            ref={canvasRef}
            className="block aspect-[2/1] w-full sm:aspect-[3/1]"
            role="img"
            aria-label="A runner on the sidewalk racing a Route 4 bus up Navarro and San Pedro, drawn as a dot-matrix sign with an amber headsign across the top"
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
                <p className="mt-2 font-mono text-[11px] text-white/60">
                  Space or tap to jump, hold to go higher · ↓ or hold low to duck
                </p>
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

      {/* Nothing under the game until you've played it: the controls are on its start screen, and the
          section's intro already says how the bus runs. A run's end brings the payoff, the next real
          departures (the part that helps riders, which VIA's license asks for) and the rows of
          stop_times.txt the bus you raced ran on. */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start" aria-live="polite">
        {result && trip && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">If you&apos;d rather ride it</p>
          {(
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
              {best > 0 && <p className="mt-4 text-sm text-white/60">Your best: {best} stops.</p>}
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
        )}

        {result && trip && (
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a]">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">The bus you raced</p>
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
