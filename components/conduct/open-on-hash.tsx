"use client"

import { useEffect } from "react"

/**
 * Opens the <details> section a link points at.
 *
 * The code of conduct's sections are native <details> rows. Jumping to one by
 * its #id scrolls to it but leaves it shut, so the sidebar and any shared link
 * (/code-of-conduct#report) would land on a closed row. This opens it — on load
 * and on every hash change — and scrolls it into view.
 */
export function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      const el = document.getElementById(id)
      if (el instanceof HTMLDetailsElement) {
        el.open = true
        el.scrollIntoView({ block: "start" })
      }
    }
    open()
    window.addEventListener("hashchange", open)
    return () => window.removeEventListener("hashchange", open)
  }, [])
  return null
}
