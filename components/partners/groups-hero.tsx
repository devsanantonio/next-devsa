"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

/**
 * Local, and cropped for this slot.
 *
 * This used to hotlink the camera original from S3 —
 * devsa-assets.s3.us-east-2.amazonaws.com/techday5.jpg, 5.4 MB — as the
 * background of a `min-h-dvh` hero, so it was in the critical path of a
 * top-level page. The same photograph already existed in this repo at
 * /hero/techday5.webp, 73 KB, which is the version the homepage marquee had
 * been using all along: a 74x difference for an image that renders as a
 * grayscaled, heavily scrimmed backdrop.
 *
 * The frame changed too. A full session room from Startup + Tech Week says what
 * this page is about — a room with the ecosystem in it — better than a tight
 * shot of a few people at a meetup did.
 *
 * It is IMG_0441 rather than IMG_0444, which this used first. 0444 is already
 * in the homepage marquee as /hero/sastw-room-full.webp, so the two top-level
 * pages were opening on the same photograph. 0441 is the same room a moment
 * earlier — speaker at the mic on the left, tables running the full width —
 * which suits a hero scrimmed from the left better anyway: there are people
 * all the way to the right edge, where the scrim lets the picture through.
 */
const HERO_IMAGE_URL = "/photos/buildingtogether-hero.webp"

export function GroupsHero() {
  return (
    <section
      className="relative overflow-hidden bg-black min-h-dvh flex flex-col items-center justify-center"
      data-bg-type="dark"
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE_URL}
        alt=""
        width={1600}
        height={900}
        className="absolute inset-0 w-full h-full object-cover grayscale"
      />

      {/* Dark overlay — heavy left for text readability, fading right to reveal the photo */}
      <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/85 to-transparent z-10" />
      <div className="absolute inset-0 bg-linear-to-b from-neutral-950/70 via-transparent to-neutral-950/70 z-10" />
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.15) 65%, transparent 100%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-20 page-shell py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 flex flex-col">
        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
              Building Together
            </p>
            <h1 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Where Partners and Communities{" "}
              <span className="text-white/50 font-light italic">Come Together to</span>{" "}
              Build.
            </h1>
          </div>

          <div className="space-y-8 max-w-3xl mt-8">
            <div className="space-y-6">
              <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
                Twenty-plus community groups, the partners who back them, and{" "}
                <strong className="font-semibold text-white">
                  one shared calendar
                </strong>{" "}
                between them.
              </p>

              <p className="text-base md:text-lg text-white/50 leading-relaxed">
                We&apos;re the bridge for a reason — connecting{" "}
                <span className="font-medium text-white/70">organizers</span>,{" "}
                <span className="font-medium text-white/70">companies</span>, and{" "}
                <span className="font-medium text-white/70">builders</span>{" "}
                across San Antonio&apos;s tech landscape.
              </p>
            </div>

            {/* CTAs — Community Calendar leads, and is now the only one here;
                the Coworking link beside it went when the room closed. */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
              <Link
                href="/events"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg bg-white text-gray-900 font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-100"
              >
                Community Calendar
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Bottom fade into the logo showcase */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent z-20" />
    </section>
  )
}
