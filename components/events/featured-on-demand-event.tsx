"use client"
import { motion } from "motion/react"
import { Play, Clock, ArrowRight } from "lucide-react"
import { featuredOnDemandEvent } from "@/data/events"

export function FeaturedOnDemandEvent() {
  if (!featuredOnDemandEvent) return null

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 shadow-lg shadow-gray-100 sm:p-12"
        >
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-[#ef426f]/5 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ef426f] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                <Play className="h-3 w-3 fill-white" />
                Featured On-Demand
              </div>
              <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {featuredOnDemandEvent.title}
              </h2>
              <p className="max-w-2xl text-pretty text-base leading-relaxed text-gray-600 sm:text-lg">
                {featuredOnDemandEvent.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-5 w-5 text-[#ef426f]" />
                <span className="font-medium">Watch anytime</span>
              </div>
            </div>
            {featuredOnDemandEvent.url && (
              <div className="flex-shrink-0">
                <a
                  href={featuredOnDemandEvent.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-900 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-gray-900 hover:text-white"
                >
                  Watch Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
