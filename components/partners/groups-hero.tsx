"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const HERO_IMAGE_URL = "https://devsa-assets.s3.us-east-2.amazonaws.com/techday5.jpg"

export function GroupsHero() {
  return (
    <section
      className="relative overflow-hidden bg-black min-h-dvh flex flex-col items-center justify-center"
      data-bg-type="dark"
    >
      {/* Background image */}
      <img
        src={HERO_IMAGE_URL}
        alt=""
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
      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
                Our platform simplifies how local partners and tech communities{" "}
                <strong className="font-semibold text-white">collaborate</strong>,{" "}
                exchange resources, and grow the ecosystem together.
              </p>

              <p className="text-base md:text-lg text-white/50 leading-relaxed">
                We&apos;re the bridge for a reason — connecting{" "}
                <span className="font-medium text-white/70">organizers</span>,{" "}
                <span className="font-medium text-white/70">companies</span>, and{" "}
                <span className="font-medium text-white/70">builders</span>{" "}
                across San Antonio&apos;s tech landscape.
              </p>
            </div>

            {/* CTAs — Community Calendar leads, Coworking second (per site ranking) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
              <Link
                href="/events"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg bg-white text-gray-900 font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-100"
              >
                Community Calendar
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/coworking-space"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg border border-white/20 bg-white/5 text-white font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-white/10 hover:border-white/30"
              >
                Coworking Space
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
