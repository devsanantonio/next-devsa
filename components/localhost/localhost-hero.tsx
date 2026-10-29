"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Check, Copy } from "lucide-react"

/**
 * The /localhost hero: text on the left, the city on the right.
 *
 * The right is San Antonio drawn from its open data, one dot per real place:
 * a building from Bexar County's 1896 maps (teal), a construction permit the
 * City has issued since 2025 (pink), a VIA stop (orange) — the logo's colors in
 * the logo's order. Built, being built, moving. The layers assemble in that
 * order on load; move the pointer through them and they scatter and settle.
 *
 * The eyebrow is the localhost:210 wordmark itself (public/branding/localhost),
 * Geist Mono with the orange :210, as everywhere else the project appears.
 *
 * Points come from public/localhost/hero.json (scripts/build-hero.py). Plain 2D
 * canvas with a spring per dot; it stops drawing once everything has settled
 * and whenever the hero is off screen.
 */

type Layer = { pts: number[] }
type Hero = {
  aspect: number
  bexar: Layer & { buildings: number }
  cosa: Layer & { permits: number; since: string }
  via: Layer & { stops: number; routes: number }
}

const COLORS = ["#00b2a9", "#ef426f", "#ff8200"]
/** How many dots of each layer to draw: enough to read as the city, few enough to animate smoothly. */
const PER_LAYER = [4500, 4500, 6098]
/** The County starter: it prints which acequias ran near Geekdom, then writes a map. */
const QUICKSTART = "git clone https://github.com/devsanantonio/localhost\ncd localhost/starters/acequias\npython3 main.py"
/** The three sources with a piece below, named in the hero's first line; each name jumps to its piece. */
const SECTIONS = [
  { href: "#bexar-county", label: "Bexar County" },
  { href: "#city", label: "the City of San Antonio" },
  { href: "#via", label: "VIA Metropolitan Transit" },
]

export function LocalhostHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<Hero | null>(null)
  const [copied, setCopied] = useState(false)
  async function copyQuickstart() {
    await navigator.clipboard.writeText(QUICKSTART)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    fetch("/localhost/hero.json").then((r) => r.json()).then(setData).catch(() => {})
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    const ctx = canvas.getContext("2d")!
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let W = 0, H = 0, dpr = 1
    let px = new Float32Array(0), py = px, vx = px, vy = px, tx = px, ty = px
    let col = new Uint8Array(0)
    let n = 0
    const layers = [data.bexar.pts, data.cosa.pts, data.via.pts]

    function layout(first: boolean) {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas!.clientWidth
      H = canvas!.clientHeight
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      // Fit to where the dots are, not the whole county: almost everything is in the central
      // city, and fitting the county's outline left half the canvas empty. The 1st-99th
      // percentile keeps a few far-flung points from setting the frame.
      const all: number[][] = [[], []]
      for (const L of layers) for (let k = 0; k < L.length; k += 2) { all[0].push(L[k]); all[1].push(L[k + 1]) }
      const pct = (a: number[], q: number) => a.sort((x, y) => x - y)[Math.floor(q * (a.length - 1))]
      const [bx0, bx1, by0, by1] = [pct(all[0], 0.01), pct(all[0], 0.99), pct(all[1], 0.01), pct(all[1], 0.99)]
      const s = Math.min((W * 0.94) / ((bx1 - bx0) * data!.aspect), (H * 0.94) / (by1 - by0))
      const ox = (W - (bx1 - bx0) * data!.aspect * s) / 2 - bx0 * data!.aspect * s
      const oy = (H - (by1 - by0) * s) / 2 - by0 * s
      const counts = layers.map((L, c) => Math.min(PER_LAYER[c], L.length / 2))
      n = counts.reduce((a, b) => a + b, 0)
      const keep = first ? null : { px, py }
      px = new Float32Array(n); py = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n)
      tx = new Float32Array(n); ty = new Float32Array(n); col = new Uint8Array(n)
      let i = 0
      layers.forEach((L, c) => {
        const total = L.length / 2, step = total / counts[c]
        for (let k = 0; k < counts[c]; k++, i++) {
          const j = Math.floor(k * step) * 2
          tx[i] = ox + L[j] * data!.aspect * s
          ty[i] = oy + L[j + 1] * s
          col[i] = c
          // First load: start scattered across the canvas, then assemble. Resizes keep the city.
          if (keep) {
            px[i] = tx[i]
            py[i] = ty[i]
          } else {
            px[i] = reduced ? tx[i] : Math.random() * W
            py[i] = reduced ? ty[i] : Math.random() * H
          }
        }
      })
    }

    const mouse = { x: -1e4, y: -1e4 }
    let raf = 0, visible = true, settled = 0
    const born = performance.now()

    function frame() {
      raf = 0
      const t = performance.now() - born
      let motion = 0
      for (let i = 0; i < n; i++) {
        // Built, being built, moving: each layer starts assembling 600 ms after the last.
        const awake = reduced || t > col[i] * 600
        let ax = awake ? (tx[i] - px[i]) * 0.05 : 0, ay = awake ? (ty[i] - py[i]) * 0.05 : 0
        const dx = px[i] - mouse.x, dy = py[i] - mouse.y, d2 = dx * dx + dy * dy
        if (d2 < 6400) {
          const f = ((6400 - d2) / 6400) * 2.2
          const d = Math.sqrt(d2) || 1
          ax += (dx / d) * f
          ay += (dy / d) * f
        }
        vx[i] = (vx[i] + ax) * 0.82
        vy[i] = (vy[i] + ay) * 0.82
        px[i] += vx[i]
        py[i] += vy[i]
        motion += Math.abs(vx[i]) + Math.abs(vy[i])
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = "lighter"
      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = COLORS[c]
        ctx.globalAlpha = c === 0 ? 0.16 : c === 1 ? 0.5 : 0.42
        // Dots scale with the canvas, so the network stays readable on a phone instead of smearing.
        const k = Math.min(1, Math.max(0.5, W / 640))
        const r = (c === 2 ? 1.6 : 1.3) * k
        for (let i = 0; i < n; i++) if (col[i] === c) ctx.fillRect(px[i] - r / 2, py[i] - r / 2, r, r)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
      settled = motion / Math.max(1, n) < 0.02 ? settled + 1 : 0
      if (visible && (settled < 20 || t < 2200)) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      settled = 0
      if (!raf && visible) raf = requestAnimationFrame(frame)
    }
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect()
      mouse.x = e.clientX - b.left
      mouse.y = e.clientY - b.top
      kick()
    }
    const onLeave = () => {
      mouse.x = mouse.y = -1e4
      kick()
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      kick()
    })
    let resizeTimer = 0
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        layout(false)
        kick()
      }, 150)
    }
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerleave", onLeave)
    window.addEventListener("resize", onResize)
    io.observe(canvas)
    layout(true)
    kick()
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      io.disconnect()
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("resize", onResize)
    }
  }, [data])


  return (
    <section className="relative" data-bg-type="dark">
      <div className="page-shell pt-28 pb-16 md:pt-32">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- the brand SVG, served as-is */}
            <img
              src="/branding/localhost/localhost-210-wordmark-dark.svg"
              alt="localhost:210"
              className="h-7 w-auto md:h-9"
            />
            <h1 className="mt-6 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
              Every developer has a localhost.{" "}
              <span className="font-light italic text-white/50">This one is San Antonio.</span>
            </h1>
            {/* One paragraph: the hook (checkable: seven agencies, all free, none needs a key), the
                problem (they're scattered), and what the project is. "Seven of them" jumps to the list in
                the Build section; the three with a piece below are named last, as the experiments' sources. The wordmark and the headline already carry the port-and-area-code joke, the
                quickstart below says "clone it". */}
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              <span className="font-semibold text-white">San Antonio has an API.</span>{" "}
              <a href="#publishers" className="font-semibold text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white">
                Seven of them.
              </a>{" "}
              Free, no key required, and spread across as many websites, so almost nobody finds them all.{" "}
              <span className="font-semibold text-white">localhost:210</span> is DEVSA&apos;s starter kit for every one,
              and below, three small experiments with{" "}
              {SECTIONS.map((s, i) => (
                <span key={s.href}>
                  {i === 2 ? " and " : i === 1 ? ", " : ""}
                  <a href={s.href} className="text-white/85 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white">
                    {s.label}
                  </a>
                </span>
              ))}{" "}
              to see what&apos;s in there.
            </p>
            {/* The first five minutes, shown rather than described: no sign-up, no keys, one file. */}
            <div className="mt-6 max-w-xl overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a]">
              <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
                <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">No sign-up, no keys, Python 3.9+</p>
                <button
                  type="button"
                  onClick={copyQuickstart}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-white/70 hover:text-white"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-white/80">
                {QUICKSTART.split("\n").map((line) => (
                  <span key={line} className="block">
                    <span className="select-none text-[#ff8200]">$ </span>
                    {line}
                  </span>
                ))}
              </pre>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/devsanantonio/localhost"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100"
              >
                Get the starters <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <figure className="min-w-0">
            <canvas
              ref={canvasRef}
              className="block aspect-square w-full touch-none lg:aspect-[1/0.95]"
              role="img"
              aria-label="San Antonio drawn in dots: buildings from 1896, construction permits since 2025 and bus stops, from the city's open data"
            />
          </figure>
        </div>

      </div>
    </section>
  )
}
