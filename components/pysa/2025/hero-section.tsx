"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowUpRight, Play, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { primaryButton, secondaryButton } from "@/components/pysa/2026/button-styles"
import { PYSA_COLORS } from "@/data/pysa/2026"

const S3 = "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa"

/**
 * The lead still: a speaker mid-talk with the deck behind him. Of the eight
 * frames from 2025 it is the only one that reads as "conference" at a glance,
 * which is what earns it the large cell — and the play affordance, since the
 * livestream is a recording of exactly this.
 */
const LEAD = {
  src: `${S3}/pysa3.jpg`,
  alt: "A speaker presenting at PySanAntonio 2025 with slides behind him",
  width: 1616,
  height: 1080,
}

/** Two supporting frames: the size of the room, then the people in it. */
const SUPPORTING = [
  {
    src: `${S3}/pysa7.jpg`,
    alt: "The full room of attendees at PySanAntonio 2025",
    width: 1544,
    height: 1032,
  },
  {
    // Portrait 3:4 in a 4:3 cell, so the crop takes the middle band —
    // which is where the two faces sit. Do not switch this to object-top.
    src: `${S3}/pysa8.jpg`,
    alt: "Two attendees outside the venue after PySanAntonio 2025",
    width: 3912,
    height: 5217,
  },
]

export default function HeroSection() {
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false)

  return (
    <section className="relative bg-[#0a0a0a] text-white" data-bg-type="dark">
      {/* pt clears the fixed navbar. The old value here was
          calc(1.5rem - var(--header-height)) — that custom property is not
          defined anywhere in the app, so the whole declaration was dropped and
          the copy tucked under the header. */}
      <div className="page-shell grid items-center gap-10 pb-14 pt-28 md:pb-20 md:pt-32 lg:grid-cols-2 lg:gap-16 lg:pb-24">
        {/* Left: the copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-8"
        >
          {/* Forward pointer to the live event. This is an archive, so the most
              useful thing on it is the way out to the current edition — a
              badged callout above the headline rather than the grey one-line
              text link it used to be, and an ArrowRight, since 2026 is ahead
              of this page rather than behind it. */}
          <Link
            href="/events/pysanantonio"
            className="group inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <span
              className="rounded-md px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#0a0a0a]"
              style={{ backgroundColor: PYSA_COLORS.yellow }}
            >
              Next up
            </span>
            <span className="font-medium text-white">
              PySanAntonio II · October 2, 2026
            </span>
            {/* Hidden on phones: with the badge and the date already on the
                line there is no room left, so the arrow wrapped onto a row of
                its own. From sm up it is the site's standard hop — the same
                ArrowUpRight treatment as about-devsa and hero-bridge. */}
            <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-white/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white sm:block" />
          </Link>

          <div className="space-y-4">
            <p
              className="text-sm font-medium uppercase tracking-[0.2em] md:text-base"
              style={{ color: PYSA_COLORS.yellow }}
            >
              San Antonio&apos;s First Python Conference
            </p>
            <h1 className="font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl xl:text-6xl">
              Thank You{" "}
              <span className="font-light italic" style={{ color: PYSA_COLORS.blue }}>
                for an
              </span>{" "}
              Incredible Experience.
            </h1>
          </div>

          <div className="space-y-5">
            <p className="text-xl font-light leading-[1.4] text-gray-300 md:text-2xl">
              PySanAntonio 2025 brought together Python enthusiasts from across the
              region for a day of{" "}
              <strong className="font-semibold text-white">
                learning, networking, and community building.
              </strong>
            </p>

            <p className="text-lg leading-relaxed text-gray-400">
              The whole day is still here — watch the livestream, browse every
              session, and meet us for the second edition.
            </p>
          </div>

          {/* Both actions share the site's button shape (rounded-lg, one size)
              so they line up instead of being two differently coloured pills. */}
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setIsLiveStreamOpen(true)}
              className={primaryButton}
            >
              <Play className="h-4 w-4 fill-current" />
              Watch the livestream
            </button>

            <Link href="#sessions" className={secondaryButton}>
              Browse the sessions
            </Link>
          </div>
        </motion.div>

        {/* Right: the event itself — one spotlight frame over two supporting
            ones. Replaces the full-bleed marquee, which auto-played three
            .mov files (a container Chrome will not decode) purely for motion. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-col gap-3 sm:gap-4"
        >
          <button
            type="button"
            onClick={() => setIsLiveStreamOpen(true)}
            className="group relative block w-full overflow-hidden rounded-xl ring-1 ring-white/10 transition-colors hover:ring-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdd00]"
          >
            <Image
              src={LEAD.src}
              alt={LEAD.alt}
              width={LEAD.width}
              height={LEAD.height}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="aspect-3/2 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/85 to-transparent"
            />
            <span className="absolute inset-x-4 bottom-4 flex items-center gap-3 text-left">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0a0a0a] transition-transform group-hover:scale-110"
                style={{ backgroundColor: PYSA_COLORS.yellow }}
              >
                <Play className="h-4 w-4 fill-current" />
              </span>
              <span className="text-sm font-semibold text-white">
                Watch the 2025 livestream
              </span>
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {SUPPORTING.map((photo) => (
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                sizes="(min-width: 1024px) 20vw, 50vw"
                className="aspect-4/3 w-full rounded-xl object-cover ring-1 ring-white/10"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Livestream Modal */}
      <AnimatePresence>
        {isLiveStreamOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setIsLiveStreamOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsLiveStreamOpen(false)}
                aria-label="Close the livestream"
                className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=1782"
                title="PySanAntonio Livestream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="border-0"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
