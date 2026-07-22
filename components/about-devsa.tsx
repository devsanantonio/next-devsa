"use client"

import { motion } from "motion/react"
import { Play, ArrowUpRight } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const VIDEO_URL =
  "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/DevSA_MoreHuman2026_0313B.mp4"
const VIDEO_POSTER =
  "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/0P3A9676.jpg"

export function AboutDevsa() {
  const [playing, setPlaying] = useState(false)

  return (
    <section
      id="about-devsa"
      className="w-full bg-white py-16 md:py-24 lg:py-28 relative overflow-hidden"
      data-bg-type="light"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-10 md:space-y-12"
        >
          {/* Header */}
          <div className="space-y-4 max-w-4xl">
            <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
              About DEVSA
            </p>
            <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              A 501(c)(3) Built to{" "}
              <span className="text-gray-600 font-light italic">Serve</span>{" "}
              San Antonio&apos;s Tech Communities.
            </h2>
          </div>

          {/* Lead intro */}
          <p className="max-w-3xl text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
            DEVSA is the bridge across San Antonio&apos;s tech ecosystem. Through
            our platform we connect{" "}
            <strong className="font-semibold text-gray-900">
              20+ grassroots groups
            </strong>
            , local builders, and industry partners into one shared ecosystem.
          </p>

          {/* The video — the star of the section. Large and cinematic, plays
              inline with the founder quote as its caption. */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-black/5"
          >
            {playing ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                autoPlay
                controls
                playsInline
                poster={VIDEO_POSTER}
                className="absolute inset-0 w-full h-full"
              >
                <source src={VIDEO_URL} type="video/mp4" />
              </video>
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 h-full w-full cursor-pointer text-left"
                aria-label="Play the More Human Than Human recap"
              >
                <img
                  src={VIDEO_POSTER}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Scrim for caption legibility */}
                <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10" />

                {/* Play button */}
                <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white md:h-24 md:w-24">
                  <Play className="ml-1 h-7 w-7 fill-gray-900 text-gray-900 md:h-8 md:w-8" />
                </span>

                {/* Founder quote — overlaid on the video on desktop only (on
                    mobile it sits below the video so the play button never
                    covers it) */}
                <span className="hidden md:block absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10 lg:p-12">
                  <span className="block max-w-2xl text-balance text-base font-light italic leading-[1.4] text-white sm:text-lg md:text-xl lg:text-2xl">
                    &ldquo;DEVSA is never going to be the final destination.
                    It&apos;s the platform that allows you to find your people, to
                    help build your future, to build your network.&rdquo;
                  </span>
                  <span className="mt-3 block text-xs font-medium uppercase tracking-[0.15em] text-white/70 md:mt-4 md:text-sm">
                    Jesse Hernandez, Founder
                  </span>
                </span>
              </button>
            )}
          </motion.div>

          {/* Founder quote — shown below the video on mobile (overlaid on desktop) */}
          <div className="md:hidden border-l-4 border-gray-900 pl-5 max-w-3xl">
            <p className="text-lg text-gray-900 leading-[1.4] font-light italic">
              &ldquo;DEVSA is never going to be the final destination. It&apos;s
              the platform that allows you to find your people, to help build
              your future, to build your network.&rdquo;
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
              Jesse Hernandez, Founder
            </p>
          </div>

          {/* Supporting detail */}
          <p className="max-w-3xl text-base md:text-lg text-gray-500 leading-relaxed">
            We don&apos;t replace the communities doing the work — we{" "}
            <span className="font-medium text-gray-700">host them</span>,{" "}
            <span className="font-medium text-gray-700">connect them</span>, and{" "}
            <span className="font-medium text-gray-700">help them grow</span>{" "}
            through a downtown coworking space, a shared community calendar,
            monthly workshops, and conferences built right here in
            San&nbsp;Antonio.
          </p>

          {/* CTAs — the two most tangible ways to plug in */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 pt-2">
            <Link
              href="/coworking-space"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg bg-gray-900 text-white font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-800"
            >
              Coworking Space
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/events"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-50 hover:border-gray-400"
            >
              Community Calendar
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
