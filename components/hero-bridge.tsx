"use client"

import { motion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

// Event photos from DEVSA conferences. These are pre-cropped to 3:4 and resized
// to 800x1067 in public/hero/ — the cards render at ~260 CSS px, so the camera
// originals on S3 (up to 6124x4082 / 9 MB each) were ~35 MB of wasted payload.
// Regenerate with the same crop if you swap one in, or the aspect will shift.
const mediaItems = [
  { src: "/hero/pysa.webp", alt: "PySanAntonio After Party" },
  { src: "/hero/utsa.webp", alt: "DevSA UTSA event" },
  { src: "/hero/morehuman-9743.webp", alt: "More Human Event" },
  { src: "/hero/morehuman-9580.webp", alt: "More Human Event" },
  { src: "/hero/replay13.webp", alt: "DevSA Replay Event" },
  { src: "/hero/replay7.webp", alt: "GDG San Antonio" },
  { src: "/hero/techday2.webp", alt: "DevSA Tech Day" },
  { src: "/hero/shebuilds.webp", alt: "SheBuilds Event" },
  { src: "/hero/morehuman-9715.webp", alt: "More Human Event" },
  { src: "/hero/techday5.webp", alt: "DevSA Tech Day" },
  { src: "/hero/ltai-talk.webp", alt: "A speaker walking through a workflow at a DEVSA talk" },
  { src: "/hero/replay9.webp", alt: "Andrea from Geeks fam" },
]

// Columns are full-bleed behind the copy, so their top cards are in-viewport on
// load. Eager-load the first card of each column to paint the gallery quickly;
// everything below it lazy-loads as the animation brings it around.
const EAGER_PER_COLUMN = 1

type MediaItem = (typeof mediaItems)[number]

// Split media into columns for the scrolling background
function splitIntoColumns(items: MediaItem[], cols: number): MediaItem[][] {
  const columns: MediaItem[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => columns[i % cols].push(item))
  return columns
}

// Decorative background card. alt is empty so screen readers skip the gallery —
// the section's meaning lives in the headline, not the photos.
//
// No IntersectionObserver here on purpose: the columns sit behind the copy at
// inset-0, so everything is already in-viewport on load and a manual observer
// only added work without deferring anything. Native lazy loading covers the
// off-screen tail below the fold.
function MediaCard({ src, eager }: { src: string; eager: boolean }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden aspect-3/4 shrink-0 bg-neutral-900">
      <Image
        src={src}
        alt=""
        width={800}
        height={1067}
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
        priority={eager}
        loading={eager ? undefined : "lazy"}
        decoding="async"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

// Pure CSS scrolling column — no JS animation runtime, fully GPU-composited
function ScrollingColumn({
  items,
  direction = "up",
  durationS = 60,
  eagerCount = 0,
}: {
  items: MediaItem[]
  direction?: "up" | "down"
  durationS?: number
  eagerCount?: number
}) {
  // Duplicate for seamless loop. Both halves reference the same files, so the
  // duplicate costs DOM nodes but no extra network.
  const doubled = useMemo(() => [...items, ...items], [items])

  return (
    <div className="relative overflow-hidden h-full flex-1">
      <div
        className="hero-scroll-column flex flex-col gap-3 md:gap-4 will-change-transform"
        style={{
          animation: `hero-scroll-${direction} ${durationS}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <MediaCard key={`${item.src}-${i}`} src={item.src} eager={i < eagerCount} />
        ))}
      </div>
    </div>
  )
}

export function HeroBridge() {
  const [columnCount, setColumnCount] = useState(3)
  const [isMobile, setIsMobile] = useState(false)
  // Client-only shuffled copy of the media so mobile shows a different image
  // order than desktop. Defaults to the source order for SSR/first paint.
  const [shuffledMedia, setShuffledMedia] = useState<MediaItem[]>(mediaItems)

  // Responsive column count: 3 on mobile, 4 on tablet, 5 on desktop
  useEffect(() => {
    function update() {
      const w = window.innerWidth
      setColumnCount(w < 640 ? 3 : w < 1024 ? 4 : 5)
      setIsMobile(w < 768)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // Shuffle once on mount (used for the mobile ordering only)
  useEffect(() => {
    const arr = [...mediaItems]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setShuffledMedia(arr)
  }, [])

  const columns = useMemo(
    () => splitIntoColumns(isMobile ? shuffledMedia : mediaItems, columnCount),
    [isMobile, shuffledMedia, columnCount]
  )

  return (
    <section
      id="hero-bridge"
      className="relative w-full min-h-dvh flex flex-col md:justify-center md:items-start overflow-hidden bg-neutral-950"
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
        @media (prefers-reduced-motion: reduce) {
          .hero-scroll-column {
            animation: none !important;
          }
        }
      `}</style>

      {/* Headline — below the images on mobile; leads the left column on desktop */}
      <div className="order-2 md:order-0 relative z-20 w-full md:max-w-[55%] px-6 sm:px-10 md:px-16 lg:px-20 pt-8 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-balance font-sans text-white font-black tracking-[-0.02em] leading-[1.05] md:leading-[1.1] text-[2.75rem] md:text-5xl lg:text-6xl xl:text-7xl">
            Find Your People.{" "}
            <span className="text-white/65 font-normal italic">Build Your</span>{" "}
            Future.
          </h1>
        </motion.div>
      </div>

      {/* 3D Photo Carousel — leads on mobile (full-bleed, images first);
          full-bleed behind the text on desktop. Explicit mobile height because
          the inner columns are absolutely positioned (zero intrinsic height). */}
      <div
        className="order-1 md:order-0 relative z-0 w-full h-[48dvh] min-h-85 overflow-hidden md:h-auto md:min-h-0 md:overflow-visible md:absolute md:inset-0"
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
              eagerCount={EAGER_PER_COLUMN}
            />
          ))}
        </div>

        {/* Desktop gradients — heavy left for text readability, fading right to reveal images */}
        <div className="hidden md:block absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/85 to-transparent z-10" />
        <div className="hidden md:block absolute inset-0 bg-linear-to-b from-neutral-950/70 via-transparent to-neutral-950/70 z-10" />
        <div
          className="hidden md:block absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.15) 65%, transparent 100%)",
          }}
        />

        {/* Mobile fades — blend the gallery into the text above and below */}
        <div className="md:hidden absolute inset-x-0 top-0 h-20 bg-linear-to-b from-neutral-950 to-transparent z-10" />
        <div className="md:hidden absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-neutral-950 to-transparent z-10" />
      </div>

      {/* Body copy + CTAs — after the images on mobile; continues the left column on desktop */}
      <div className="order-3 md:order-0 relative z-20 w-full md:max-w-[55%] px-6 sm:px-10 md:px-16 lg:px-20 pt-8 pb-20 md:pt-8 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-7 md:space-y-8"
        >
          <div className="space-y-4 md:space-y-5 max-w-2xl md:max-w-xl">
            <p className="md:text-pretty text-lg md:text-2xl text-white/75 leading-relaxed md:leading-[1.45] font-normal">
              DEVSA bridges the gap between{" "}
              <strong className="font-semibold text-white">passionate builders</strong>,
              local partners, and the growing tech ecosystem in San&nbsp;Antonio.
            </p>

            <p className="md:text-pretty text-base md:text-lg text-white/60 md:text-white/60 leading-relaxed">
              Discover{" "}
              <span className="font-medium text-white/80 md:text-white/85">communities</span>,{" "}
              <span className="font-medium text-white/80 md:text-white/85">events</span>, and{" "}
              <span className="font-medium text-white/80 md:text-white/85">resources</span>{" "}
              — all in one place.
            </p>
          </div>

          {/* CTA Buttons — full-width on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
            <Link
              href="/buildingtogether"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:py-3 rounded-lg bg-white text-gray-900 font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-100"
            >
              Explore Our Platform
            </Link>
            <Link
              href="/events"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg border border-white/20 bg-white/5 text-white font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-white/10 hover:border-white/30"
            >
              Events Calendar
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
