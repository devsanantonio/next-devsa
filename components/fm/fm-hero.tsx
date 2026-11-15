"use client"

import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react"

/**
 * The /fm hero: the night bus, the stream's opening scene, set into the page with the words beside it and
 * the radio along its foot: the >FM mark is the sound control. It was a rounded, bordered video under the words, and read as a sticker on the
 * page. Now the scene shows whole, anchored bottom right, its left and top edges masked to transparent: the
 * scene's near-black (#0c0c0c) melts into the page's (#0a0a0a), so it reads as part of the page.
 *
 * Sized to the viewport from lg up (100svh, capped at 60rem, under the fixed, translucent nav), so a laptop or
 * a big monitor sees the whole hero, bus included, without scrolling. The scene is drawn at most 1500 px wide,
 * a little over the video's 1280, so it stays sharp on a large monitor rather than being blown up to fill it.
 * (Stretched full-bleed it was zoomed in: the bus ran into the words on a laptop and went soft on a monitor.)
 * Below lg the words come first and the scene runs edge to edge under them.
 *
 * A video, not a live scene: a live scene is a 1920-wide canvas redrawing every frame, and framed on the page
 * it ran on the page's own thread (the cathedral blocked it 70-95 ms a frame). A video costs the page nothing.
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

export function FmHero({ children }: { children: React.ReactNode }) {
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
    <section className="relative isolate flex flex-col overflow-hidden lg:block lg:h-[min(100svh,60rem)] lg:min-h-[620px]" data-bg-type="dark">
      {/* The scene, whole and at its own size, set into the page: anchored bottom right from lg up with its
          left and top edges faded out, so its near-black melts into the page's and the words sit in the dark
          it leaves; edge to edge under the words below lg. No frame, no corners. */}
      <div
        className="relative order-2 aspect-2/1 w-full lg:absolute lg:bottom-0 lg:right-0 lg:-z-10 lg:w-[74%] lg:max-w-[1500px]"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, #000 32%), linear-gradient(to bottom, transparent 0%, #000 22%, #000 88%, transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 32%), linear-gradient(to bottom, transparent 0%, #000 22%, #000 88%, transparent 100%)",
          WebkitMaskComposite: "source-in",
        }}
      >
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          src={LOOP}
          poster="/fm/night-bus.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="DEVSA FM's night bus: a city bus with DEVSA's stickers in its windows, rolling past Mission San José at night, drawn in ASCII characters"
        />
      </div>

      <div className="page-shell relative order-1 flex flex-col pb-10 pt-24 md:pt-28 lg:h-full lg:justify-center lg:pb-28 lg:pt-16">
        <div className="max-w-xl">{children}</div>
      </div>

      {/* The sound control is the >FM mark itself: the radio. Off, it's the one-colour alt mark; pressed, the
          sound comes on and the radio lights up in its colours, the full mark; pressed again, it goes quiet.
          The song's credit sits beside it, clear of the bus. */}
      <div className="page-shell relative order-3 pb-8 pt-2 lg:absolute lg:inset-x-0 lg:bottom-0 lg:pb-10 lg:pt-0">
        <div className="flex items-end gap-4">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={sound}
            aria-label={sound ? "Turn the sound off" : "Turn the sound on"}
            className="group shrink-0 rounded-lg transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- the brand SVGs, served as-is */}
            <img
              src={sound ? "/branding/devsa-fm/devsa-fm-mark.svg" : "/branding/devsa-fm/devsa-fm-alt-mark.svg"}
              alt=""
              className="h-16 w-auto md:h-20"
            />
          </button>
          <div className="pb-1">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
              {sound ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {sound ? "Sound off" : "Sound on: press the radio"}
            </p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-white/60">
              <span className="text-[#ff8200]">♪</span> Smooth Tech-jano ·{" "}
              <a href={PATRICK} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                Patrick Robinson
                <ArrowUpRight className="ml-0.5 inline h-3 w-3 align-[-1px]" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
