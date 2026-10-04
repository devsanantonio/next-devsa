"use client"

import * as React from "react"

/**
 * A small mono chip that trails the cursor across a logo, naming what is under
 * it. Ported from sasw-geekdom/next-sasw, where one copy is shared by the
 * sponsor wall and the PySanAntonio co-brand row so the two cannot drift.
 *
 * Why it works: a row of marks is the one place on a page where the reader is
 * most likely to recognize none of them. A chip that names the thing under the
 * pointer answers that without a caption under every logo, which is the
 * alternative and which turns a clean row into a table.
 *
 * The chip is positioned by writing straight to the DOM rather than through
 * state. A mousemove handler that re-renders on every frame makes the trailing
 * motion stutter — the same reasoning behind the cipher field's timer.
 *
 * Decorative by design: the name it shows is already the link's accessible
 * name, so announcing it again would only add noise for a screen reader.
 */

/** Resting spot — keyboard focus and first paint. Centered under the mark. */
const CHIP_HOME = {
  left: "50%",
  top: "calc(100% + 6px)",
  transform: "translateX(-50%)",
} as const

export function useProbeChip() {
  const chipRef = React.useRef<HTMLSpanElement>(null)

  function onMouseMove(e: React.MouseEvent) {
    const chip = chipRef.current
    if (!chip) return
    const r = e.currentTarget.getBoundingClientRect()
    chip.style.left = `${e.clientX - r.left + 14}px`
    chip.style.top = `${e.clientY - r.top + 18}px`
    chip.style.transform = "none"
  }

  function onMouseLeave() {
    const chip = chipRef.current
    if (!chip) return
    chip.style.left = CHIP_HOME.left
    chip.style.top = CHIP_HOME.top
    chip.style.transform = CHIP_HOME.transform
  }

  /** Spread onto the element the cursor moves over; it needs `group relative`. */
  return { chipRef, probeProps: { onMouseMove, onMouseLeave } }
}

/**
 * `whitespace-nowrap` means a long name can reach past a narrow cell even while
 * invisible, so the containing section wants `overflow-x-clip` — without one a
 * wide chip can push a horizontal scrollbar onto the page at small widths.
 *
 * `accent` rather than a fixed color: next-sasw's is the week's magenta, and
 * here each activation carries its own.
 */
export function ProbeChip({
  chipRef,
  accent,
  children,
}: {
  chipRef: React.RefObject<HTMLSpanElement | null>
  accent: string
  children: React.ReactNode
}) {
  return (
    <span
      ref={chipRef}
      aria-hidden="true"
      style={CHIP_HOME}
      className="pointer-events-none absolute z-20 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <span className="flex items-center gap-2 rounded-sm border border-white/15 bg-black/90 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80 shadow-lg shadow-black/50">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5"
          style={{ backgroundColor: accent }}
        />
        {children}
      </span>
    </span>
  )
}

/**
 * One org's mark in a "powered by" row, with the probe chip attached.
 *
 * A mark with no home page renders unlinked rather than as a dead anchor.
 *
 * Plain `img`: several small marks on one row, some of them SVG, and routing
 * each through next/image costs more than it saves.
 */
export function OrganizerLogo({
  org,
  accent,
}: {
  org: {
    name: string
    logo: string
    heightClass: string
    href?: string
  }
  accent: string
}) {
  const { chipRef, probeProps } = useProbeChip()

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={org.logo}
      alt={org.name}
      className={`w-auto object-contain ${org.heightClass}`}
    />
  )

  if (!org.href) return <span className="block opacity-85">{img}</span>

  const external = org.href.startsWith("http")

  return (
    <a
      href={org.href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...probeProps}
      className="group relative block opacity-85 transition-opacity duration-200 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
    >
      {img}
      <ProbeChip chipRef={chipRef} accent={accent}>
        {org.name}
      </ProbeChip>
    </a>
  )
}
