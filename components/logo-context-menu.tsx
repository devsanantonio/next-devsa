"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"

interface LogoContextMenuProps {
  children: React.ReactNode
}

export function LogoContextMenu({ children }: LogoContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setIsOpen(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleClick = () => setIsOpen(false)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("click", handleClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("click", handleClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const adjustedX = position.x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 8 : position.x
    const adjustedY = position.y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 8 : position.y
    if (adjustedX !== position.x || adjustedY !== position.y) {
      setPosition({ x: adjustedX, y: adjustedY })
    }
  }, [isOpen, position.x, position.y])

  const handleDownload = async (url: string, filename: string) => {
    try {
      const isExternal = url.startsWith("http")
      const fetchUrl = isExternal
        ? `/api/image-proxy?url=${encodeURIComponent(url)}&download=${encodeURIComponent(filename)}`
        : url
      const response = await fetch(fetchUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, "_blank")
    }
    setIsOpen(false)
  }

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-100 min-w-55 bg-neutral-900 border border-neutral-700/50 rounded-xl shadow-2xl shadow-black/50 py-1.5 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: position.x, top: position.y }}
          role="menu"
          aria-label="Logo download options"
        >
          <div className="px-3 py-2 border-b border-neutral-800">
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Original Logo</p>
          </div>
          <button
            onClick={() => handleDownload("https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg", "devsa-logo.svg")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            role="menuitem"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download SVG
          </button>
          <button
            onClick={() => handleDownload("https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.png", "devsa-logo.png")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            role="menuitem"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PNG
          </button>

          <div className="px-3 py-2 border-y border-neutral-800">
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Alternative Logo</p>
          </div>
          <button
            onClick={() => handleDownload("/branding/devsa-alt-logo.svg", "devsa-alt-logo.svg")}

            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            role="menuitem"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download SVG
          </button>
          <button
            onClick={() => handleDownload("https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-altlogo.png", "devsa-alt-logo.png")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            role="menuitem"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PNG
          </button>

          <div className="border-t border-neutral-800 mt-1 pt-1">
            <Link
              href="/branding"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#ef426f] hover:bg-[#ef426f]/10 hover:text-[#ef426f] transition-colors rounded-b-xl"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
              Branding Kit
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
