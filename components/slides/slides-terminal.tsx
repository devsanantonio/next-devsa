"use client"

import { useEffect, useState } from "react"
import type { Deck } from "@/lib/slides"

/**
 * /slides as a terminal: an `ls` of the decks, newest first, with the selected
 * deck's cover beside it. Rows are plain links; ↑/↓ (or j/k) move the selection
 * and Enter presents it, so it also works the way it looks.
 */
const PROMPT = (
  <>
    <span className="text-[#00b2a9]">devsa</span>
    <span className="text-white/50">@</span>
    <span className="text-[#00b2a9]">community</span>
    <span className="text-white/50">:</span>
    <span className="text-[#ef426f]">~/slides</span>
    <span className="text-white/50">$ </span>
  </>
)

function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

export function SlidesTerminal({ decks }: { decks: Deck[] }) {
  const [sel, setSel] = useState(0)
  const deck = decks[sel]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); setSel((s) => Math.min(decks.length - 1, s + 1)) }
      else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
      else if (e.key === "Enter" && decks[sel] && !(e.target instanceof HTMLAnchorElement))
        // A full page load on purpose: a deck is a static HTML file from a route
        // handler, not a Next page, so the client router can't render it.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/slides/${decks[sel].slug}`
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [decks, sel])

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a] font-mono text-[13px] leading-6 text-white/80 shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:text-sm">
      {/* window chrome: the three brand colors where the traffic lights go */}
      <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#00b2a9]" />
        <span className="h-3 w-3 rounded-full bg-[#ef426f]" />
        <span className="h-3 w-3 rounded-full bg-[#ff8200]" />
        <span className="ml-3 truncate text-xs text-white/55">devsa — ~/slides — zsh</span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* the listing */}
        <div className="p-4 md:p-6">
          <p>{PROMPT}ls -lt</p>
          <p className="text-white/50">total {decks.length}</p>
          <ul className="mt-1">
            {decks.map((d, i) => (
              <li key={d.slug}>
                <a
                  href={`/slides/${d.slug}`}
                  onMouseEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  aria-current={i === sel ? "true" : undefined}
                  className={`-mx-2 grid grid-cols-[auto_1fr] gap-x-4 rounded px-2 py-1 outline-none sm:grid-cols-[auto_auto_1fr] ${
                    i === sel ? "bg-[#00b2a9]/15 text-white" : "hover:bg-white/5"
                  }`}
                >
                  <span className="text-white/55">{shortDate(d.date)}</span>
                  <span className="text-white/55">{String(d.slides).padStart(3, " ")} slides</span>
                  <span className="col-span-2 truncate sm:col-span-1">
                    <span className={i === sel ? "text-[#00b2a9]" : "text-[#4d8eff]"}>{d.slug}/</span>
                    <span className="hidden text-white/50 xl:inline">  # {d.title}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {deck && (
            <div className="mt-5">
              <p>
                {PROMPT}cat {deck.slug}/README
              </p>
              <p className="mt-1 text-lg font-bold text-white md:text-xl">{deck.title}</p>
              <p className="text-white/70">{deck.summary}</p>
              <p className="mt-2 text-white/55">
                {deck.where} · {shortDate(deck.date)}
                {deck.keys ? ` · ${deck.keys}` : ""}
              </p>
              <p className="mt-5">
                {PROMPT}
                <a href={`/slides/${deck.slug}`} className="text-white underline decoration-[#00b2a9] underline-offset-4 hover:text-[#00b2a9]">
                  open {deck.slug}
                </a>
                <span aria-hidden className="ml-1 inline-block h-[1.1em] w-[0.6em] translate-y-[3px] animate-pulse bg-white/80" />
              </p>
              <p className="mt-6 text-xs text-white/50">
                ↑↓ select · enter present · in a deck: ← → move, F full screen
                {deck.eventUrl && (
                  <>
                    {" · "}
                    <a href={deck.eventUrl} className="underline underline-offset-4 hover:text-white">event page</a>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* the preview */}
        {deck && (
          <a
            href={`/slides/${deck.slug}`}
            className="group block border-t border-neutral-800 bg-neutral-900/60 p-4 md:p-6 lg:border-l lg:border-t-0"
            aria-label={`Present ${deck.title}`}
          >
            <span className="block text-xs text-white/50">preview — {deck.slug}/cover.jpg</span>
            <span className="mt-3 block overflow-hidden rounded-lg border border-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- a static cover in public/, already sized */}
              <img
                key={deck.slug}
                src={`/slides/${deck.slug}/cover.jpg`}
                alt=""
                width={1280}
                height={720}
                className="block aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </span>
            <span className="mt-3 block text-xs text-white/55 group-hover:text-[#00b2a9]">↵ present</span>
          </a>
        )}
      </div>
    </div>
  )
}
