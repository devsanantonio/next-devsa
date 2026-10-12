"use client"

import { useEffect, useRef } from "react"
import { DEVSA_CUT } from "@/components/demo-day/devsa-cut"
import { DD, FESTIVAL } from "@/components/demo-day/theme"
import { DEMO_DAY_INDUSTRIES } from "@/lib/demo-day"
import { BUILDER_SYMBOLS, INDUSTRY_SYMBOLS } from "@/components/demo-day/papel-symbols"

/*
 * Papel picado: one SVG for the whole run so the cut-out mask is defined once.
 * The run is wider than any screen and clipped by its container, so it never
 * wraps or reflows.
 *
 * Two kinds of flag, alternating:
 *
 * - **Builder flags** have a symbol of building with AI cut out of them — a
 *   terminal prompt, braces, a chip, a spark, a rocket, an agent graph. Generic
 *   on purpose: no company's mark is on this page until that company has agreed
 *   to be (see SPONSOR_FLAGS).
 * - **DEVSA flags** have the mark cut out of them, the way everything on a
 *   papel picado is made. This breaks the logo rules on purpose — DEVSA's call,
 *   for its own event, and only here. See components/demo-day/devsa-cut.ts.
 *
 * ## The symbols are DEVSA's own
 *
 * A custom set drawn for these sheets — see components/demo-day/papel-symbols.tsx
 * for the rules that make it a family and why it beat Lucide and Phosphor.
 * DEVSA's sheets keep the exact mark.
 *
 * ## Two strips, two stories
 *
 * `variant="builders"` (under the masthead) is the builders: the developer
 * symbols above, on paper cycling through the festival colors. `variant=
 * "industries"` (before the ask) is what they will work on: one symbol per
 * spotlight industry, each on paper in that industry's own color — the same
 * color its name is set in higher up, so lime paper with a padlock reads as
 * Cybersecurity without a label. DEVSA's mark hangs every fourth sheet in both.
 *
 * The industry symbols are generic on purpose. Healthcare is a DNA helix, not a
 * red cross — that emblem is legally protected and is not decoration. Defense
 * is a generic shield, not any real insignia, rank, branch emblem or seal,
 * which would read as an endorsement nobody gave. Aerospace is a plane because
 * the builders' strip already has the rocket.
 *
 * Each strip namespaces its mask ids with its variant plus `name`; two strips
 * sharing `dd-cut-0` would make a browser apply one strip's cuts to the
 * other's sheets. A page that renders the same variant twice (the Confluencia
 * page's mobile and desktop builders strips) must give each a distinct `name`.
 *
 * Not useId(): its ids come from the component's position in the tree, and
 * when anything above the strip renders differently on the server and in the
 * browser, they drift apart and React reports a hydration mismatch on every
 * mask. A fixed name cannot drift.
 *
 * ## It moves
 *
 * The sheets sway in a breeze that never quite repeats (three sine waves at
 * unrelated rates, phased per sheet), and a cursor sweeping through them
 * pushes them — harder the faster it moves, with the neighbors catching some
 * of it. Each sheet is a damped spring pulled toward the breeze, so a push
 * swings and settles rather than snapping back.
 *
 * Each sheet carries its own cut-out mask, inside the group that moves. One
 * shared mask for the run would stay put while the paper swung, and the holes
 * would slide off the sheets.
 *
 * Transforms are written straight to the DOM from a requestAnimationFrame
 * loop rather than through React state — twenty re-renders a frame for an
 * ornament would be absurd. The loop only runs while the banner is on
 * screen, and not at all for readers who prefer reduced motion: they get the
 * sheets hanging still at their resting tilts.
 */
/*
 * Shaped after the real thing as San Antonio hangs it — landscape sheets, a
 * fold over the string at the top, a lace border of punched holes and corner
 * stars, a scalloped hem, and one big motif in the middle. The string droops
 * between sheets and each hangs at its own slight angle.
 */
const FLAG_W = 120
const FLAG_H = 96
const GAP = 26
const FLAGS = 20
const FOLD = 7
const ICON = 48
const TILT = [-2, 1.5, -1, 2, -1.5, 1]
const DROP = [0, 3, 1, 4, 2, 3]

/**
 * Sponsor logos, once they have agreed to be here — "your logo on the papel
 * picado" is part of the build-partner pitch on this page. Empty until then.
 * Each is a file in public/ that the sponsor supplied, placed unaltered.
 */
const SPONSOR_FLAGS: { name: string; src: string }[] = []

/** A sheet in its own coordinates: straight top and sides, scalloped hem. */
const FLAG_PATH = `M0 0 H${FLAG_W} V${FLAG_H - 8} ${Array.from(
  { length: FLAG_W / 10 },
  () => "a5 5 0 0 1 -10 0",
).join(" ")} Z`

/** Uncolored tissue — white papel picado is as traditional as the colors. */
const PAPER_WHITE = "#f1ece0"

const STAR_D =
  "M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z"

/** A four-point star cut, centered on (cx, cy), `size` across. */
function StarCut({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  return (
    <path
      transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 24})`}
      d={STAR_D}
    />
  )
}

/** Everything punched out of one sheet, in black for the mask. */
type SheetKind = "devsa" | "sponsor" | number | { industry: number }

function SheetCuts({ kind }: { kind: SheetKind }) {
  const W = FLAG_W
  const midY = 47
  const frameBottom = FLAG_H - 18
  return (
    <g fill="black">
      {/* The lace: an inner frame, a star in each corner, a dot at each side,
          and a row of holes along the hem. */}
      <rect
        x={8}
        y={FOLD + 6}
        width={W - 16}
        height={frameBottom - FOLD - 6}
        rx={2}
        fill="none"
        stroke="black"
        strokeWidth={1.6}
      />
      <StarCut cx={17} cy={FOLD + 15} size={10} />
      <StarCut cx={W - 17} cy={FOLD + 15} size={10} />
      <StarCut cx={17} cy={frameBottom - 9} size={10} />
      <StarCut cx={W - 17} cy={frameBottom - 9} size={10} />
      <circle cx={17} cy={midY} r={2} />
      <circle cx={W - 17} cy={midY} r={2} />
      {Array.from({ length: 11 }, (_, k) => (
        <circle key={k} cx={10 + k * 10} cy={FLAG_H - 12} r={1.5} />
      ))}

      {kind === "devsa" ? (
        /* The window and its three bars are cut; the prompt and "SA" are
           drawn back in white, so they stay as paper. */
        <g
          transform={`translate(${(W - 56) / 2} ${midY - (56 * DEVSA_CUT.height) / DEVSA_CUT.width / 2}) scale(${56 / DEVSA_CUT.width})`}
        >
          <path d={DEVSA_CUT.body} />
          {DEVSA_CUT.bars.map((d) => (
            <path key={d} d={d} />
          ))}
          {DEVSA_CUT.glyphs.map((d) => (
            <path key={d} d={d} fill="white" />
          ))}
        </g>
      ) : kind === "sponsor" ? null : (
        <>
          {(() => {
            const Motif =
              typeof kind === "number"
                ? BUILDER_SYMBOLS[kind % BUILDER_SYMBOLS.length]
                : INDUSTRY_SYMBOLS[kind.industry % INDUSTRY_SYMBOLS.length]
            // Drawn on a 48-unit grid; black is cut, white puts paper back.
            return (
              <g transform={`translate(${(W - ICON) / 2} ${midY - ICON / 2}) scale(${ICON / 48})`}>
                <Motif />
              </g>
            )
          })()}
          {/* Small stars flanking the motif, as on the sheets it is modeled on. */}
          <StarCut cx={W / 2 - 34} cy={midY} size={7} />
          <StarCut cx={W / 2 + 34} cy={midY} size={7} />
        </>
      )}
    </g>
  )
}

export function PapelPicado({
  variant = "builders",
  name,
  className,
}: {
  variant?: "builders" | "industries"
  /** Distinguishes two strips of the same variant on one page. */
  name?: string
  className?: string
}) {
  const industries = variant === "industries"
  const uid = `dd-${variant}${name ? `-${name}` : ""}`
  const step = FLAG_W + GAP
  const width = FLAGS * step
  const height = FLAG_H + 18
  // Room above and below the run for a swinging sheet's corners: at the 16°
  // limit a corner travels about FLAG_W / 2 * sin 16° ≈ 17 units.
  const PAD = 22
  const svgRef = useRef<SVGSVGElement>(null)
  const swayRefs = useRef<(SVGGElement | null)[]>([])

  // Every fourth sheet is DEVSA's, offset so the run does not open on one —
  // and on a different beat in each strip, so the two do not line up.
  const isDevsa = (i: number) => i % 4 === (industries ? 3 : 2)
  // Sponsors, when there are any, take every sixth builder sheet and leave
  // DEVSA's alone. The industries strip has none: it is the six industries.
  const sponsorAt = (i: number) =>
    !industries && SPONSOR_FLAGS.length > 0 && !isDevsa(i) && i % 6 === 5
      ? SPONSOR_FLAGS[Math.floor(i / 6) % SPONSOR_FLAGS.length]
      : undefined

  const sheets = (() => {
    let motif = 0
    return Array.from({ length: FLAGS }, (_, i) => {
      const x = i * step + GAP / 2
      const y = 6 + DROP[i % DROP.length]
      let kind: SheetKind
      let color: string
      if (isDevsa(i)) {
        kind = "devsa"
        // On the industries strip every festival color belongs to an industry,
        // so DEVSA's sheet is the off-white of plain tissue — it would otherwise
        // sit beside Robotics in the same marigold and read as one sheet.
        color = industries ? PAPER_WHITE : FESTIVAL[i % FESTIVAL.length]
      } else if (sponsorAt(i)) {
        kind = "sponsor"
        color = FESTIVAL[i % FESTIVAL.length]
      } else if (industries) {
        const index = motif++ % DEMO_DAY_INDUSTRIES.length
        kind = { industry: index }
        color = DD[DEMO_DAY_INDUSTRIES[index].color]
      } else {
        kind = motif++
        color = FESTIVAL[i % FESTIVAL.length]
      }
      return {
        i,
        x,
        y,
        kind,
        color,
        sponsor: sponsorAt(i),
        transform: `translate(${x} ${y}) rotate(${TILT[i % TILT.length]} ${FLAG_W / 2} 0)`,
      }
    })
  })()

  // The string: over each sheet's fold, drooping in the gap to the next.
  const string = sheets
    .map((sh, k) => {
      const left = `${sh.x} ${sh.y + 2}`
      const right = `${sh.x + FLAG_W} ${sh.y + 2}`
      const next = sheets[k + 1]
      const droop = next
        ? ` Q${sh.x + FLAG_W + GAP / 2} ${Math.max(sh.y, next.y) + 14} ${next.x} ${next.y + 2}`
        : ""
      return `${k === 0 ? `M${-GAP} ${sh.y - 4} Q${-GAP / 2} ${sh.y + 10} ${left}` : ""} L${right}${droop}`
    })
    .join(" ")

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const angle = new Float32Array(FLAGS) // degrees
    const vel = new Float32Array(FLAGS) // degrees per second
    let raf = 0
    let running = false
    let last = 0
    const t0 = performance.now()
    // A different phase per strip, so the two are not caught by the same gust.
    const phase = industries ? 7.3 : 0

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = (now - t0) / 1000
      for (let i = 0; i < FLAGS; i++) {
        const breeze =
          2.2 * Math.sin(t * 0.8 + i * 0.45 + phase) +
          1.2 * Math.sin(t * 1.9 + i * 1.3 + phase) +
          0.6 * Math.sin(t * 3.7 + i * 2.1 + phase)
        vel[i] += (30 * (breeze - angle[i]) - 4 * vel[i]) * dt
        angle[i] = Math.max(-16, Math.min(16, angle[i] + vel[i] * dt))
        swayRefs.current[i]?.setAttribute(
          "transform",
          `rotate(${angle[i].toFixed(2)} ${FLAG_W / 2} 0)`,
        )
      }
      raf = requestAnimationFrame(tick)
    }
    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    )
    io.observe(svg)

    // A sweep pushes the sheet under the cursor and, more gently, its
    // neighbors. Rightward motion swings the hem right, which in SVG's
    // y-down rotation is a negative angle.
    let lastX: number | null = null
    let lastT = 0
    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect()
      const k = width / r.width
      const x = (e.clientX - r.left) * k
      const y = (e.clientY - r.top) * k - PAD
      const now = performance.now()
      if (lastX !== null && y < FLAG_H + 20) {
        const perFrame = ((x - lastX) / Math.max(1, now - lastT)) * 16
        const idx = Math.floor(x / step)
        for (const [d, gain] of [[-1, 1.8], [0, 4], [1, 1.8]] as const) {
          const j = idx + d
          if (j < 0 || j >= FLAGS) continue
          vel[j] = Math.max(-140, Math.min(140, vel[j] - perFrame * gain))
        }
      }
      lastX = x
      lastT = now
    }
    const onLeave = () => {
      lastX = null
    }
    svg.addEventListener("pointermove", onMove)
    svg.addEventListener("pointerleave", onLeave)

    return () => {
      stop()
      io.disconnect()
      svg.removeEventListener("pointermove", onMove)
      svg.removeEventListener("pointerleave", onLeave)
    }
  }, [width, step, industries])

  return (
    <div aria-hidden className={`overflow-hidden ${className ?? ""}`}>
      <svg
        ref={svgRef}
        viewBox={`0 ${-PAD} ${width} ${height + PAD * 2}`}
        className="h-[104px] w-auto max-w-none touch-pan-y md:h-[138px]"
      >
        {sheets.map((sh) => (
          <g key={sh.i} transform={sh.transform}>
            <g
              ref={(el) => {
                swayRefs.current[sh.i] = el
              }}
            >
              <mask
                id={`${uid}-${sh.i}`}
                maskUnits="userSpaceOnUse"
                x={-4}
                y={-4}
                width={FLAG_W + 8}
                height={FLAG_H + 8}
              >
                <rect x={-4} y={-4} width={FLAG_W + 8} height={FLAG_H + 8} fill="white" />
                <SheetCuts kind={sh.kind} />
              </mask>
              <g mask={`url(#${uid}-${sh.i})`}>
                <path d={FLAG_PATH} fill={sh.color} fillOpacity={0.93} />
                {/* The fold over the string, a shade darker than the sheet. */}
                <rect x={0} y={0} width={FLAG_W} height={FOLD} fill="black" fillOpacity={0.18} />
              </g>
              {sh.sponsor && (
                <image
                  href={sh.sponsor.src}
                  x={24}
                  y={FOLD + 12}
                  width={FLAG_W - 48}
                  height={52}
                  preserveAspectRatio="xMidYMid meet"
                />
              )}
            </g>
          </g>
        ))}
        <path d={string} stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} fill="none" />
      </svg>
    </div>
  )
}
