"use client"

import { useReducedMotion } from "motion/react"
import { PYSA_ASSETS, PYSA_VIDEO_CLIP } from "@/data/pysa/2026"

/**
 * Mobile-only interlude between the hero and the call for speakers.
 *
 * The same mascot clip desktop plays inside the hero, given its own full-bleed
 * band here. Phones have no room for it beside the hero copy — that is why the
 * hero's video box is `hidden sm:block` — so it lands below instead, where it
 * gets the full width.
 *
 * This replaced a scroll-driven sticker that grew as the section travelled up
 * the viewport. Worth knowing what that bought: the sticker is ~40 KB and the
 * clip is 6.8 MB, so mobile now pays for the video it previously never
 * downloaded.
 *
 * Purely decorative: aria-hidden, no tab stop. Honours prefers-reduced-motion
 * by holding the poster — which is the two-fingers frame, so nothing is lost.
 */
export function MascotInterlude() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      aria-hidden
      data-bg-type="dark"
      className="relative overflow-hidden bg-[#0a0a0a] sm:hidden"
    >
      {/* The clip's own 1114:720 ratio, so object-cover fills the box exactly
          and there is no letterbox edge for the fades below to sit against. */}
      <video
        src={PYSA_ASSETS.mascotVideo}
        poster={PYSA_ASSETS.mascotVideoPoster}
        autoPlay={!reduceMotion}
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          e.currentTarget.currentTime = PYSA_VIDEO_CLIP.start
        }}
        onTimeUpdate={(e) => {
          // Hand-rolled loop over the trimmed window instead of the `loop`
          // attribute, which would replay the empty walk-in and walk-out.
          const v = e.currentTarget
          if (v.currentTime >= PYSA_VIDEO_CLIP.end) v.currentTime = PYSA_VIDEO_CLIP.start
        }}
        className="aspect-1114/720 w-full object-cover"
      />

      {/* Top and bottom fades so the band reads as part of the page rather than
          a video pasted onto it — the same vertical vignette the hero uses. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-[#0a0a0a] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#0a0a0a] to-transparent"
      />
    </section>
  )
}
