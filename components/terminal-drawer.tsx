"use client"

import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { useEffect } from "react"

interface TerminalDrawerProps {
  isOpen: boolean
  onClose: () => void
  pathname?: string
}

export function TerminalDrawer({
  isOpen,
  onClose,
  pathname = "",
}: TerminalDrawerProps) {
  // Body scroll lock + Escape key while drawer is open
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [isOpen, onClose])

  const linkClass = (active: boolean) =>
    `block px-5 py-4 transition-colors duration-150 border-b border-white/5 text-[14px] font-normal leading-normal text-left ${
      active
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/5 hover:text-white"
    }`

  const socialIconClass =
    "inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-colors"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[85vw] sm:w-80 md:w-96 bg-black border-l border-white/10 shadow-2xl lg:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Terminal Header */}
            <div className="bg-gray-900 px-4 py-3 border-b border-white/10 font-mono shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 bg-[#00b2a9] rounded-full" />
                    <div className="w-2.5 h-2.5 bg-[#ef426f] rounded-full" />
                    <div className="w-2.5 h-2.5 bg-[#ff8200] rounded-full" />
                  </div>
                  <span className="text-[#ef426f] text-xs font-medium leading-none">
                    builder@devsa.community
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors p-1 -mr-1"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/buildingtogether"
                  onClick={onClose}
                  className={linkClass(pathname === "/buildingtogether")}
                >
                  <span className="text-[#ef426f] mr-2">{">"}</span>
                  Building Together
                </Link>
                <Link
                  href="/coworking-space"
                  onClick={onClose}
                  className={linkClass(pathname === "/coworking-space")}
                >
                  <span className="text-[#ef426f] mr-2">{">"}</span>
                  Coworking Space
                </Link>
                <Link
                  href="/events"
                  onClick={onClose}
                  className={linkClass(pathname === "/events")}
                >
                  <span className="text-[#ef426f] mr-2">{">"}</span>
                  Community Calendar
                </Link>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className={`${linkClass(pathname.startsWith("/shop"))} flex items-center gap-2`}
                >
                  <span className="text-[#ef426f]">{">"}</span>
                  Shop
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                    New
                  </span>
                </Link>
              </div>

              {/* Donate CTA */}
              <div className="px-5 py-4 border-t border-white/5">
                <Link
                  href="/buildingtogether#donate"
                  onClick={onClose}
                  className="flex items-center justify-center w-full rounded-lg bg-[#ef426f] hover:bg-[#d93a62] text-white font-semibold py-3 text-sm transition-colors"
                >
                  Support DEVSA
                </Link>
                <p className="mt-2.5 text-[11px] text-white/40 text-center leading-relaxed">
                  A 501(c)(3) tech education nonprofit.
                </p>
              </div>

              {/* Social Connection */}
              <div className="px-5 py-5 border-t border-white/5">
                <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em] mb-3">
                  Stay Connected
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <a
                    href="https://discord.gg/cvHHzThrEw"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Discord"
                    className={`${socialIconClass} hover:text-[#5865F2]`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/devsa"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className={`${socialIconClass} hover:text-[#0A66C2]`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/devsatx"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className={`${socialIconClass} hover:text-white`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/devsatx/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={`${socialIconClass} hover:text-[#E1306C]`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/devsatx"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className={`${socialIconClass} hover:text-[#1877F2]`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@devsatx"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className={`${socialIconClass} hover:text-[#FF0000]`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Brand close — tagline + cursor */}
            <div className="shrink-0 border-t border-white/10 bg-gray-900/50 px-5 py-5 font-mono">
              <p className="text-white/70 text-xs leading-normal mb-2">
                <span className="text-[#ef426f]">$</span> Find Your People.
                Build Your Future.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#ef426f]">
                <span>$</span>
                <span
                  className="inline-block w-1.5 h-3 bg-[#ef426f] animate-pulse"
                  aria-hidden="true"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
