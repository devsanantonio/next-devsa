"use client"
import { motion } from "motion/react"
import { Play, ArrowRight, Clock, Video } from "lucide-react"
import { featuredOnDemandEvent } from "@/data/events"
import Image from "next/image"
import Link from "next/link"

export function FeaturedOnDemandEvent() {
  if (!featuredOnDemandEvent) return null

  return (
    <section className="bg-black border-b border-gray-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <Video className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider text-purple-400">
              On-Demand
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.1]">
            Watch & Learn
          </h2>
          <p className="mt-4 max-w-2xl text-base font-normal leading-7 text-gray-400 sm:text-lg sm:leading-8">
            Catch up on past sessions and learn from our experts at your own pace.
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          {/* Video Thumbnail */}
          <Link
            href={featuredOnDemandEvent.url || "#"}
            className="group relative aspect-video overflow-hidden rounded-2xl border border-gray-800 bg-gray-900"
          >
            <Image
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg"
              alt={featuredOnDemandEvent.title}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl transition-all duration-300 group-hover:bg-[#ef426f]">
                  <Play className="h-8 w-8 fill-gray-900 text-gray-900 ml-1 transition-colors group-hover:fill-white group-hover:text-white" />
                </div>
              </motion.div>
              <span className="mt-4 text-sm font-bold uppercase tracking-wider text-white/90">
                Watch Now
              </span>
            </div>
            
            {/* Duration badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/80 backdrop-blur-sm px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-white">Full Session</span>
            </div>
          </Link>

          {/* Event Info */}
          <div className="flex flex-col justify-center space-y-6 lg:pl-4">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-2">
              <span className="text-sm font-bold uppercase tracking-wider text-purple-400">
                Featured Session
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              {featuredOnDemandEvent.title}
            </h3>
            
            {/* Description */}
            <p className="text-base font-normal leading-7 text-gray-400 sm:text-lg sm:leading-8">
              {featuredOnDemandEvent.description}
            </p>
            
            {/* CTA */}
            {featuredOnDemandEvent.url && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={featuredOnDemandEvent.url}
                  className="group/btn inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-base font-bold text-gray-900 shadow-lg transition-all duration-300 hover:bg-purple-500 hover:text-white hover:scale-105"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Watch Session
                </Link>
                <Link
                  href="/events/pysanantonio"
                  className="group/link inline-flex items-center gap-2 text-base font-semibold text-gray-400 transition-colors hover:text-white"
                >
                  View all sessions
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
