"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SUMMIT_ART, SUMMIT_ALT } from "@/data/summit"

/**
 * The artwork, presented full-screen.
 *
 * The one real problem is shape: the key art is 1:1 and a TV is 16:9.
 * Cropping to fill would take about 44% of the height — the sponsor row and
 * the bottom of the wordmark — so the art is fitted whole and the leftover
 * width either side is filled by continuing the artwork rather than by bars.
 *
 * The continuation is the art itself, mirrored at each edge and blurred. A
 * mirror is the one transform that is exactly continuous across the seam: the
 * pixel to the left of the boundary is the pixel to its right, so the beams
 * and the colour field carry on out to the screen edge instead of stopping at
 * a line. Getting there needs no measurement — the three images sit in a
 * centred flex row and meet by construction, at any resolution.
 */
export function SummitStage() {
  const [idle, setIdle] = useState(true)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /* Cursor and the fullscreen control disappear once nobody is touching the
     machine, so what is left on the screen is only the artwork. */
  useEffect(() => {
    const wake = () => {
      setIdle(false)
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setIdle(true), 2500)
    }
    window.addEventListener("mousemove", wake)
    window.addEventListener("touchstart", wake)
    return () => {
      window.removeEventListener("mousemove", wake)
      window.removeEventListener("touchstart", wake)
      clearTimeout(idleTimer.current)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen().catch(() => {})
  }, [])

  /* `f` toggles fullscreen. Whoever sets the TV up is unlikely to have a
     mouse, and every TV browser and streaming stick has a keyboard somewhere. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") toggleFullscreen()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggleFullscreen])

  return (
    <div className={`smt${idle ? " smt-idle" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* eslint-disable @next/next/no-img-element -- one fixed asset shown at a
          known size on a known screen; next/image adds a transform step and
          nothing else. */}
      <img src={SUMMIT_ART} alt="" aria-hidden className="smt-wash" />

      <div className="smt-stage">
        <img src={SUMMIT_ART} alt="" aria-hidden className="smt-edge smt-edge-l" />
        <img
          src={SUMMIT_ART}
          alt={SUMMIT_ALT}
          className="smt-art"
          fetchPriority="high"
          decoding="sync"
        />
        <img src={SUMMIT_ART} alt="" aria-hidden className="smt-edge smt-edge-r" />
      </div>
      {/* eslint-enable @next/next/no-img-element */}

      <div className="smt-falloff" />
      <div className="smt-bloom" />
      <div className="smt-grain" />

      <button className="smt-fs" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
        Fullscreen <kbd>F</kbd>
      </button>
    </div>
  )
}

/**
 * Scoped to `.smt` and injected here rather than living in globals.css, so the
 * whole page deletes with its folder.
 */
const CSS = `
.smt {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #04050a;
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}
.smt-idle { cursor: none; }

/* Base colour field: the whole image, blown out and blurred past recognition.
   Only there so the extremes of the screen are never flat black, which is what
   made the art read as a square pasted onto a page. */
.smt-wash {
  position: absolute;
  inset: -20%;
  width: 140%;
  height: 140%;
  object-fit: cover;
  filter: blur(90px) saturate(1.3) brightness(1.15);
  opacity: .45;
  animation: smt-wash 140s ease-in-out infinite;
}

/* The art and its two mirrored continuations, in a centred row. Each is
   height-locked with an automatic width, so they meet exactly at the artwork's
   edges without anything measuring anything. */
.smt-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: smt-drift 180s ease-in-out infinite;
}
.smt-art,
.smt-edge {
  height: 100%;
  width: auto;
  max-width: none;
  flex: none;
}

/* Blurred hard, because the mirror is only wanted for its large-scale
   structure. At 70px the wordmark and the sponsor row dissolve completely
   while the beam and the colour field survive — blur is a low-pass filter, and
   type is the high frequency. A gentler blur leaves a legible ghost of the
   poster either side, which looks worse than bars ever did. */
.smt-edge {
  transform: scaleX(-1);
  filter: blur(70px) saturate(1.05);
}

/* Tucked ~70px under the artwork, which is the width of the blur.
 *
 * A CSS blur filter fades an element's own boundary to transparent, so butting
 * a blurred image against a sharp one leaves a dark hairline exactly at the
 * join — the seam this whole arrangement exists to remove. Sliding each mirror
 * under the art hides its faded border behind opaque pixels. It costs 70px of
 * offset against true mirror symmetry, which at a 70px blur radius is not a
 * difference anything can see.
 *
 * Brightness is left at 1 for the same reason: a dimmed mirror reintroduces
 * the seam as a step in luminance. The darkening towards the screen edges is
 * the falloff layer's job, and it does not begin until past the artwork. */
/* The artwork sits above both mirrors, and its own outer edge is feathered.
 *
 * Even a perfect mirror does not match at the join, because a 2D blur averages
 * vertically as well: at the height of the beam the artwork's edge column is
 * bright, while its blurred twin has had the darker area above and below mixed
 * into it. Measured at the seam that was a step of about 46 in luminance out of
 * 255 — small, and plainly visible as a vertical line.
 *
 * Feathering the last 3.5% of the art turns that step into a ramp. It is safe
 * to spend: 3.5% of 1080 is 38px, the outer edge of the art is unbroken
 * gradient, and the nearest real content — the left sponsor mark — sits at
 * about 9%. */
.smt-art {
  position: relative;
  z-index: 1;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 3.5%, #000 96.5%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, #000 3.5%, #000 96.5%, transparent 100%);
}
.smt-edge-l { margin-right: -70px; }
.smt-edge-r { margin-left: -70px; }

/* Falloff towards the screen edges.
 *
 * Anchored to the viewport rather than masked onto the mirrored images, which
 * is where the first attempt went wrong: each mirror is as wide as the art is
 * tall, but only the outer ~39% of it is ever on screen at 16:9, so a mask
 * written in element percentages spent its whole gradient off-screen and did
 * nothing. In viewport terms the geometry is knowable — a 1:1 image fitted to
 * a 16:9 frame leaves 21.9% either side — so the fade completes by 20% and
 * never touches the artwork itself.
 */
.smt-falloff {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to right,
    rgba(4,5,10,.92) 0%,
    rgba(4,5,10,.5) 9%,
    transparent 20%,
    transparent 80%,
    rgba(4,5,10,.5) 91%,
    rgba(4,5,10,.92) 100%);
}

/* A slow highlight travelling across the beam and out over the continuations,
   which is what stops the whole thing reading as a still. It lights the art and
   the spill together, so they behave like one surface. */
.smt-bloom {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 34% 20% at 50% 52%, rgba(150,200,255,.20), rgba(120,170,255,.06) 45%, transparent 72%);
  mix-blend-mode: screen;
  pointer-events: none;
  animation: smt-bloom 26s ease-in-out infinite;
}

/* Dither. Wide dark gradients band visibly across 55 inches of 8-bit panel;
   a little noise over the top breaks the steps up. */
.smt-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: .045;
  mix-blend-mode: overlay;
}

/* The drift is for the panel, not the viewer. A TV asked to hold one image for
   three hours is the textbook burn-in case, and a couple of pixels of movement
   stops any single edge sitting on the same subpixels the whole time. The art
   is translated only — scaling it would resample type that is currently
   pixel-exact on a 1080p screen. */
@keyframes smt-drift {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50%      { transform: translate3d(2px, -2px, 0); }
}
@keyframes smt-wash {
  0%, 100% { transform: scale(1) translate3d(0, 0, 0); }
  50%      { transform: scale(1.08) translate3d(-1.5%, 1%, 0); }
}
@keyframes smt-bloom {
  0%, 100% { opacity: .55; transform: translate3d(-6%, 0, 0) scale(1); }
  50%      { opacity: 1;   transform: translate3d(7%, 0, 0) scale(1.14); }
}

.smt-fs {
  position: absolute;
  right: 1.4vh; bottom: 1.4vh;
  display: inline-flex; align-items: center; gap: .6vh;
  padding: .75vh 1.3vh;
  border: 1px solid rgba(255,255,255,.2);
  border-radius: .5vh;
  background: rgba(4,10,30,.6);
  color: rgba(255,255,255,.8);
  font: inherit; font-size: 1.1vh;
  letter-spacing: .16em; text-transform: uppercase;
  cursor: pointer;
  transition: opacity .4s ease;
}
.smt-fs kbd {
  font: inherit; font-size: .95vh;
  padding: 0 .4vh;
  border: 1px solid rgba(255,255,255,.28); border-radius: .3vh;
}
.smt-idle .smt-fs { opacity: 0; pointer-events: none; }

@media (prefers-reduced-motion: reduce) {
  .smt-stage, .smt-wash, .smt-bloom { animation: none; }
}
`
