"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, Play, X } from "lucide-react"
import { primaryButton, secondaryButton } from "@/components/pysa/2026/button-styles"
import { MascotSticker } from "@/components/pysa/2026/mascot-sticker"
import { PYSA_ASSETS, PYSA_COLORS, PYSA_WORDMARK } from "@/data/pysa/2026"

const PHOTOS_2025 = [
  {
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg",
    alt: "The audience at PySanAntonio 2025",
  },
  {
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa5.jpg",
    alt: "A talk in progress at PySanAntonio 2025",
  },
  {
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa8.jpg",
    alt: "Attendees between sessions at PySanAntonio 2025",
  },
  {
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.jpg",
    alt: "The PySanAntonio 2025 after party",
  },
]

const STATS = [
  { value: "8", label: "talks" },
  { value: "5", label: "hours" },
  { value: "1", label: "afternoon at Geekdom" },
]

/**
 * Archive card for PySanAntonio 2025 — the proof that makes someone submit a
 * talk. Photos sit behind a scrim so the two CTAs stay legible; the full
 * session list lives at /events/pysanantonio/2025.
 */
export function ArchiveCta2025() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section
      id="archive-2025"
      data-bg-type="dark"
      className="relative overflow-hidden bg-[#0a0a0a] pb-20"
    >
      {/* Mobile: third and last appearance, back on the right edge. Low opacity
          because it sits alongside the card rather than in clear space. */}
      <MascotSticker
        className="-right-8 bottom-1 w-32 sm:hidden"
        rotate={-6}
        from="right"
        opacity={0.75}
      />

      <div className="page-shell relative">
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          {/* Photo bed */}
          <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4">
            {PHOTOS_2025.map((photo) => (
              <div key={photo.src} className="relative">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          {/* Scrim — the photos are context, the copy is the message */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[#0a0a0a]/80 md:bg-linear-to-r md:from-[#0a0a0a] md:via-[#0a0a0a]/85 md:to-[#0a0a0a]/30"
          />

          <div className="relative flex flex-col gap-7 p-8 md:max-w-2xl md:p-14">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                The first one
              </p>
              <h2 className="flex flex-wrap items-end gap-x-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PYSA_WORDMARK.svgDark}
                  alt="PySanAntonio"
                  width={PYSA_WORDMARK.width}
                  height={PYSA_WORDMARK.height}
                  className="h-auto w-full max-w-[17rem] md:max-w-[20rem]"
                />
                <span>2025</span>
              </h2>
              <p className="max-w-md text-base leading-relaxed text-white/60">
                The first one brought together developers, data scientists, and
                curious beginners across every experience level — talks on DSPy,
                async Django, mathematics, and what people here are actually
                shipping. The whole day was streamed, and every session is still
                up to watch.
              </p>
            </div>

            {/* The proof line */}
            <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {STATS.map((s) => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-2xl font-bold" style={{ color: PYSA_COLORS.yellow }}>
                    {s.value}
                  </dd>
                  <span className="text-sm text-white/50">{s.label}</span>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={primaryButton}
              >
                <Play className="h-4 w-4 fill-current" />
                Watch the 2025 livestream
              </button>
              <Link href="/events/pysanantonio/2025" className={secondaryButton}>
                Browse all 8 sessions
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="PySanAntonio 2025 livestream"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close livestream"
                className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </button>
              <iframe
                width="100%"
                height="100%"
                src={PYSA_ASSETS.livestream2025}
                title="PySanAntonio 2025 livestream"
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
