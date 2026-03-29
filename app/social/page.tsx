"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { toPng } from "html-to-image"
import { ChangelogImage } from "@/components/social/changelog-image"

/* ─── Download helpers ─── */

/** Fetch image via proxy → draw to canvas → return data URL */
async function fetchImageAsDataUrl(src: string): Promise<string> {
  const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(src)}`)
  const blob = await res.blob()
  const isSvg = blob.type.includes("svg") || src.toLowerCase().endsWith(".svg")

  if (isSvg) {
    const objectUrl = URL.createObjectURL(blob)
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const w = img.naturalWidth || 800
        const h = img.naturalHeight || 800
        const cvs = document.createElement("canvas")
        cvs.width = w
        cvs.height = h
        const ctx = cvs.getContext("2d")!
        ctx.drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(objectUrl)
        resolve(cvs.toDataURL("image/png"))
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Failed to load SVG image"))
      }
      img.crossOrigin = "anonymous"
      img.src = objectUrl
    })
    return dataUrl
  }

  const bitmap = await createImageBitmap(blob)
  const cvs = document.createElement("canvas")
  cvs.width = bitmap.width
  cvs.height = bitmap.height
  const ctx = cvs.getContext("2d")!
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  return cvs.toDataURL("image/png")
}

/**
 * Swap all <img> in an element to data URLs (via proxy).
 * Returns a restore function that puts original srcs back.
 */
async function swapImagesToDataUrls(
  element: HTMLElement
): Promise<() => void> {
  const imgs = element.querySelectorAll("img")
  const originals: { img: HTMLImageElement; src: string }[] = []

  await Promise.all(
    Array.from(imgs).map(async (img) => {
      const origSrc = img.getAttribute("src") || ""
      if (!origSrc || origSrc.startsWith("data:")) return

      originals.push({ img, src: origSrc })

      try {
        const dataUrl = await fetchImageAsDataUrl(origSrc)
        img.src = dataUrl
      } catch (e) {
        console.warn("Failed to proxy image:", e)
      }
    })
  )

  return () => {
    for (const { img, src } of originals) {
      img.src = src
    }
  }
}

/* ─── Responsive wrapper — scales fixed-size cards to fit viewport ─── */
function ResponsiveCardWrapper({
  children,
  cardWidth = 1080,
  cardHeight = 1350,
}: {
  children: React.ReactNode
  cardWidth?: number
  cardHeight?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const availableW = containerRef.current.clientWidth
      const availableH = window.innerHeight - 120
      const scaleW = availableW / cardWidth
      const scaleH = availableH / cardHeight
      setScale(Math.min(1, scaleW, scaleH))
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [cardWidth, cardHeight])

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="mx-auto overflow-hidden"
        style={{
          width: cardWidth * scale,
          height: cardHeight * scale,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: cardWidth,
            height: cardHeight,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── Download button ─── */
function DownloadButton({
  cardRef,
  filename,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>
  filename: string
}) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    setDownloading(true)

    let restore: (() => void) | null = null
    try {
      // 1. Swap all <img> to proxied data URLs
      restore = await swapImagesToDataUrls(cardRef.current)

      // 2. Small delay to let the browser re-paint
      await new Promise((r) => setTimeout(r, 100))

      const opts = { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true, skipAutoScale: true }

      // 3. Warm-up call
      await toPng(cardRef.current, opts).catch(() => {})

      // 4. Actual capture
      const dataUrl = await toPng(cardRef.current, opts)

      // 5. Trigger download
      const link = document.createElement("a")
      link.download = `${filename}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Download failed:", err)
    } finally {
      restore?.()
      setDownloading(false)
    }
  }, [cardRef, filename])

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-semibold border border-neutral-700 text-neutral-400 transition-all hover:border-white hover:text-white disabled:opacity-40 disabled:cursor-wait"
    >
      {downloading ? (
        <>
          <svg
            className="animate-spin"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" />
          </svg>
          Exporting…
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PNG
        </>
      )}
    </button>
  )
}

/* ─── Page ─── */
export default function SocialMediaPage() {
  const changelogRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-300 mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <img
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
              alt="DEVSA"
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase">Social Media Assets</h1>
              <p className="text-xs text-neutral-500 font-mono hidden sm:block">
                1080 × 1350 — Internal tool
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="py-12">
        <div className="flex flex-col items-center gap-16">
          {/* Changelog card */}
          <div className="flex flex-col items-center gap-4 w-full px-4">
            <div className="flex items-center gap-4">
              <span
                className="text-neutral-500 uppercase"
                style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.2em" }}
              >
                Changelog
              </span>
              <DownloadButton cardRef={changelogRef} filename="devsa-changelog" />
            </div>
            <ResponsiveCardWrapper>
              <div ref={changelogRef}>
                <ChangelogImage />
              </div>
            </ResponsiveCardWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}