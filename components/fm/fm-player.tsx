"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"

/**
 * The DEVSA FM player: one scene, live, with the night mix under it to pick from.
 *
 * The scenes aren't in this repo. They live in devsanantonio/devsa-fm, GitHub Pages publishes them,
 * and next.config.ts serves them here under /fm/scene/, /fm/thumbs/ and /fm/scenes.json. So a scene
 * merged there shows up here with no change to the site. Don't copy scene files into this repo: two
 * copies drift (CLAUDE.md, on fallbacks).
 *
 * A scene is a 1920x1080 canvas page; the frame scales it to fit. Only the chosen scene loads (some
 * pull in hundreds of film frames), and ?scene=<id> picks one, which is how the old github.io links land.
 */

type Scene = { id: string; file: string; query?: string; title: string; what: string; mix?: number; by?: string; starter?: boolean }

const REPO = "https://github.com/devsanantonio/devsa-fm"
const FIRST = "paseo"

export function FmPlayer() {
  const [scenes, setScenes] = useState<Scene[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    fetch("/fm/scenes.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { scenes: Scene[] }) => {
        const list = d.scenes.filter((s) => !s.starter)
        setScenes(list)
        const asked = new URLSearchParams(window.location.search).get("scene")
        setId(list.find((s) => s.id === asked)?.id ?? list.find((s) => s.id === FIRST)?.id ?? list[0]?.id ?? null)
      })
      .catch(() => setFailed(true))
  }, [])

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1920))
    ro.observe(el)
    return () => ro.disconnect()
  }, [scenes])

  function pick(next: string) {
    setId(next)
    const url = new URL(window.location.href)
    url.searchParams.set("scene", next)
    window.history.replaceState(null, "", url)
    frame.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  if (failed) {
    return (
      <p className="max-w-2xl text-white/70">
        The scenes didn&apos;t load just now.{" "}
        <a href={REPO} className="text-white underline decoration-white/25 underline-offset-4 hover:decoration-white">
          They&apos;re all in the repo
        </a>
        .
      </p>
    )
  }

  const scene = scenes?.find((s) => s.id === id)
  const onAir = (scenes ?? []).filter((s) => s.mix).sort((a, b) => (a.mix ?? 0) - (b.mix ?? 0))
  const more = (scenes ?? []).filter((s) => !s.mix)

  return (
    <div>
      <div ref={frame} className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 bg-[#0c0c0c]">
        {scene && scale > 0 && (
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

      {scene && (
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="min-w-0">
            <p className="text-xl font-semibold text-white">
              {scene.mix ? <span className="mr-2 font-mono text-sm text-white/50">{String(scene.mix).padStart(2, "0")}</span> : null}
              {scene.title}
            </p>
            <p className="mt-1 max-w-2xl text-white/70">{scene.what}</p>
            {scene.by && <p className="mt-1 text-sm text-[#00b2a9]">Scene by {scene.by}</p>}
          </div>
          <a
            href={`${REPO}/blob/main/scene/${scene.file}`}
            className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[12px] text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            scene/{scene.file} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <Picker label="The night mix, in order" scenes={onAir} current={id} onPick={pick} />
      {more.length > 0 && <Picker label="Not in the mix" scenes={more} current={id} onPick={pick} />}
    </div>
  )
}

function Picker({ label, scenes, current, onPick }: { label: string; scenes: Scene[]; current: string | null; onPick: (id: string) => void }) {
  return (
    <div className="mt-10">
      <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">{label}</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {scenes.map((s) => {
          const on = s.id === current
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onPick(s.id)}
                aria-pressed={on}
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
    </div>
  )
}
