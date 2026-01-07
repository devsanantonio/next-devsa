"use client"
import { motion } from "motion/react"
import { Play, ArrowRight, Clock, Video } from "lucide-react"
import { featuredOnDemandEvent } from "@/data/events"
import Image from "next/image"
import Link from "next/link"

// Python-inspired background pattern
function PythonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#FFD43B 1px, transparent 1px),
            linear-gradient(90deg, #4B8BBE 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#FFD43B]/5 blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#4B8BBE]/5 blur-[150px]" />
    </div>
  )
}

export function FeaturedOnDemandEvent() {
  if (!featuredOnDemandEvent) return null

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" data-bg-type="dark">
      <PythonBackground />
      
      {/* Top border */}
      <div className="h-1 w-full bg-linear-to-r from-[#4B8BBE] via-[#FFD43B] to-[#4B8BBE] opacity-60" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-[#4B8BBE]/50 bg-[#4B8BBE]/10">
              <Video className="h-4 w-4 sm:h-5 sm:w-5 text-[#4B8BBE]" />
            </div>
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#FFD43B]">
              On-Demand
            </span>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold tracking-tight text-[#e5e5e5] sm:text-4xl lg:text-5xl leading-[1.1]"
          >
            Watch <span className="text-[#4B8BBE]">&</span> <span className="text-[#FFD43B]">Learn</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-base font-normal leading-7 text-[#737373] sm:text-lg sm:leading-8"
          >
            Catch up on past sessions and learn from our experts at your own pace.
          </motion.p>
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
            className="group relative aspect-video overflow-hidden border border-[#333] bg-[#111]"
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
                <div className="absolute inset-0 rounded-full bg-[#FFD43B]/30 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#FFD43B] shadow-2xl transition-all duration-300 group-hover:bg-[#4B8BBE]">
                  <Play className="h-6 w-6 sm:h-8 sm:w-8 fill-[#0a0a0a] text-[#0a0a0a] ml-1" />
                </div>
              </motion.div>
              <span className="mt-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-white/90">
                Watch Now
              </span>
            </div>
            
            {/* Duration badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 border border-[#333] bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1.5">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#FFD43B]" />
              <span className="font-mono text-[10px] sm:text-xs font-semibold text-[#e5e5e5]">Full Session</span>
            </div>
          </Link>

          {/* Event Info */}
          <div className="flex flex-col justify-center space-y-6 lg:pl-4">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2.5 border border-[#4B8BBE]/30 bg-[#4B8BBE]/10 px-4 py-2">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#4B8BBE]">
                Featured Session
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black uppercase leading-[0.95] tracking-tight text-[#e5e5e5]">
              {featuredOnDemandEvent.title}
            </h3>
            
            {/* Description */}
            <p className="font-mono text-sm sm:text-base leading-relaxed text-[#737373]">
              {featuredOnDemandEvent.description}
            </p>
            
            {/* CTA */}
            {featuredOnDemandEvent.url && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={featuredOnDemandEvent.url}
                  className="group/btn inline-flex items-center justify-center gap-3 bg-[#FFD43B] px-6 py-3.5 text-sm sm:text-base font-bold uppercase tracking-wider text-[#0a0a0a] transition-all duration-300 hover:bg-[#4B8BBE] hover:scale-105"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                  <span className="font-mono">Watch Session</span>
                </Link>
                <Link
                  href="/events/pysanantonio"
                  className="group/link inline-flex items-center gap-2 font-mono text-sm font-semibold text-[#737373] transition-colors hover:text-[#FFD43B]"
                >
                  View all sessions
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Bottom border */}
      <div className="h-1 w-full bg-linear-to-r from-[#4B8BBE] via-[#FFD43B] to-[#4B8BBE] opacity-60" />
    </section>
  )
}
