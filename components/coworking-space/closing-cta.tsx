"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function ClosingCta() {
  return (
    <section
      className="bg-white py-16 md:py-24"
      data-bg-type="light"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8 max-w-3xl"
        >
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
              What&apos;s Happening
            </p>
            <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              See What&apos;s{" "}
              <span className="text-gray-600 font-light italic">Happening</span>{" "}
              Across San&nbsp;Antonio.
            </h2>
          </div>

          <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light max-w-2xl">
            Now that you know the space — tech talks, workshops, meetups, and
            conferences happen every week across San&nbsp;Antonio&apos;s tech
            community, all on{" "}
            <strong className="font-semibold text-gray-900">
              the community calendar
            </strong>
            .
          </p>

          <Link
            href="/events"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white font-medium text-sm transition-colors duration-200 hover:bg-gray-800"
          >
            Browse the Community Calendar
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
