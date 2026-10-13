"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, Download, Link2, Loader2, Send, Share } from "lucide-react"

/**
 * Save or share an event's 1080x1350 graphic (/api/og/event/[slug]/social),
 * from the event page and from each card on the calendar.
 *
 * Two choices rather than one button, because one button could not do both.
 * Handing the share sheet the image together with the event link is right for
 * a text, but iOS only offers "Save Image" when it is given images alone — so
 * the combined share hid the one thing people asked for, and a download link
 * is no substitute on an iPhone, where Safari saves it to Files rather than
 * Photos. "Save image" therefore shares the image alone on iOS (Save Image is
 * then at the top of the sheet) and downloads it everywhere else; "Share…"
 * sends image and link together, where the device can share files at all.
 *
 * The image is fetched when the menu opens (or on mount, with `prefetch`),
 * not when an item is tapped: iOS Safari only opens the share sheet while the
 * tap is still fresh, and waiting on a request first can spend that and fail
 * without a word. Items stay disabled until it has arrived, usually well
 * under a second.
 */
export function ShareImageMenu({
  slug,
  title,
  text,
  url,
  tone = "light",
  size = "sm",
  label = "Share",
  showCopyLink = false,
  prefetch = false,
  className = "",
  buttonClassName = "",
}: {
  slug: string
  title: string
  /** What goes with the image in a share: the event's name and date. */
  text: string
  /** The event page's address, sent with the image and copied by Copy link. */
  url: string
  /** "dark" on the branded calendar cards. */
  tone?: "light" | "dark"
  size?: "sm" | "md"
  label?: string
  showCopyLink?: boolean
  prefetch?: boolean
  /** Extra classes for the wrapper and the button, to size it to a row. */
  className?: string
  buttonClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [canShareFiles, setCanShareFiles] = useState(false)
  const loading = useRef(false)
  const root = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  // Where the menu sits, in viewport pixels, set from the button on open.
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const src = `/api/og/event/${slug}/social`

  const load = () => {
    if (loading.current || file) return
    loading.current = true
    fetch(src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        const f = new File([blob], `${slug}.png`, { type: "image/png" })
        setFile(f)
        setCanShareFiles(typeof navigator.canShare === "function" && navigator.canShare({ files: [f] }))
      })
      .catch(() => setFailed(true))
      .finally(() => {
        loading.current = false
      })
  }

  // Read when it is needed rather than kept in state: the menu only renders
  // after a tap, so this never runs on the server.
  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

  useEffect(() => {
    if (!prefetch) return
    const t = setTimeout(load, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefetch, slug])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (root.current?.contains(t) || menu.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    // Fixed to the viewport, so a scroll would leave it behind; close instead.
    const onScroll = () => setOpen(false)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("touchstart", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("touchstart", onDown)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [open])

  /*
   * Placed against the button but drawn on <body>, so a card's rounded,
   * clipped edge cannot cut it off (it did, from inside the calendar cards),
   * and held on screen: right-aligned to the button where it fits, slid in
   * from either edge where it would not (on a phone it ran off the left),
   * below the button when there is room and above it when not.
   */
  const place = () => {
    const r = root.current?.getBoundingClientRect()
    if (!r) return
    const W = 224
    const H = 170
    const margin = 8
    const left = Math.min(Math.max(r.right - W, margin), window.innerWidth - W - margin)
    const below = r.bottom + 8 + H <= window.innerHeight
    setPos({ left, top: below ? r.bottom + 8 : Math.max(margin, r.top - 8 - H) })
  }

  const download = (f: File) => {
    const href = URL.createObjectURL(f)
    const a = document.createElement("a")
    a.href = href
    a.download = f.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(href), 1000)
  }

  const save = async () => {
    if (!file) return
    if (isIOS() && canShareFiles) {
      try {
        await navigator.share({ files: [file] })
      } catch {
        /* closed the sheet */
      }
    } else {
      download(file)
    }
    setOpen(false)
  }

  const share = async () => {
    if (!file) return
    try {
      await navigator.share({ files: [file], title, text: `${text}\n${url}` })
    } catch {
      /* closed the sheet */
    }
    setOpen(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked; nothing useful to do */
    }
  }

  const dark = tone === "dark"
  const trigger =
    size === "md"
      ? `inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-all ${
          dark ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
        }`
      : `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
          dark ? "border-white/20 bg-white/5 text-white/75 hover:bg-white/10" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`
  const ready = !!file
  const item =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"

  return (
    <div ref={root} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (!open) place()
          setOpen((o) => !o)
          load()
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${trigger} ${buttonClassName}`}
        title="Save or share an image of this event"
      >
        {/* The platform share glyph (a box with an arrow out of it), which
            reads as "share" on sight; the picture-with-a-down-arrow it
            replaced read as "download a photo". */}
        <Share className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden />
        {label}
      </button>

      {open && pos && createPortal(
        <div
          ref={menu}
          role="menu"
          style={{ position: "fixed", left: pos.left, top: pos.top }}
          className="z-[60] w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {failed ? (
            <p className="px-3 py-2.5 text-sm text-gray-600">The image did not load. Try again in a moment.</p>
          ) : (
            <>
              <button type="button" role="menuitem" onClick={save} disabled={!ready} className={item}>
                {ready ? <Download className="h-4 w-4 text-gray-500" /> : <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                {isIOS() ? "Save image" : "Download image"}
              </button>
              {canShareFiles && (
                <button type="button" role="menuitem" onClick={share} disabled={!ready} className={item}>
                  <Send className="h-4 w-4 text-gray-500" />
                  Share…
                </button>
              )}
            </>
          )}
          {showCopyLink && (
            <button type="button" role="menuitem" onClick={copyLink} className={item}>
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4 text-gray-500" />}
              {copied ? "Link copied" : "Copy link"}
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
