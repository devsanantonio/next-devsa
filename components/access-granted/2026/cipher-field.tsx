"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"
import { ACCESS_GREEN } from "@/data/access-granted/2026"

/** Type metrics for the field, used to work out how much of it to write. */
const SIZE = 11
const CHAR_W = SIZE * 0.6
const LINE_H = SIZE * 1.35
/** A ceiling, so an ultrawide viewport cannot ask for an unreasonable string. */
const MAX_GLYPHS = 16000
const ALPHABET =
  "ABCDEF0123456789abcdef!<>/\\|=+*#$%&?^~ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function scramble(n: number) {
  let out = ""
  for (let i = 0; i < n; i++)
    out += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
  return out
}

/**
 * A field of ciphertext behind the lock, readable only where the cursor is.
 *
 * Ported from sasw-geekdom/next-sasw's AccessCipherField. The art column is a
 * padlock over a schematic grid, and the artwork's logic is that the lock emits
 * green light onto a surface — this gives that surface something to say. A wall
 * of characters, invisible until a pointer crosses it, legible only inside a
 * soft circle that follows the cursor. On an activation about lockpicking and
 * threat modelling, a spotlight that decrypts a patch of noise is the subject
 * rather than an effect borrowed from somewhere else.
 *
 * Three things about how it is built, all of which are the reason it was worth
 * porting rather than reimplementing:
 *
 * The characters are written straight to the DOM on an interval, never held in
 * React state. The obvious implementation regenerates the string inside
 * `onPointerMove`, which is a setState with a multi-thousand-character payload
 * on every pointer event — sixty re-renders a second, each reconciling a text
 * node that long. Here the pointer only writes to motion values, which by
 * design do not re-render, and the scramble runs on its own ~11fps timer
 * against a ref. Nothing above this component ever re-renders.
 *
 * The timer only runs while a pointer is actually over the lock. Idle, this
 * costs nothing at all.
 *
 * The field is sized from its own box rather than a fixed count. A flat string
 * fills a fraction of a field this tall, so the spotlight would work perfectly
 * and reveal empty space below the fold of the text.
 *
 * Hover-only by nature, so touch gets the static art — which is why the effect
 * carries no information. Reduced motion leaves the field still, so the
 * spotlight degrades to a plain reveal rather than being removed.
 */
export function AccessCipherField() {
  const layer = React.useRef<HTMLDivElement>(null)
  const text = React.useRef<HTMLParagraphElement>(null)
  const timer = React.useRef<number | null>(null)
  const count = React.useRef(0)
  const x = useMotionValue(-9999)
  const y = useMotionValue(-9999)
  const [lit, setLit] = React.useState(false)

  // A circle of legibility that follows the pointer. Everything outside it is
  // masked to nothing, so the field only exists where someone is looking.
  const mask = useMotionTemplate`radial-gradient(190px circle at ${x}px ${y}px, white, transparent 78%)`

  React.useEffect(() => {
    const fill = () => {
      const box = layer.current?.getBoundingClientRect()
      if (!box || !text.current) return
      count.current = Math.min(
        MAX_GLYPHS,
        Math.ceil((box.width / CHAR_W) * (box.height / LINE_H) * 1.15)
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
      // Measured against the field, not the element under the pointer — the hit
      // area is the lock and the field reaches far wider than it.
      x.set(e.clientX - box.left)
      y.set(e.clientY - box.top)
      setLit(true)
      start()
    },
    [start, x, y]
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
        className="pointer-events-none absolute inset-y-[-45%] left-[-150%] right-[-45%] overflow-hidden"
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
            className="absolute inset-0 break-all whitespace-pre-wrap font-mono text-[11px] font-medium leading-[1.35]"
            style={{ color: `${ACCESS_GREEN}b8` }}
          />
        </motion.div>
      </div>

      {/* The hit area: the lock itself. No role and nothing announced — there is
          no action behind it, and the page reads the same without it. */}
      <span
        aria-hidden="true"
        onPointerMove={track}
        onPointerLeave={leave}
        className="absolute inset-0 z-10"
      />
    </>
  )
}
