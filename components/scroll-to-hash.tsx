"use client"

import { useEffect } from "react"

/**
 * Scrolls to the #section in the address once it exists and has stopped moving.
 *
 * A browser looks for a URL's fragment once, when the page loads, and never
 * again. On /buildingtogether the sections render about a second after that,
 * so devsa.community/get-involved — which lands on
 * /buildingtogether#get-involved — left people at the top of a 7,000px page,
 * with the form five screens down. /shop → #donate had the same problem.
 *
 * This waits for the element, scrolls to it, and re-aims while the content
 * above it is still arriving and pushing it down. It gives up after about six
 * seconds, and the moment the visitor scrolls, taps or presses a key, so it
 * never takes the page out of the hands of someone already reading.
 * scrollIntoView honours the section's scroll-margin, so the fixed navbar does
 * not cover the heading.
 */
export function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return

    let cancelled = false
    const stop = () => {
      cancelled = true
    }
    const events = ["wheel", "touchstart", "keydown", "mousedown"] as const
    events.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }))

    let last = Number.NaN
    let stableTicks = 0
    let ticks = 0
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      if (cancelled || ticks++ > 40) return
      const el = document.getElementById(id)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY
        if (Math.abs(top - last) < 2) {
          // Settled: three still readings in a row and we are done.
          if (++stableTicks >= 3) return
        } else {
          stableTicks = 0
          el.scrollIntoView({ block: "start" })
        }
        last = top
      }
      timer = setTimeout(tick, 150)
    }
    tick()

    return () => {
      cancelled = true
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, stop))
    }
  }, [])

  return null
}
