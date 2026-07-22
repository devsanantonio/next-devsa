"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

/**
 * Right-side slide-over drawer for the admin portal. Replaces the old centered
 * pop-out modals so every create/edit surface reads as one system: overlay +
 * animated panel + sticky header, closes on overlay click or Escape.
 *
 * Animations come from `.admin-drawer-panel` / `.admin-drawer-overlay` in
 * globals.css.
 */
export function SlideDrawer({
  open,
  onClose,
  title,
  subtitle,
  widthClass = "max-w-md",
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  widthClass?: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="admin-drawer-overlay absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`admin-drawer-panel absolute inset-y-0 right-0 flex w-full ${widthClass} flex-col overflow-hidden rounded-l-2xl border-l border-neutral-800 bg-neutral-900 shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 px-6 py-5">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
