"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"

/**
 * The two pieces of play the conference cards borrow from next-sasw, where
 * each of these ran across a full-width band on /schedule.
 *
 * Both are decoration and both are hover-only, so a touch reader gets the
 * static card and loses nothing — neither effect carries information. They sit
 * inside the card's mark band, which already clips, so nothing escapes over the
 * copy underneath.
 *
 * ## Why the mascots are not on click any more
 *
 * On /schedule The Model's band spawns a mascot each time the Claude Code node
 * in its graph is clicked. That band is not a link. These cards are — the whole
 * card is one — so a click here is navigation, and an easter egg that competes
 * with it would either eat the press or fire on the way out of the page.
 *
 * Hovering releases them instead, one every 150ms while the pointer is over the
 * band. That keeps what the click version was actually for — they arrive a few
 * at a time rather than all at once, so it reads as something you are doing
 * rather than an animation that was already running — without taking the press.
 */

/* ── Access Granted: a spotlight that decrypts ─────────────────────────────── */

const SIZE = 10
const CHAR_W = SIZE * 0.6
const LINE_H = SIZE * 1.35
/** A ceiling, so a wide card cannot ask for an unreasonable string. */
const MAX_GLYPHS = 4000
const ALPHABET =
  "ABCDEF0123456789abcdef!<>/\\|=+*#$%&?^~ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function scramble(n: number) {
  let out = ""
  for (let i = 0; i < n; i++)
    out += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
  return out
}

/**
 * A field of ciphertext behind the lettering, readable only where the cursor is.
 *
 * On an activation about lockpicking and threat modeling, a spotlight that
 * decrypts a patch of noise is the subject rather than an effect borrowed from
 * somewhere else.
 *
 * Two things are done differently from the pattern this is modeled on, and
 * both are inherited from the next-sasw original. The characters are written
 * straight to the DOM on an interval rather than held in React state — the
 * pattern this came from regenerates its string inside `onMouseMove`, which is
 * a setState with a four-figure payload on every pointer event. Here the
 * pointer only ever writes to motion values, which by design do not re-render.
 * And the scramble timer only runs while a pointer is actually over the band,
 * so an idle card costs nothing at all.
 *
 * Scaled down from the band version: a 190px spotlight over a card this size
 * would light the whole thing at once and stop being a spotlight, and the field
 * is sized to the band rather than reaching far outside it, because here there
 * is no surrounding grid for it to lie on.
 */
export function ConferenceCipherField({ accent }: { accent: string }) {
  const layer = React.useRef<HTMLDivElement>(null)
  const text = React.useRef<HTMLParagraphElement>(null)
  const timer = React.useRef<number | null>(null)
  const count = React.useRef(0)
  const x = useMotionValue(-9999)
  const y = useMotionValue(-9999)
  const [lit, setLit] = React.useState(false)

  const mask = useMotionTemplate`radial-gradient(120px circle at ${x}px ${y}px, white, transparent 76%)`

  // Sized from the box rather than fixed: how much text this needs is a
  // function of the band, and the band is three different sizes across the
  // grid's breakpoints.
  React.useEffect(() => {
    const fill = () => {
      const box = layer.current?.getBoundingClientRect()
      if (!box || !text.current) return
      count.current = Math.min(
        MAX_GLYPHS,
        Math.ceil((box.width / CHAR_W) * (box.height / LINE_H) * 1.15),
      )
      text.current.textContent = scramble(count.current)
    }
    fill()
    window.addEventListener("resize", fill)
    return () => window.removeEventListener("resize", fill)
  }, [])

  const start = React.useCallback(() => {
    if (timer.current !== null) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    timer.current = window.setInterval(() => {
      if (text.current) text.current.textContent = scramble(count.current)
    }, 90)
  }, [])

  const stop = React.useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current)
      timer.current = null
    }
  }, [])

  React.useEffect(() => stop, [stop])

  const track = React.useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      const box = layer.current?.getBoundingClientRect()
      if (!box) return
      x.set(e.clientX - box.left)
      y.set(e.clientY - box.top)
      setLit(true)
      start()
    },
    [start, x, y],
  )

  const leave = React.useCallback(() => {
    setLit(false)
    stop()
  }, [stop])

  return (
    <>
      <div
        ref={layer}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
            opacity: lit ? 1 : 0,
          }}
        >
          <p
            ref={text}
            className="absolute inset-0 break-all font-mono text-[10px] leading-[1.35] font-medium whitespace-pre-wrap"
            style={{ color: `${accent}b8` }}
          />
        </motion.div>
      </div>

      {/* The hit area. A descendant of the card's own anchor, so a press still
          navigates — this only ever listens for the pointer's position. */}
      <span
        aria-hidden="true"
        onPointerMove={track}
        onPointerLeave={leave}
        className="absolute inset-0 z-10"
      />
    </>
  )
}

/* ── The Model: mascots out of the wordmark ────────────────────────────────── */

/** The Claude Code mark, the same glyph next-sasw walks across The Model's band. */
const CLAUDE_CODE_MARK = {
  viewBox: "0 0 24 24",
  inner:
    '<path clip-rule="evenodd" d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z"></path>',
}

/** How many the band will hold. Seven, not the band version's twelve — this is
 *  a card, and a dozen 18px marks in 305x208 is a crowd rather than a scatter. */
const MAX = 7
/** Cruising speed, px/sec. Slow enough to read as a walk. */
const WALK = 34
/** Launch speed, px/sec — the "shoots out" part. Decays to WALK. */
const BURST = 260
/** How quickly the burst bleeds off. Higher settles sooner. */
const DRAG = 3.4
/** Gap between releases while the pointer is over the band. */
const CADENCE = 150

interface Mascot {
  id: number
  x: number
  y: number
  /** Heading, radians. */
  a: number
  /** Current speed, px/sec — starts at BURST and decays toward WALK. */
  v: number
  /** Offset into the bob cycle, so they don't bounce in step. */
  phase: number
  el: HTMLDivElement | null
}

export function ConferenceMascots({ color }: { color: string }) {
  const layer = React.useRef<HTMLDivElement>(null)
  /**
   * The simulation lives in a ref, because it is rewritten sixty times a second
   * and none of it should re-render anything. The *launch* position has to be
   * readable at render time to place each mascot on its first paint, and
   * reading a ref during render is both a lint error and a correctness trap —
   * so the spawn point is duplicated into state, where it is written once per
   * release and never again.
   */
  const mascots = React.useRef<Mascot[]>([])
  const [seeds, setSeeds] = React.useState<
    { id: number; x: number; y: number }[]
  >([])
  const [over, setOver] = React.useState(false)
  const raf = React.useRef(0)

  const spawn = React.useCallback(() => {
    const el = layer.current
    if (!el || mascots.current.length >= MAX) return
    const box = el.getBoundingClientRect()
    if (box.width === 0) return
    // Out of the middle of the band, which is where the lockup is set. On
    // next-sasw this hunts for a `data-mascot-origin` on the wordmark because
    // that band stacks differently at every breakpoint; here the mark is
    // centered in its box by the grid itself, so the center *is* the wordmark.
    mascots.current.push({
      id: Date.now() + mascots.current.length,
      x: box.width / 2,
      y: box.height / 2,
      // Any direction, so seven releases scatter rather than forming a queue.
      a: Math.random() * Math.PI * 2,
      v: BURST,
      phase: Math.random() * Math.PI * 2,
      el: null,
    })
    setSeeds(mascots.current.map((m) => ({ id: m.id, x: m.x, y: m.y })))
  }, [])

  // Released a few at a time while the pointer is over the band, rather than
  // all at once on enter — the drip is what made the click version feel like
  // something you were doing.
  React.useEffect(() => {
    if (!over) return
    spawn()
    const id = window.setInterval(spawn, CADENCE)
    return () => clearInterval(id)
  }, [over, spawn])

  // Cleared on the way out, after the layer has faded. Without this a card
  // hovered a few times accumulates its seven and keeps them for the life of
  // the page, which turns an easter egg into a permanent texture.
  React.useEffect(() => {
    if (over) return
    const id = window.setTimeout(() => {
      mascots.current = []
      setSeeds([])
    }, 320)
    return () => clearTimeout(id)
  }, [over])

  React.useEffect(() => {
    if (seeds.length === 0) return
    const el = layer.current
    if (!el) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let bounds = el.getBoundingClientRect()
    const remeasure = () => {
      bounds = el.getBoundingClientRect()
    }
    window.addEventListener("resize", remeasure)

    let last = 0
    const tick = (now: number) => {
      raf.current = requestAnimationFrame(tick)
      // Capped, so a backgrounded tab does not resume with one enormous step
      // that flings everything into a wall.
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
      last = now

      for (const m of mascots.current) {
        if (!m.el) continue
        if (!still) {
          // Ease the launch down to a walk rather than cutting to it.
          m.v += (WALK - m.v) * Math.min(DRAG * dt, 1)
          // A small random turn each frame, so the path meanders instead of
          // running dead straight until it hits an edge. Suppressed while the
          // burst is still hot, or the shot out of the wordmark looks drunk.
          if (m.v < WALK * 2) m.a += (Math.random() - 0.5) * 0.3
          m.x += Math.cos(m.a) * m.v * dt
          m.y += Math.sin(m.a) * m.v * dt
          // Turn back at the edges rather than clamping, or they pile into the
          // corners and stay there.
          const pad = 12
          if (m.x < pad || m.x > bounds.width - pad) {
            m.a = Math.PI - m.a
            m.x = Math.min(Math.max(m.x, pad), bounds.width - pad)
          }
          if (m.y < pad || m.y > bounds.height - pad) {
            m.a = -m.a
            m.y = Math.min(Math.max(m.y, pad), bounds.height - pad)
          }
          m.phase += dt * 9
        }
        const bob = still ? 0 : Math.sin(m.phase) * 2
        const facing = Math.cos(m.a) < 0 ? -1 : 1
        m.el.style.transform = `translate(-50%, -50%) translate(${m.x.toFixed(1)}px, ${(m.y + bob).toFixed(1)}px) scaleX(${facing})`
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener("resize", remeasure)
    }
  }, [seeds.length])

  return (
    <>
      <div
        ref={layer}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300 ${
          over ? "opacity-100" : "opacity-0"
        }`}
      >
        {seeds.map((seed, i) => (
          <div
            key={seed.id}
            ref={(node) => {
              const m = mascots.current[i]
              if (m) m.el = node
            }}
            // Positioned inline for the very first paint. The effect above runs
            // after the browser paints, so without this each mascot is visible
            // at the layer's top-left corner for one frame before the loop
            // moves it — a flash that reads as it appearing in the wrong place.
            style={{
              transform: `translate(-50%, -50%) translate(${seed.x.toFixed(1)}px, ${seed.y.toFixed(1)}px)`,
            }}
            className="absolute left-0 top-0 h-[18px] w-[18px]"
          >
            {/*
              The pop is on its own element, and has to stay there.

              `confPop` animates the standalone `scale` property, and CSS
              applies `translate`/`rotate`/`scale` *before* `transform` — the
              used matrix is scale x transform, not the other way round. On the
              same element as the positioning transform, `scale(0.4)` would
              therefore multiply the translation as well as the glyph: a mascot
              bound for (x, y) renders at 0.4 of that offset from the layer's
              corner, then slides out to its real spot as the pop finishes.
              Nested, the scale has nothing but itself to act on.
            */}
            <div
              className="h-full w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] motion-safe:animate-[confPop_320ms_ease-out]"
              style={{ color }}
            >
              <svg
                viewBox={CLAUDE_CODE_MARK.viewBox}
                fill="currentColor"
                className="h-full w-full"
                dangerouslySetInnerHTML={{ __html: CLAUDE_CODE_MARK.inner }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* The hit area, as above: a descendant of the card's anchor, so the
          press still navigates. */}
      <span
        aria-hidden="true"
        onPointerEnter={() => setOver(true)}
        onPointerLeave={() => setOver(false)}
        className="absolute inset-0 z-10"
      />
    </>
  )
}

/* ── PySanAntonio: the mascot, while you are looking ──────────────────────── */

/**
 * The mascot clip, played only while the pointer is over the card.
 *
 * The other two cards' effects are drawn on top of their lettering. This one
 * runs behind it, because PySanAntonio's mark is drawn artwork — Amador is
 * Adobe-Fonts-only, so the wordmark cannot be set live and cannot be redrawn
 * over a moving picture. It stays exactly where it is and the mascot arrives
 * underneath, with a scrim between them so the lettering never has to compete
 * with whatever frame is behind it.
 *
 * Hover-gated rather than autoplaying, which is the difference between this and
 * More Human's card. That one *is* its video — there is no lockup under it, so
 * it has to run to show anything. Here the card reads perfectly at rest, and
 * four conference tiles decoding four videos nobody has pointed at is a cost
 * with nothing on the other side of it.
 *
 * `preload="none"`, for the same reason: at rest this card should cost one
 * poster frame. The first hover fetches, which is a beat late once — and the
 * poster is already painted underneath, so the beat shows as the still rather
 * than as a hole.
 *
 * Reduced motion gets the poster and no playback. The frame is the mascot
 * holding up two fingers for a second edition, which is the clip's own best
 * moment, so nothing is lost by holding it.
 */
export function ConferenceHoverClip({
  src,
  poster,
}: {
  src: string
  poster: string
}) {
  const video = React.useRef<HTMLVideoElement>(null)
  const [over, setOver] = React.useState(false)

  const enter = React.useCallback(() => {
    setOver(true)
    const el = video.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // `play()` rejects if the element is torn down or the gesture policy
    // refuses mid-flight. Nothing to recover — the poster is already showing.
    void el.play().catch(() => {})
  }, [])

  const leave = React.useCallback(() => {
    setOver(false)
    video.current?.pause()
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          over ? "opacity-100" : "opacity-0"
        }`}
      >
        <video
          ref={video}
          src={src}
          poster={poster}
          preload="none"
          loop
          muted
          playsInline
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        {/* Enough to hold the wordmark off the footage without washing the
            mascot out — he is lit against a near-black set already, so this is
            closer to a tint than a panel. */}
        <span className="absolute inset-0 bg-black/55" />
      </div>

      <span
        aria-hidden="true"
        onPointerEnter={enter}
        onPointerLeave={leave}
        className="absolute inset-0 z-10"
      />
    </>
  )
}
