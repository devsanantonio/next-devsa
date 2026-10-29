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
// Three of the sastw frames are community organizers rather than attendees —
// the PyLadies organizer at the sticker-covered laptop, the Unreal Engine SA
// organizer among the group listening, and the ACM-UTSA and RowdyHacks
// president on stage, and an AI engineering director who has spoken at More
// Human Than Human. That is the claim HowWeHelp makes on /buildingtogether,
// "from student organizations through to working professionals", with faces on
// it. The alt text stays descriptive rather than naming roles, because a role
// is not something a screen reader user can see in the frame.
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
  { src: "/hero/shebuilds.webp", alt: "A hands-on build session at SheBuilds, DEVSA's International Women's Day pop-up with Lovable" },
  { src: "/hero/sastw-room-full.webp", alt: "A full room at long tables during a Startup + Tech Week session" },
  { src: "/hero/replay7.webp", alt: "GDG San Antonio" },
  { src: "/hero/sastw-stickers.webp", alt: "An attendee at PySanAntonio working at a laptop covered in Python community stickers" },
  { src: "/hero/sastw-shared-stories.webp", alt: "A speaker presenting beside a Shared Stories title card" },
  { src: "/hero/techday2.webp", alt: "DevSA Tech Day" },
  { src: "/hero/sastw-talk-stage.webp", alt: "A speaker mid-talk on the Startup + Tech Week stage, slides behind them" },
  { src: "/hero/sastw-the-reading.webp", alt: "A speaker at the podium for The Reading, on AI and quantum" },
  { src: "/hero/utsa.webp", alt: "DevSA UTSA event" },
  { src: "/hero/sastw-student-stage.webp", alt: "A speaker on the Startup + Tech Week stage, microphone in hand" },
  { src: "/hero/sastw-room-hand.webp", alt: "A raised hand in a packed session room during Startup + Tech Week" },
  { src: "/hero/ltai-talk.webp", alt: "A speaker walking through a workflow at a DEVSA talk" },
  { src: "/hero/sastw-speaker-point.webp", alt: "A speaker gesturing to the room during a Startup + Tech Week session" },
  { src: "/hero/sastw-story-show.webp", alt: "A speaker mid-talk on a darkened stage" },
  { src: "/hero/replay9.webp", alt: "Andrea from Geeks fam" },
  { src: "/hero/sastw-listening.webp", alt: "Attendees listening at the back of a PySanAntonio session" },
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

interface HeroEvent {
  title: string
  slug: string
  date: string
  communityName?: string
}

/**
 * The next event on the calendar, under the buttons — the proof that the
 * calendar the hero points at is alive. Fetched from /api/events at request
 * time like every other public surface, so an admin's add or delete shows on
 * the next load. Renders nothing until it has an event, and nothing at all if
 * there is none upcoming, rather than a placeholder.
 *
 * The date is formatted after the fetch, in the browser, so there is no
 * server/client difference for hydration to trip on; America/Chicago because
 * every event is in San Antonio, wherever the reader is.
 */
function NextUp() {
  const [next, setNext] = useState<HeroEvent | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d: { events?: HeroEvent[] }) => {
        if (cancelled) return
        const now = Date.now()
        const upcoming = (d.events || []).find((e) => e.slug && new Date(e.date).getTime() > now)
        setNext(upcoming ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // The slot is always rendered at a fixed one-line height, and the event
  // fades into it. The hero's copy is vertically centered, so a line that
  // appeared only after the fetch grew the block and nudged every line above
  // it up by half a line on each load. With the space held from the first
  // paint, nothing moves; with no upcoming event, the slot stays empty.
  const when = next
    ? new Date(next.date).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Chicago",
      })
    : ""

  return (
    <div className="h-5">
      {next && (
        <Link
          href={`/events/${next.slug}`}
          className="group inline-flex max-w-full items-center gap-3 rounded-lg text-sm leading-5 text-white/70 transition-colors hover:text-white motion-safe:animate-[fade-in_400ms_ease-out]"
        >
          {/* The prompt chevron from the DEVSA mark, still. It was a teal dot
              that pulsed forever, a third thing moving in a hero that already
              has the photos and the typed headline word. */}
          <span className="shrink-0 font-mono text-sm font-semibold leading-5 text-[#00b2a9]" aria-hidden>
            &gt;
          </span>
          <span className="min-w-0 truncate">
            <span className="font-medium text-white/85">Next up:</span>{" "}
            <span className="text-white group-hover:underline underline-offset-4">{next.title}</span>
            {next.communityName && <span> · {next.communityName}</span>}
            <span> · {when}</span>
          </span>
        </Link>
      )}
    </div>
  )
}

/**
 * The headline's last word, typed at a prompt: Builds, Connects, Grows,
 * Learns, each typed out, held, and deleted for the next, once. It comes back
 * to "Builds." and stops: a greeting in the first fifteen seconds, not a loop,
 * because a word retyping every few seconds in the middle of the reading path
 * kept pulling the eye off the sentence below. The photos are the hero's
 * ongoing motion. The four verbs are
 * the original line, "Find Your People. Build Your Future.", taken apart:
 * learning and connecting are finding your people, building and growing are
 * the future.
 *
 * It opens on "Builds", fully written, so the server render and a reader who
 * asks for less motion both get the headline as chosen; the cycle only starts
 * on the client, and never under prefers-reduced-motion. The word sits on its
 * own line, so a longer word doesn't reflow the lines above it.
 *
 * The caret is the site's shell caret (txlfCaret in globals.css): a hard
 * on/off rather than a fade, and held steady under reduced motion.
 */
const HERO_WORDS = ["Builds", "Connects", "Grows", "Learns"]

function TypedWord() {
  const [text, setText] = useState(`${HERO_WORDS[0]}.`)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let word = 0
    let shown = text.length
    let deleting = true
    let timer: ReturnType<typeof setTimeout>
    const full = () => `${HERO_WORDS[word]}.`
    const step = () => {
      if (deleting) {
        shown -= 1
        setText(full().slice(0, shown))
        if (shown === 0) {
          deleting = false
          word = (word + 1) % HERO_WORDS.length
          timer = setTimeout(step, 320)
          return
        }
        timer = setTimeout(step, 45)
      } else {
        shown += 1
        setText(full().slice(0, shown))
        if (shown === full().length) {
          // Back on the first word: the pass is done, and it rests here.
          if (word === 0) return
          deleting = true
          timer = setTimeout(step, 2400)
          return
        }
        timer = setTimeout(step, 95)
      }
    }
    // Hold the first word as long as the others before the cycle begins.
    timer = setTimeout(step, 2800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span className="block whitespace-nowrap">
      {text}
      <span
        aria-hidden
        className="ml-[0.06em] inline-block h-[0.78em] w-[0.42em] translate-y-[0.06em] bg-[#ef426f] animate-[txlfCaret_1.1s_infinite]"
      />
    </span>
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
      // Tablets take the phone layout too (photos first, text full width): the
      // side-by-side layout squeezed the copy to ~290px on an upright iPad.
      setIsMobile(w < 1024)
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
      className="relative w-full min-h-dvh flex flex-col lg:justify-center lg:items-start overflow-hidden bg-neutral-950"
      data-bg-type="dark"
    >
      {/* Inject CSS keyframes once */}
      <style>{`
        @keyframes hero-scroll-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
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

      {/* Headline — below the images on phones and tablets; leads the left column from lg up */}
      {/* The headline's column is wider than the copy's (75% against 55%) so
          "Where San Antonio" holds one line from tablets up; at 55% it needed
          about 650px and had 545–630 on laptops, so "Where" sat alone. Phones
          still wrap: one line there would mean shrinking the headline. */}
      <div className="order-2 lg:order-0 relative z-20 w-full lg:max-w-[75%] page-inset-left pr-6 sm:pr-10 md:pr-16 lg:pr-20 pt-8 lg:pt-0">
        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Below lg the size follows the screen width so "Where San Antonio"
              always fits on one line: the phrase is about 9 times its font
              size wide, and the column is the screen less 3rem of padding.
              Capped at 3.5rem for tablets. */}
          <h1 className="text-balance font-sans text-white font-black tracking-[-0.02em] leading-[1.05] lg:leading-[1.1] text-[min(calc((100vw-3rem)/9.4),3.5rem)] lg:text-6xl xl:text-7xl">
            {/* One sentence for screen readers and search; the typed word is decoration. */}
            <span className="sr-only">Where San Antonio learns, builds, connects and grows.</span>
            <span aria-hidden>
              <span className="whitespace-nowrap">
                <span className="text-white/65 font-normal italic">Where</span> San&nbsp;Antonio
              </span>
              <TypedWord />
            </span>
          </h1>
        </motion.div>
      </div>

      {/* 3D Photo Carousel — leads on phones and tablets (full-bleed, images first);
          full-bleed behind the text on desktop. Explicit mobile height because
          the inner columns are absolutely positioned (zero intrinsic height).
          On phones it's a strip, not half the screen: at 48dvh the headline
          started mid-screen and the Community Calendar button sat below the
          fold on an iPhone, so the first screen said nothing about DEVSA.
          On tablets (md) it grows instead (flex-1) to fill whatever height the
          copy leaves: with the text full width, an upright iPad otherwise had
          a band of empty screen under "Next up". */}
      <div
        className="order-1 lg:order-0 relative z-0 w-full h-[30dvh] min-h-52 overflow-hidden md:h-auto md:flex-1 md:min-h-[30dvh] lg:h-auto lg:min-h-0 lg:overflow-visible lg:absolute lg:inset-0"
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

        {/* Desktop shading. Dark behind the copy, which needs it, and clear
            over the right side, which is where the photos have to read.

            There used to be three stacked layers here, and together they held
            the gallery under the left ~60% of the screen at roughly 10–15%
            visibility — the strongest thing on the page reduced to a grey wash.
            The text column ends near 48% of the width, so the dark hold stops
            just past it and fades out by 72%. It held only 45% at the 52% mark,
            where the copy still runs on a laptop, so a photo showed through the
            end of the lines; it now holds 92% to 42%. Top and bottom get a lighter
            vignette so the nav and the next section still meet the hero
            cleanly. */}
        <div
          className="hidden lg:block absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.92) 42%, rgba(10,10,10,0.6) 56%, rgba(10,10,10,0.12) 72%, transparent 100%)",
          }}
        />
        <div className="hidden lg:block absolute inset-0 bg-linear-to-b from-neutral-950/50 via-transparent to-neutral-950/60 z-10" />

        {/* Mobile fades — blend the gallery into the text above and below */}
        <div className="lg:hidden absolute inset-x-0 top-0 h-20 bg-linear-to-b from-neutral-950 to-transparent z-10" />
        <div className="lg:hidden absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-neutral-950 to-transparent z-10" />
      </div>

      {/* Body copy + CTAs — after the images on phones and tablets; continues the left column from lg up */}
      <div className="order-3 lg:order-0 relative z-20 w-full lg:max-w-[55%] page-inset-left pr-6 sm:pr-10 md:pr-16 lg:pr-20 pt-8 pb-20 lg:pb-0">
        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-7 md:space-y-8"
        >
          {/*
            One paragraph, and it previews the page rather than repeating the
            others. It used to be two: "the bridge between San Antonio's
            builders, tech groups and partners", then a run of twelve topics
            that is word for word the /events subtitle. Each other page owns one
            idea (/about the origin, /buildingtogether the missing shared room,
            /events the calendar); this is the one place that says all of what
            DEVSA does, in the order the sections below explain it: the groups,
            the conferences, the partners. The headline names no audience, so
            this names all three (the homepage's "Three Audiences" section
            below). "The same room" answers
            /buildingtogether's "No Shared Room": the mission is in person, and
            the calendar is how people find the rooms.
          */}
          <p className="max-w-2xl md:text-pretty text-lg md:text-2xl leading-relaxed md:leading-[1.45] text-white/70">
            <strong className="font-semibold text-white">
              DEVSA puts San&nbsp;Antonio&apos;s tech builders, organizers and partners in the same room.
            </strong>{" "}
            Twenty-five groups on one calendar, one channel to follow, and
            conferences built here.
          </p>

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

          <NextUp />
        </motion.div>
      </div>
    </section>
  )
}
