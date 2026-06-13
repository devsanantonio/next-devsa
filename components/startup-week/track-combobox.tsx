"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { TRACKS, type Track } from "@/data/startup-week"

const triggerClass =
  "flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-left shadow-sm transition-all focus:border-[#ec228d] focus:outline-none focus:ring-2 focus:ring-[#ec228d]/20"

/**
 * Accessible custom combobox for selecting a Startup Week track. Each option
 * shows the track's legend color and audience description. Replaces the native
 * <select> so descriptions can render inline.
 */
export function TrackCombobox({
  value,
  onChange,
  accent = "#ec228d",
  labelId,
}: {
  value: string
  onChange: (name: string) => void
  accent?: string
  /** id of the visible label, wired to the trigger for screen readers. */
  labelId?: string
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])

  const selected = TRACKS.find((t) => t.name === value) ?? null

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [open])

  // Keep the active option in view
  useEffect(() => {
    if (open && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" })
    }
  }, [open, activeIndex])

  const openMenu = () => {
    setActiveIndex(TRACKS.findIndex((t) => t.name === value))
    setOpen(true)
  }

  const select = (t: Track) => {
    onChange(t.name)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (!open) openMenu()
        else setActiveIndex((i) => Math.min(i + 1, TRACKS.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        if (open) setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case "Enter":
      case " ":
        if (open && activeIndex >= 0) {
          e.preventDefault()
          select(TRACKS[activeIndex])
        } else if (!open) {
          e.preventDefault()
          openMenu()
        }
        break
      case "Escape":
        setOpen(false)
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        className={triggerClass}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected ? (
            <>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: selected.color }}
              />
              <span className="truncate text-neutral-900">{selected.name}</span>
            </>
          ) : (
            <span className="text-neutral-400">Choose a track</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Track"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl"
        >
          {TRACKS.map((t, i) => {
            const isSelected = t.name === value
            const isActive = i === activeIndex
            return (
              <li
                key={t.name}
                ref={(el) => {
                  optionRefs.current[i] = el
                }}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => select(t)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg p-2.5 transition-colors",
                  isActive ? "bg-neutral-100" : "hover:bg-neutral-50"
                )}
              >
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      {t.name}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0" style={{ color: accent }} />
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-neutral-500">
                    {t.description}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
