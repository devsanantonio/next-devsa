"use client"

import { useEffect, useRef } from "react"

/**
 * A shooting star, now and then, as the reader scrolls — a quiet layer on the
 * star field, not a feature.
 *
 * Replaces the twinkling sparkles that sat around the headline; constant
 * pulsing read as busy. Nothing moves here until the reader does, and even
 * then rarely: at least 900px of scrolling and 6 seconds since the last one,
 * then a 40% chance, and never two in the sky at once. Each is short, thin
 * and faint, and gone in under a second.
 *
 * ## Why it is driven from here and not from globals.css
 *
 * The first version animated with a CSS class. On a dev server that had not
 * picked up the new stylesheet, every star rendered unanimated — a flat white
 * line, never moving, never removed — and they piled up down the page as the
 * reader scrolled. So the motion is the Web Animations API on the element
 * itself, nothing depends on a stylesheet, and every star is also removed on a
 * timer whether or not its animation ever finished.
 *
 * Elements are created and removed directly in a container rather than kept in
 * React state; there is nothing here React needs to know about. Randomness
 * lives in the scroll handler, never in render, so the first paint — which has
 * no stars — is identical on server and client.
 */
const DURATION = 850

export function ShootingStars() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let lastY = window.scrollY
    let distance = 0
    let lastAt = 0
    let inFlight = false
    const timers = new Set<number>()

    const launch = () => {
      const rightward = Math.random() < 0.5
      const angle = (rightward ? 1 : -1) * (20 + Math.random() * 18)
      const length = 60 + Math.random() * 50
      const travel = (rightward ? 1 : -1) * (220 + Math.random() * 160)

      const star = document.createElement("span")
      Object.assign(star.style, {
        position: "absolute",
        top: `${6 + Math.random() * 38}%`,
        left: `${rightward ? 8 + Math.random() * 40 : 50 + Math.random() * 42}%`,
        width: `${length}px`,
        height: "1px",
        borderRadius: "1px",
        opacity: "0",
        // The head leads, so the bright end is the end it travels toward.
        transformOrigin: rightward ? "right center" : "left center",
        background: `linear-gradient(to ${rightward ? "left" : "right"}, rgba(255,255,255,0.75), rgba(255,255,255,0))`,
      } satisfies Partial<CSSStyleDeclaration>)
      layer.appendChild(star)
      inFlight = true

      const done = () => {
        star.remove()
        inFlight = false
      }
      const animation = star.animate(
        [
          { transform: `rotate(${angle}deg) translateX(0)`, opacity: 0 },
          { opacity: 0.55, offset: 0.2 },
          { opacity: 0.55, offset: 0.65 },
          { transform: `rotate(${angle}deg) translateX(${travel}px)`, opacity: 0 },
        ],
        { duration: DURATION, easing: "cubic-bezier(0.3, 0, 0.6, 1)", fill: "forwards" },
      )
      animation.onfinish = done
      // Belt and braces: gone on schedule even if the animation never ran.
      const t = window.setTimeout(() => {
        timers.delete(t)
        done()
      }, DURATION + 300)
      timers.add(t)
    }

    const onScroll = () => {
      const y = window.scrollY
      distance += Math.abs(y - lastY)
      lastY = y
      const now = performance.now()
      if (inFlight || distance < 900 || now - lastAt < 6000) return
      distance = 0
      if (Math.random() >= 0.4) return
      lastAt = now
      launch()
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      timers.forEach((t) => window.clearTimeout(t))
      layer.replaceChildren()
    }
  }, [])

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    />
  )
}
