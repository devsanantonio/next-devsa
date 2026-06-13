"use client"

import { motion } from "motion/react"
import { SpeakerForm } from "@/components/startup-week/speaker-form"
import { StartupWeekIntro } from "@/components/startup-week/intro"

/**
 * Single-screen, Vercel-style split hero: the co-branded intro (lockup,
 * headline, dates, tracks) on the left; the speaker submission form on the
 * right. The page is hero-only — on large screens it locks to the viewport
 * and each column scrolls internally if it ever needs to.
 */
export function StartupWeekHero() {
  return (
    <section
      data-bg-type="light"
      className="relative w-full bg-white lg:h-dvh lg:overflow-hidden"
    >
      <div className="mx-auto grid min-h-dvh max-w-7xl grid-cols-1 lg:h-dvh lg:grid-cols-2 lg:pt-14">
        {/* LEFT — collaboration + context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:h-full lg:overflow-y-auto lg:px-14 lg:py-10"
        >
          <StartupWeekIntro />
        </motion.div>

        {/* RIGHT — the form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border-t border-neutral-200 bg-neutral-50/60 px-6 py-12 sm:px-10 lg:h-full lg:overflow-y-auto lg:border-l lg:border-t-0 lg:px-14 lg:py-10"
        >
          <SpeakerForm />
        </motion.div>
      </div>
    </section>
  )
}
