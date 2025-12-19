"use client"
import { motion } from "motion/react"
import { Play, ArrowRight } from "lucide-react"
import { featuredOnDemandEvent } from "@/data/events"
import Image from "next/image"
import Link from "next/link"

export function FeaturedOnDemandEvent() {
  if (!featuredOnDemandEvent) return null

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">On-Demand Sessions</h2>
          <p className="mt-2 text-sm text-gray-600">
            Watch and learn from our experts.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {/* Video Thumbnail */}
          <Link
            href={featuredOnDemandEvent.url || "#"}
            className="group relative aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
          >
            <Image
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg"
              alt={featuredOnDemandEvent.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
              <span className="mb-2 text-sm font-medium text-white/90">Watch now</span>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 fill-gray-900 text-gray-900" />
              </div>
            </div>
          </Link>

          {/* Event Info */}
          <div className="flex flex-col justify-center space-y-4">
            <h3 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
              {featuredOnDemandEvent.title}
            </h3>
            <p className="text-pretty text-base leading-relaxed text-gray-600">
              {featuredOnDemandEvent.description}
            </p>
            {featuredOnDemandEvent.url && (
              <div>
                <Link
                  href={featuredOnDemandEvent.url}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[#ef426f]"
                >
                  View all sessions
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
