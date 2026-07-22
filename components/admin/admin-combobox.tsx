"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AdminComboboxOption {
  value: string
  label: string
  /** Optional trailing count shown muted on the right of each row. */
  count?: number
}

/**
 * Dark-themed, accessible combobox for the admin portal. Mirrors the pattern of
 * the public TrackCombobox but styled to the admin surface (neutral-900 / pink
 * #ef426f accent) so every dropdown in the portal reads as one system.
 *
 * Keyboard: ArrowUp/Down to move, Enter/Space to select, Escape to close.
 */
export function AdminCombobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  buttonClassName,
  accent = "#ef426f",
}: {
  options: AdminComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  buttonClassName?: string
  accent?: string
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])

  const selected = options.find((o) => o.value === value) ?? null

  useEffect(() => {
    if (!open) return
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [open])

  useEffect(() => {
    if (open && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" })
    }
  }, [open, activeIndex])

  const openMenu = () => {
    setActiveIndex(options.findIndex((o) => o.value === value))
    setOpen(true)
  }

  const select = (opt: AdminComboboxOption) => {
    onChange(opt.value)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (!open) openMenu()
        else setActiveIndex((i) => Math.min(i + 1, options.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        if (open) setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case "Enter":
      case " ":
        if (open && activeIndex >= 0) {
          e.preventDefault()
          select(options[activeIndex])
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
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-left text-sm text-white transition-colors focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20",
          buttonClassName
        )}
      >
        <span className={cn("truncate", !selected && "text-neutral-500")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 max-h-72 w-full min-w-56 overflow-auto rounded-xl border border-neutral-700 bg-neutral-800 p-1.5 shadow-xl"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            const isActive = i === activeIndex
            return (
              <li
                key={opt.value}
                ref={(el) => {
                  optionRefs.current[i] = el
                }}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => select(opt)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-neutral-700/70" : "hover:bg-neutral-700/40",
                  isSelected ? "text-white" : "text-neutral-300"
                )}
              >
                <span className="flex-1 truncate">{opt.label}</span>
                {typeof opt.count === "number" && (
                  <span className="text-xs tabular-nums text-neutral-500">{opt.count}</span>
                )}
                {isSelected && <Check className="h-4 w-4 shrink-0" style={{ color: accent }} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
