"use client"

import { motion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

// Event photos from DEVSA conferences and community events. These are
// pre-cropped to 3:4 and resized to 800x1067 in public/hero/ — the cards render
// at ~260 CSS px, so the camera originals (up to 6941x4627 / 22 MB each) were
// tens of megabytes of wasted payload. Regenerate with the same crop if you
// swap one in, or the aspect will shift.
//
// Deliberately a mix of two eras and two kinds of room.
//
// The `sastw-*` frames are the 2026 Startup + Tech Week — stage lighting, a
// podium, a full house, the week's own signage. They are what DEVSA runs. The
// older frames are meetups, workshops and group photos from the specialty
// groups, which is what DEVSA hosts and points people to. Showing only the
// first would make this look like a conference company; showing only the second
// would hide the four conferences the page goes on to name. The hero is the one
// place both have to be true at once.
//
// Interleaved rather than grouped, because splitIntoColumns below assigns by
// `i % cols` — a block of new frames followed by a block of old ones would put
// one era in each column.
const mediaItems = [
  { src: "/hero/shebuilds.webp", alt: "SheBuilds Event" },
  { src: "/hero/sastw-room-full.webp", alt: "A full room at long tables during a Startup + Tech Week session" },
  { src: "/hero/replay7.webp", alt: "GDG San Antonio" },
  { src: "/hero/sastw-shared-stories.webp", alt: "A speaker presenting beside a Shared Stories title card" },
  { src: "/hero/techday2.webp", alt: "DevSA Tech Day" },
  { src: "/hero/sastw-the-reading.webp", alt: "A speaker at the podium for The Reading, on AI and quantum" },
  { src: "/hero/utsa.webp", alt: "DevSA UTSA event" },
  { src: "/hero/sastw-room-hand.webp", alt: "A raised hand in a packed session room during Startup + Tech Week" },
  { src: "/hero/ltai-talk.webp", alt: "A speaker walking through a workflow at a DEVSA talk" },
  { src: "/hero/sastw-story-show.webp", alt: "A speaker mid-talk on a darkened stage" },
  { src: "/hero/replay9.webp", alt: "Andrea from Geeks fam" },
  { src: "/hero/sastw-room-tables.webp", alt: "Attendees at long tables mid-session, the room full behind them" },
  { src: "/hero/morehuman-9743.webp", alt: "More Human Event" },
  { src: "/hero/sastw-lounge.webp", alt: "Attendees seated together in a lounge between sessions" },
  { src: "/hero/sastw-workshop.webp", alt: "A hands-on workshop session with attendees at laptops" },
  { src: "/hero/replay13.webp", alt: "DevSA Replay Event" },
  { src: "/hero/sastw-stage-wide.webp", alt: "A speaker on stage with the room's screens behind them" },
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
      <div className="order-2 md:order-0 relative z-20 w-full md:max-w-[55%] page-inset-left pr-6 sm:pr-10 md:pr-16 lg:pr-20 pt-8 md:pt-0">
        <motion.div
          initial={{ y: 20 }}
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
      <div className="order-3 md:order-0 relative z-20 w-full md:max-w-[55%] page-inset-left pr-6 sm:pr-10 md:pr-16 lg:pr-20 pt-8 pb-20 md:pt-8 md:pb-0">
        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-7 md:space-y-8"
        >
          <div className="space-y-4 md:space-y-5 max-w-[96rem] md:max-w-7xl">
            <p className="md:text-pretty text-lg md:text-2xl text-white/75 leading-relaxed md:leading-[1.45] font-normal">
              DEVSA bridges the gap between{" "}
              <strong className="font-semibold text-white">passionate builders</strong>,
              local partners, and the growing tech ecosystem in San&nbsp;Antonio.
            </p>

            {/* "Discover communities, events, and resources — all in one
                place" was the vaguest line on the site. Three abstract nouns
                that could describe any community org anywhere, in the position
                where a reader decides whether this is for them.
          
                Named verticals do that job instead. Somebody does not think of
                themselves as looking for a "community"; they think Python, or
                Linux, or agents. The twelve here are the same ones the For
                Builders lane names, and each is backed by a live group — see
                the note in components/audience-lanes.tsx.
          
                The second sentence is the claim the site makes nowhere else:
                the groups keep their own channels, those channels do not reach
                the same people, and this is the one that is always current. */}
            <p className="md:text-pretty text-base md:text-lg text-white/70 leading-relaxed">
              <span className="font-medium text-white/85">
                Python, Linux, .NET, AI, agents, game dev, UX, design, data,
                security, AWS, Google
              </span>{" "}
              — 20+ specialty groups, one calendar. If it&apos;s happening in
              San&nbsp;Antonio tech, it&apos;s here.
            </p>
          </div>

          {/* CTA Buttons — full-width on mobile, inline on desktop.

              The calendar is the filled button. It used to be second, behind
              "Explore Our Platform", which inverted the site's own ranking:
              the calendar is what every other entry point leads with, it is
              the concrete thing a first-time visitor came for, and it is the
              page this site is most used for. A label naming the destination
              also beats one naming the abstraction — "Explore Our Platform"
              described no page, and was not even what /buildingtogether is
              called anywhere else in the nav. */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
            <Link
              href="/events"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg bg-white text-gray-900 font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-100"
            >
              Community Calendar
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/buildingtogether"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:py-3 rounded-lg border border-white/20 bg-white/5 text-white font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-white/10 hover:border-white/30"
            >
              Partners &amp; Communities
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
