"use client"

import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react"

/**
 * The /fm hero's graphic: the night bus, the stream's opening scene, with Sound on to hear it as it airs.
 *
 * A video, not a live scene: a live scene is a 1920-wide canvas redrawing every frame, and framed on the page
 * it ran on the page's own thread (the cathedral blocked it 70-95 ms a frame). A video is decoded off the
 * page and costs it nothing. The scenes themselves live in the devsa-fm repo, stills and all.
 *
 * Two files keep the page light for people who never turn the sound on:
 *   night-bus-loop.mp4  32 s, silent, ~2.5 MB: what autoplays. The scene very nearly repeats every 32 s and
 *                       the cut closes on a half-second cross-fade, so it loops without a jump.
 *   night-bus.mp4       the whole loop as it airs, 2 min 38 s with "Smooth Tech-jano", ~13 MB, loaded only
 *                       on Sound on. The short loop is the long one from 18.5 s, so the frame carries over.
 * Both are cut from devsa-fm's out/loop-commute-night.mp4: crop=1920:960:0:0 (the stream's footer bar off),
 * scale 1280x640, H.264 (+ AAC 128k for the long one), faststart.
 *
 * With prefers-reduced-motion it waits on its poster until someone presses Sound on.
 * Vercel Analytics: fm_sound (on).
 */
const LOOP = "/fm/night-bus-loop.mp4"
const FULL = "/fm/night-bus.mp4"
const LOOP_AT = 18.5
const PATRICK = "https://www.linkedin.com/in/patrick-robinson-dev/"

export function FmHeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [sound, setSound] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (v && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {})
  }, [])

  function toggle() {
    const v = ref.current
    if (!v) return
    const on = !sound
    if (on && !v.currentSrc.endsWith(FULL)) {
      // swap to the full loop at the same frame; unmuting inside the click keeps autoplay rules happy
      const at = LOOP_AT + (v.currentTime || 0)
      v.src = FULL
      v.addEventListener("loadedmetadata", () => { v.currentTime = at }, { once: true })
    }
    v.muted = !on
    v.play().catch(() => {})
    setSound(on)
    track("fm_sound", { on })
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        className="block aspect-2/1 w-full rounded-2xl border border-neutral-800 bg-[#0c0c0c] object-cover"
        src={LOOP}
        poster="/fm/night-bus.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="DEVSA FM's night bus: a city bus with DEVSA's stickers in its windows, rolling past Mission San José at night, drawn in ASCII characters"
      />
      {/* On a dark fade along the bottom edge from sm up, where the stream's own footer would be; under the
          video on a phone, where it's too short to share. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:absolute sm:inset-x-px sm:bottom-px sm:mt-0 sm:items-end sm:rounded-b-2xl sm:bg-linear-to-t sm:from-black/80 sm:via-black/40 sm:to-transparent sm:px-6 sm:pb-5 sm:pt-12">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={sound}
          className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-black/60 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/60 hover:bg-black/80"
        >
          {sound ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {sound ? "Sound off" : "Sound on"}
        </button>
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/70">
          <span className="text-[#ff8200]">♪</span> Smooth Tech-jano ·{" "}
          <a href={PATRICK} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
            Patrick Robinson
            <ArrowUpRight className="ml-0.5 inline h-3 w-3 align-[-1px]" />
          </a>
        </p>
      </div>
    </div>
  )
}
