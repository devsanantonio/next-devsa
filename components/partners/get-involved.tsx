"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react"

export function GetInvolved() {
  return (
    <section
      id="get-involved"
      className="w-full bg-white py-16 sm:py-20 md:py-24"
      data-bg-type="light"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          {/* Left — the invitation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                Get Involved
              </p>
              <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
                Find Your People.{" "}
                <span className="text-gray-600 font-light italic">Show</span> Up.
              </h2>
            </div>
            <p className="max-w-lg text-lg md:text-xl text-gray-600 leading-[1.45] font-light">
              Subscribe to the community calendar for every meetup, workshop, and
              conference — embed it on your site or pull the{" "}
              <strong className="font-semibold text-gray-900">RSS feed</strong>.
              Or connect in person at the coworking space in the heart of downtown
              San&nbsp;Antonio.
            </p>
          </motion.div>

          {/* Right — the two ways to plug in */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4"
          >
            <Link
              href="/events"
              className="group flex items-center gap-4 rounded-2xl bg-gray-900 p-5 sm:p-6 transition-colors duration-200 hover:bg-gray-800"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <CalendarDays className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-white">
                  Community Calendar
                </span>
                <span className="block text-sm text-white/60">
                  Subscribe, embed, or connect via RSS
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-white/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              href="/coworking-space"
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 transition-colors duration-200 hover:bg-gray-50 hover:border-gray-300"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-gray-900">
                  Coworking Space
                </span>
                <span className="block text-sm text-gray-500">
                  A place to connect in downtown SA
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
