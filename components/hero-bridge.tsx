"use client"

import { motion } from "motion/react"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

// Images-only from DevSA conferences — videos removed for performance
const mediaItems = [
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_7186.jpg", alt: "DevSA Community" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_1484.jpg", alt: "DevSA Community Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa8.jpg", alt: "PySanAntonio Conference" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/replay9.jpg", alt: "DevSA Replay Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg", alt: "PySanAntonio Conference" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/replay13.jpg", alt: "DevSA Replay Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/techday2.jpg", alt: "DevSA Tech Day" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.jpg", alt: "PySanAntonio After Party" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/replay7.jpg", alt: "GDG San Antonio" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/techday4.JPG", alt: "DevSA Tech Day" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6429.jpg", alt: "DevSA Community" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_4427.jpg", alt: "DevSA Community Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_4665.jpg", alt: "DevSA Community Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/replay1.JPG", alt: "DevSA Replay Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa5.jpg", alt: "PySanAntonio Conference" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/techday.jpg", alt: "DevSA Tech Day" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/techday5.jpg", alt: "DevSA Tech Day" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/gdg.jpg", alt: "GDG San Antonio Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_3385.jpg", alt: "DevSA Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/gdg4.jpg", alt: "DevSA Replay Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_5061.jpg", alt: "DevSA Community Space" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_2756.jpg", alt: "DevSA Community" },
]


type MediaItem = (typeof mediaItems)[number]

// Split media into columns for the scrolling background
function splitIntoColumns(items: MediaItem[], cols: number): MediaItem[][] {
  const columns: MediaItem[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => columns[i % cols].push(item))
  return columns
}

// Lazy-loaded image card — only loads src when near viewport
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative w-full rounded-xl overflow-hidden aspect-3/4 shrink-0 bg-neutral-900"
    >
      {isVisible && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  )
}

// Pure CSS scrolling column — no JS animation runtime, fully GPU-composited
function ScrollingColumn({
  items,
  direction = "up",
  durationS = 60,
}: {
  items: MediaItem[]
  direction?: "up" | "down"
  durationS?: number
}) {
  // Duplicate for seamless loop
  const doubled = useMemo(() => [...items, ...items], [items])

  return (
    <div className="relative overflow-hidden h-full flex-1">
      <div
        className="flex flex-col gap-3 md:gap-4 will-change-transform"
        style={{
          animation: `hero-scroll-${direction} ${durationS}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <LazyImage key={`${item.src}-${i}`} src={item.src} alt={item.alt} />
        ))}
      </div>
    </div>
  )
}

export function HeroBridge() {
  const [columnCount, setColumnCount] = useState(3)

  // Responsive column count: 3 on mobile, 4 on tablet, 5 on desktop
  useEffect(() => {
    function update() {
      const w = window.innerWidth
      setColumnCount(w < 640 ? 3 : w < 1024 ? 4 : 5)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const columns = useMemo(
    () => splitIntoColumns(mediaItems, columnCount),
    [columnCount]
  )

  return (
    <section
      id="hero-bridge"
      className="w-full relative min-h-dvh flex items-center justify-start overflow-hidden bg-neutral-950"
      data-bg-type="dark"
    >
      {/* Inject CSS keyframes once */}
      <style>{`
        @keyframes hero-scroll-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes hero-scroll-down {
          from { transform: translateY(-50%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      {/* Hidden H1 for SEO */}
      <h1 className="sr-only">
        Your Direct Connection to the Tech Community
      </h1>

      {/* 3D Photo Carousel Background */}
      <div
        className="absolute inset-0 z-0"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-[-10%] flex gap-3 md:gap-4 px-2 md:px-4"
          style={{
            transform: "rotateX(8deg) rotateY(-6deg) rotateZ(2deg) scale(1.2)",
            transformOrigin: "center center",
          }}
        >
          {columns.map((col, i) => (
            <ScrollingColumn
              key={`${columnCount}-${i}`}
              items={col}
              direction={i % 2 === 0 ? "up" : "down"}
              durationS={55 + i * 10}
            />
          ))}
        </div>

        {/* Gradient overlays — heavy left for text readability, fading right to reveal images */}
        <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/85 to-transparent z-10" />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-950/70 via-transparent to-neutral-950/70 z-10" />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.15) 65%, transparent 100%)",
          }}
        />
      </div>

      {/* Foreground hero content — left aligned, capped at 50% */}
      <div className="relative z-20 w-full md:max-w-[50%] flex flex-col items-start text-left pl-6 sm:pl-10 md:pl-16 lg:pl-20 py-20 md:py-28">
        {/* Eyebrow label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-amber-400 text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-5 md:mb-6"
        >
          Building Together
        </motion.p>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="font-black text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.08] sm:leading-[1.06] md:leading-[1.04]"
        >
          Find your people.<br />Build your future.
        </motion.h2>

        {/* Animated divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-12 md:w-16 h-0.75 mt-6 md:mt-8 mb-6 md:mb-8 bg-linear-to-r from-[#f59e0b] via-[#fbbf24] to-[#fcd34d] rounded-full origin-left"
        />

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl lg:text-2xl text-neutral-300 leading-[1.65] md:leading-[1.6] font-light text-balance"
        >
          DEVSA bridges the gap between passionate builders, local partners, and the growing tech ecosystem in&nbsp;San&nbsp;Antonio.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 md:mt-9 flex flex-col sm:flex-row items-start gap-3 sm:gap-3.5"
        >
          <Link
            href="/coworking-space"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-linear-to-r from-[#f59e0b] via-[#fbbf24] to-[#fcd34d] text-neutral-950 font-bold text-sm md:text-base tracking-tight shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            Coworking Space
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/events"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full border border-neutral-500/40 bg-white/5 backdrop-blur-sm text-white font-semibold text-sm md:text-base tracking-tight hover:bg-white/10 hover:border-neutral-400/60 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            Events Calendar
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
