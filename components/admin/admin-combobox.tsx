"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AdminComboboxOption {
  value: string
  label: string
  /** Optional trailing count shown muted on the right of each row. */
  count?: number
  /**
   * Optional section heading. Options carrying the same `group` are rendered
   * under one label; a heading appears each time the value changes, so keep
   * grouped options adjacent in the array. Omit it and the list stays flat —
   * which is what every admin dropdown does.
   */
  group?: string
}

/**
 * Accessible combobox, styled to the DEVSA pink (#ef426f) accent so every
 * dropdown in the app reads as one system.
 *
 * `variant="dark"` (the default) is the admin portal's neutral-800 surface.
 * `variant="light"` is the same control on a white page — used by the public
 * /signin access request form, which is why this lives on more than the admin
 * routes despite the name.
 *
 * Keyboard: ArrowUp/Down to move, Enter/Space to select, Escape to close.
 *
 * `floating` is for a combobox inside a DataTable row. The table scrolls
 * sideways (overflow-x-auto), which clips everything that overflows it, so an
 * ordinary dropdown on the last rows was cut off. Floating, the menu is
 * positioned against the window instead, opens upward when there isn't room
 * below, and closes on scroll or resize rather than drifting off its button.
 */
export function AdminCombobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  buttonClassName,
  accent = "#ef426f",
  variant = "dark",
  ariaLabelledby,
  ariaLabel,
  floating = false,
}: {
  options: AdminComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  buttonClassName?: string
  accent?: string
  variant?: "dark" | "light"
  /** Id of a visible label, so the control is announced with its name. */
  ariaLabelledby?: string
  /** A name for the control when there is no visible label to point at. */
  ariaLabel?: string
  /** Position the menu against the window: for a combobox inside a scrolling table. */
  floating?: boolean
}) {
  const isLight = variant === "light"
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | undefined>(undefined)

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

  // Floating: close on any scroll or resize, since a fixed menu wouldn't follow its button.
  useEffect(() => {
    if (!open || !floating) return
    const close = () => setOpen(false)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => {
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [open, floating])

  const openMenu = () => {
    setActiveIndex(options.findIndex((o) => o.value === value))
    if (floating && rootRef.current) {
      const r = rootRef.current.getBoundingClientRect()
      const width = Math.max(r.width, 224) // min-w-56
      const height = Math.min(options.length * 40 + 16, 288) // rows + padding, capped at max-h-72
      const below = window.innerHeight - r.bottom
      const up = below < height + 16 && r.top > below
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8))
      setMenuStyle({
        position: "fixed",
        left,
        width,
        ...(up ? { bottom: window.innerHeight - r.top + 8 } : { top: r.bottom + 8 }),
      })
    }
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
        aria-labelledby={ariaLabelledby}
        aria-label={ariaLabel}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20",
          isLight
            ? "border-gray-300 bg-white text-gray-900"
            : "border-neutral-700 bg-neutral-800 text-white",
          buttonClassName
        )}
      >
        <span
          className={cn(
            "truncate",
            !selected && (isLight ? "text-gray-400" : "text-neutral-500")
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            isLight ? "text-gray-400" : "text-neutral-400",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          style={floating ? menuStyle : undefined}
          className={cn(
            "z-50 max-h-72 overflow-auto rounded-xl border p-1.5 shadow-xl",
            !floating && "absolute right-0 mt-2 w-full min-w-56",
            isLight ? "border-gray-200 bg-white" : "border-neutral-700 bg-neutral-800"
          )}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            const isActive = i === activeIndex
            // Heading rows are presentational, so they sit outside the option
            // indices the keyboard handler walks.
            const heading =
              opt.group && opt.group !== options[i - 1]?.group ? opt.group : null
            return (
              <Fragment key={opt.value}>
                {heading && (
                  <li
                    role="presentation"
                    className={cn(
                      "px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
                      isLight ? "text-gray-400" : "text-neutral-500"
                    )}
                  >
                    {heading}
                  </li>
                )}
                <li
                  ref={(el) => {
                    optionRefs.current[i] = el
                  }}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => select(opt)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isLight
                      ? isActive
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                      : isActive
                        ? "bg-neutral-700/70"
                        : "hover:bg-neutral-700/40",
                    isLight
                      ? isSelected
                        ? "text-gray-900"
                        : "text-gray-600"
                      : isSelected
                        ? "text-white"
                        : "text-neutral-300"
                  )}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {typeof opt.count === "number" && (
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        isLight ? "text-gray-400" : "text-neutral-500"
                      )}
                    >
                      {opt.count}
                    </span>
                  )}
                  {isSelected && <Check className="h-4 w-4 shrink-0" style={{ color: accent }} />}
                </li>
              </Fragment>
            )
          })}
        </ul>
      )}
    </div>
  )
}
