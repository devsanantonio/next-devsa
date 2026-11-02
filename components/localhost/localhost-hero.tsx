"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"

/**
 * The /localhost hero: text on the left, the city on the right.
 *
 * Rebuilt 2026-11-01 because it was busy: a five-line paragraph with five
 * links, a terminal quickstart box and a button under a three-line headline.
 * Then rebuilt again the same day, as a different hero rather than a tidier
 * one: localhost:210 is the title (it was an eyebrow over a three-line
 * headline), the hook is the problem it answers ("Seven APIs. No one place to
 * find them."), and the dot map is
 * the hero's full-bleed ground from lg up instead of a square beside the copy.
 * The three experiments run along the bottom edge as the map's legend. The
 * quickstart lives in "Your turn" on the page.
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
/**
 * The three experiments, as the hero's index. Each dot is its layer's color on
 * the map beside it, so the list is also the map's legend: the County's 1896
 * buildings are teal, the City's permits pink, VIA's stops orange.
 */
const EXPERIMENTS = [
  { href: "#bexar-county", title: "Follow the water", source: "Bexar County", when: "1718 → today" },
  { href: "#city", title: "Watch downtown get built", source: "City of San Antonio", when: "Since 2025" },
  { href: "#via", title: "Outrun the 4", source: "VIA Metropolitan Transit", when: "Right now" },
]

export function LocalhostHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<Hero | null>(null)

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
      // As the hero's full-bleed ground (lg up) the city sits right of center, clear of the
      // title; stacked on a phone it is centered in its own square.
      const wide = W >= 1024
      const s = Math.min((W * (wide ? 0.6 : 0.94)) / ((bx1 - bx0) * data!.aspect), (H * 0.94) / (by1 - by0))
      const ox = W * (wide ? 0.68 : 0.5) - ((bx1 - bx0) * data!.aspect * s) / 2 - bx0 * data!.aspect * s
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
    <section className="relative isolate flex flex-col overflow-hidden lg:block" data-bg-type="dark">
      {/* The city, as the hero's ground from lg up; a square under the words on a phone.
          Behind everything, so the pointer can scatter it across the full width: the
          copy above it lets clicks through except on its links. */}
      <canvas
        ref={canvasRef}
        className="order-last block aspect-square w-full touch-none lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto lg:h-full"
        role="img"
        aria-label="San Antonio drawn in dots: buildings from 1896, construction permits since 2025 and bus stops, from the city's open data"
      />
      {/* Dark under the words, clear over the city. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] hidden lg:block"
        style={{ background: "linear-gradient(to right, #0a0a0a 0%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0) 55%)" }}
      />

      <div className="page-shell pointer-events-none relative flex flex-col pt-20 md:pt-24 lg:min-h-[min(calc(100svh-3rem),60rem)] lg:pb-10">
        <div className="flex flex-1 flex-col justify-center">
          {/* The name is the title. It is a port and an area code at once, which is the
              whole idea, so it gets the size the joke needs. */}
          <h1>
            {/* eslint-disable-next-line @next/next/no-img-element -- the brand SVG, served as-is */}
            <img
              src="/branding/localhost/localhost-210-wordmark-dark.svg"
              alt="localhost:210"
              className="h-14 w-auto sm:h-20 lg:h-28 xl:h-32"
            />
          </h1>
          {/* The hook is the problem localhost:210 answers: San Antonio's open data is
              free and keyless but scattered across seven publishers, with no one place
              that lists them. The title above is the answer: the bridge to every agency
              publishing it. (The comparison to DEVSA as the bridge between the city's
              tech groups came out: it trailed the hook.) "Agencies", never "partners": DEVSA is affiliated with none
              of them, and the page says so. There is now a starter for every publisher (ten in all, Nov 2026), but the
              sentence stops at the bridge; the experiments are the row below. */}
          {/* One lead paragraph under the title, as the conference pages do it: the hook
              opens it in white, then the bridge. The hook was set at display size for a
              while and competed with the title. */}
          <p className="mt-8 max-w-xl border-l-2 border-[#ff8200] pl-5 text-lg leading-relaxed text-white/70 md:text-xl">
            <span className="font-semibold text-white">Seven APIs. No one place to find them.</span>{" "}
            localhost:210 is the bridge to{" "}
            <a
              href="#publishers"
              className="pointer-events-auto text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
            >
              all of San Antonio&apos;s open data
            </a>
            .
          </p>
          <a
            href="https://github.com/devsanantonio/localhost"
            className="pointer-events-auto mt-8 inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100"
          >
            Get the starters <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* The three experiments, along the bottom edge: each dot is its layer's color on
            the map, so the row is also the map's legend. */}
        <div className="mt-12 lg:mt-10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/55">Three small experiments, to see what&apos;s in there</p>
          <ol className="mt-4 grid border-t border-white/10 lg:grid-cols-3 lg:gap-8">
            {EXPERIMENTS.map((e, i) => (
              <li key={e.href} className="border-b border-white/10 lg:border-b-0">
                <a href={e.href} className="group pointer-events-auto flex items-start gap-3 py-4">
                  <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white underline-offset-4 group-hover:underline">{e.title}</span>
                    <span className="mt-0.5 block text-sm text-white/55">
                      {e.source} · {e.when}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
