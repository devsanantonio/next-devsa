"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react"

/**
 * The /fm hero: the night bus, the stream's opening scene, as the star, with the option to hear it.
 *
 * Two files, so the page stays light for the people who never turn the sound on:
 *   night-bus-loop.mp4  32 s, silent, ~2.5 MB: what autoplays. The scene very nearly repeats every 32 s and
 *                       the cut closes on a half-second cross-fade, so it loops without a jump.
 *   night-bus.mp4       the whole loop as it airs, 2 min 38 s with "Smooth Tech-jano", ~13 MB: loaded only
 *                       when someone asks for sound. Picture and song are one file, so they can't drift.
 * The short loop is the long one's 18.5 s onward, so turning the sound on keeps the same frame on screen.
 *
 * Both are cut from devsa-fm's out/loop-commute-night.mp4 with the stream's footer bar cropped off:
 *   crop=1920:960:0:0, scale 1280x640, H.264 (+ AAC 128k for the long one), faststart.
 *
 * With prefers-reduced-motion nothing plays on its own; the poster shows until someone presses Sound on.
 */
const LOOP = "/fm/night-bus-loop.mp4"
const FULL = "/fm/night-bus.mp4"
const LOOP_AT = 18.5 // where the short loop starts in the full one, in seconds
const PATRICK = "https://www.linkedin.com/in/patrick-robinson-dev/"

export function FmHeroLoop() {
  const ref = useRef<HTMLVideoElement>(null)
  const [sound, setSound] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {})
  }, [])

  function toggle() {
    const v = ref.current
    if (!v) return
    if (sound) {
      v.muted = true
      setSound(false)
      return
    }
    // Swap to the full loop at the same frame, then play with sound. Unmuting inside the click keeps
    // browsers' autoplay rules happy.
    const at = v.currentSrc.endsWith(FULL) ? v.currentTime : LOOP_AT + (v.currentTime || 0)
    if (!v.currentSrc.endsWith(FULL)) {
      v.src = FULL
      // the new file can't seek until its metadata is in
      v.addEventListener("loadedmetadata", () => { v.currentTime = at }, { once: true })
    }
    v.muted = false
    v.play().catch(() => {})
    setSound(true)
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        className="block aspect-[2/1] w-full rounded-2xl border border-neutral-800 bg-[#0c0c0c] object-cover"
        src={LOOP}
        poster="/fm/night-bus.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="DEVSA FM's night bus: a city bus with DEVSA's stickers in its windows, rolling past Mission San José at night, drawn in ASCII characters"
      />
      {/* From sm up the controls sit on a dark fade along the bottom edge, where the stream's own footer
          would be. On a phone the video is too short to share, so they sit under it. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:absolute sm:inset-x-px sm:bottom-px sm:mt-0 sm:items-end sm:rounded-b-2xl sm:bg-gradient-to-t sm:from-black/80 sm:via-black/40 sm:to-transparent sm:px-6 sm:pb-5 sm:pt-12">
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
