"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react"

/**
 * The /fm hero and player in one: a big 2:1 frame that opens on the night bus, and the night mix right under
 * it to pick from. The page's intro (mark, lead, buttons) sits above it. (They were two sections, a hero video and a player below it; they said the same
 * thing twice.)
 *
 * The night bus is a video, so it can be heard. Two files keep the page light for people who never turn
 * the sound on:
 *   night-bus-loop.mp4  32 s, silent, ~2.5 MB: what autoplays. The scene very nearly repeats every 32 s and
 *                       the cut closes on a half-second cross-fade, so it loops without a jump.
 *   night-bus.mp4       the whole loop as it airs, 2 min 38 s with "Smooth Tech-jano", ~13 MB, loaded only
 *                       on Sound on. The short loop is the long one from 18.5 s, so the frame carries over.
 * Both are cut from devsa-fm's out/loop-commute-night.mp4: crop=1920:960:0:0 (the stream's footer bar off),
 * scale 1280x640, H.264 (+ AAC 128k for the long one), faststart.
 *
 * Every other scene runs live, silent, in an iframe: 1920x1080 scaled to the frame's width, so the 2:1 frame
 * crops the scene's footer exactly as the video is cropped. The scenes aren't in this repo: they live in
 * devsanantonio/devsa-fm and next.config.ts serves them under /fm/scene/, /fm/thumbs/ and /fm/scenes.json,
 * so a scene merged there shows up here with no deploy. Don't copy scene files in: two copies drift.
 * If the list can't load, the bus still plays and the picker just isn't shown.
 *
 * ?scene=<id> opens on a scene (the old github.io links land that way). With prefers-reduced-motion the
 * bus waits on its poster until someone presses Sound on.
 */

type Scene = { id: string; file: string; query?: string; title: string; what: string; mix?: number; by?: string; starter?: boolean }

const REPO = "https://github.com/devsanantonio/devsa-fm"
const PATRICK = "https://www.linkedin.com/in/patrick-robinson-dev/"
const BUS = "commute-night"
const LOOP = "/fm/night-bus-loop.mp4"
const FULL = "/fm/night-bus.mp4"
const LOOP_AT = 18.5

export function FmStage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [id, setId] = useState(BUS)
  const [sound, setSound] = useState(false)
  const [scale, setScale] = useState(0)
  const video = useRef<HTMLVideoElement>(null)
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/fm/scenes.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { scenes: Scene[] }) => {
        const list = d.scenes.filter((s) => !s.starter)
        setScenes(list)
        const asked = new URLSearchParams(window.location.search).get("scene")
        if (asked && list.some((s) => s.id === asked)) setId(asked)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1920))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The bus plays on its own unless the reader prefers less motion.
  useEffect(() => {
    const v = video.current
    if (id !== BUS || !v) return
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches || sound) v.play().catch(() => {})
  }, [id, sound])

  function pick(next: string) {
    if (next !== BUS && sound) {
      video.current?.pause()
      setSound(false)
    }
    setId(next)
    const url = new URL(window.location.href)
    if (next === BUS) url.searchParams.delete("scene")
    else url.searchParams.set("scene", next)
    window.history.replaceState(null, "", url)
    frame.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  function toggleSound() {
    const v = video.current
    if (!v) return
    if (sound) {
      v.muted = true
      setSound(false)
      return
    }
    // Swap to the full loop at the same frame and play with sound; unmuting inside the click keeps
    // browsers' autoplay rules happy.
    if (!v.currentSrc.endsWith(FULL)) {
      const at = LOOP_AT + (v.currentTime || 0)
      v.src = FULL
      v.addEventListener("loadedmetadata", () => { v.currentTime = at }, { once: true })
    }
    v.muted = false
    v.play().catch(() => {})
    setSound(true)
  }

  const scene = scenes.find((s) => s.id === id)
  const onAir = scenes.filter((s) => s.mix).sort((a, b) => (a.mix ?? 0) - (b.mix ?? 0))
  const more = scenes.filter((s) => !s.mix)
  const isBus = id === BUS

  return (
    <>
      <div className="relative">
        <div ref={frame} className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-neutral-800 bg-[#0c0c0c]">
          <video
            ref={video}
            className={`absolute inset-0 h-full w-full object-cover ${isBus ? "" : "invisible"}`}
            src={LOOP}
            poster="/fm/night-bus.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="DEVSA FM's night bus: a city bus with DEVSA's stickers in its windows, rolling past Mission San José at night, drawn in ASCII characters"
          />
          {!isBus && scene && scale > 0 && (
            <iframe
              key={scene.id}
              src={`/fm/scene/${scene.file}${scene.query ? `?${scene.query}` : ""}`}
              title={`DEVSA FM: ${scene.title}`}
              width={1920}
              height={1080}
              scrolling="no"
              className="absolute left-0 top-0 origin-top-left border-0"
              style={{ transform: `scale(${scale})` }}
            />
          )}
        </div>
        {/* From sm up the controls sit on a dark fade along the frame's bottom edge, where the stream's own
            footer would be. On a phone the frame is too short to share, so they sit under it. */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:absolute sm:inset-x-px sm:bottom-px sm:mt-0 sm:items-end sm:rounded-b-2xl sm:bg-gradient-to-t sm:from-black/80 sm:via-black/40 sm:to-transparent sm:px-6 sm:pb-5 sm:pt-12">
          {isBus ? (
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-black/60 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/60 hover:bg-black/80"
            >
              {sound ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {sound ? "Sound off" : "Sound on"}
            </button>
          ) : (
            <p className="text-sm font-semibold text-white">
              {scene?.mix ? <span className="mr-2 font-mono text-[12px] font-normal text-white/60">{String(scene.mix).padStart(2, "0")}</span> : null}
              {scene?.title}
            </p>
          )}
          {isBus ? (
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/70">
              <span className="text-[#ff8200]">♪</span> Smooth Tech-jano ·{" "}
              <a href={PATRICK} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                Patrick Robinson
                <ArrowUpRight className="ml-0.5 inline h-3 w-3 align-[-1px]" />
              </a>
            </p>
          ) : (
            scene && (
              <a
                href={`${REPO}/blob/main/scene/${scene.file}`}
                className="inline-flex items-center gap-1 font-mono text-[12px] text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white"
              >
                scene/{scene.file} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )
          )}
        </div>
      </div>

      {onAir.length > 0 && (
        <div id="on-air" className="mt-10 scroll-mt-24 md:mt-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">
            <span className="text-white/80">The night mix, in order</span> · On stream each plays to its own song
          </p>
          <Picker scenes={onAir} current={id} onPick={pick} />
          {more.length > 0 && (
            <>
              <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-white/50">Not in the mix</p>
              <Picker scenes={more} current={id} onPick={pick} />
            </>
          )}
        </div>
      )}
    </>
  )
}

function Picker({ scenes, current, onPick }: { scenes: Scene[]; current: string; onPick: (id: string) => void }) {
  return (
    <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {scenes.map((s) => {
        const on = s.id === current
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s.id)}
              aria-pressed={on}
              title={s.what}
              className={`group block w-full overflow-hidden rounded-xl border text-left transition-colors duration-200 ${
                on ? "border-white/70" : "border-neutral-800 hover:border-neutral-600"
              }`}
            >
              <span className="relative block aspect-video bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element -- served from the devsa-fm repo through a rewrite */}
                <img src={`/fm/thumbs/${s.id}.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
              </span>
              <span className="flex items-baseline gap-2 bg-neutral-900 px-3 py-2.5">
                {s.mix ? <span className="font-mono text-[11px] text-white/50">{String(s.mix).padStart(2, "0")}</span> : null}
                <span className={`truncate text-sm ${on ? "text-white" : "text-white/75 group-hover:text-white"}`}>{s.title}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
