"use client"
import { motion } from "motion/react"
import { Play, ArrowRight, Video } from "lucide-react"
import { featuredOnDemandEvent, moreHumanThanHumanEvent } from "@/data/events"
import Image from "next/image"
import Link from "next/link"

// Subtle background pattern
function OnDemandBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#FFD43B]/5 blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#4B8BBE]/5 blur-[150px]" />
    </div>
  )
}

function formatPastDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  })
}

export function FeaturedOnDemandEvent() {
  if (!featuredOnDemandEvent && !moreHumanThanHumanEvent) return null

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" data-bg-type="dark">
      <OnDemandBackground />
      
      {/* Top border */}
      <div className="h-1 w-full bg-linear-to-r from-[#4B8BBE] via-[#FFD43B] to-[#4B8BBE] opacity-60" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-[#4B8BBE]/50 bg-[#4B8BBE]/10">
                <Video className="h-4 w-4 sm:h-5 sm:w-5 text-[#4B8BBE]" />
              </div>
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#FFD43B]">
                On-Demand
              </span>
            </div>

            <h2 className="text-balance font-sans text-[#e5e5e5] leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Quarterly Conferences{" "}
              <span className="text-[#737373] font-light italic">Powered by</span>{" "}
              DEVSA.
            </h2>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            <p className="text-balance tracking-tight md:tracking-normal text-xl md:text-2xl text-[#999] leading-[1.4] font-light">
              Watch on-demand content from conferences organized right here in{" "}
              <strong className="font-semibold text-[#e5e5e5]">San Antonio</strong> — built by the community, for the community.
            </p>

            <p className="text-base md:text-lg text-[#666] leading-relaxed">
              Missed a session? Catch up on{" "}
              <span className="font-medium text-[#999]">talks</span>,{" "}
              <span className="font-medium text-[#999]">panels</span>, and{" "}
              <span className="font-medium text-[#999]">workshops</span>{" "}
              at your own pace.
            </p>
          </div>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left - PySanAntonio */}
          {featuredOnDemandEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href={featuredOnDemandEvent.url || "#"}
                className="group block border border-[#333] bg-[#111] overflow-hidden transition-all duration-500 hover:border-[#FFD43B]/50"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg"
                    alt={featuredOnDemandEvent.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Past event badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#4B8BBE] text-white font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1">
                      Past Event
                    </span>
                  </div>
                  
                  {/* Play indicator */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 border border-[#333] bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1.5">
                    <Play className="h-3 w-3 text-[#FFD43B]" />
                    <span className="font-mono text-[10px] font-semibold text-[#e5e5e5]">Full Event</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666] mb-2">
                    {formatPastDate(featuredOnDemandEvent.date)} · {featuredOnDemandEvent.location}
                  </p>
                  
                  <h3 className="text-lg sm:text-xl font-black uppercase leading-tight tracking-tight text-[#e5e5e5] mb-3">
                    {featuredOnDemandEvent.title}
                  </h3>
                  
                  <p className="text-sm text-[#737373] leading-relaxed mb-4">
                    {featuredOnDemandEvent.description}
                  </p>

                  <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-[#FFD43B] transition-colors group-hover:text-[#4B8BBE]">
                    View all sessions
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Right - More Human Than Human */}
          {moreHumanThanHumanEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link
                href={moreHumanThanHumanEvent.url || "#"}
                className="group block border border-[#333] bg-[#111] overflow-hidden transition-all duration-500 hover:border-[#ff9900]/50"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-black">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                  >
                    <source src="https://devsa-assets.s3.us-east-2.amazonaws.com/HEAD_v01.mp4" type="video/mp4" />
                    <source src="https://devsa-assets.s3.us-east-2.amazonaws.com/HEAD_v01.webm" type="video/webm" />
                  </video>
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Past event badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#ff9900] text-[#0a0a0a] font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1">
                      Past Event
                    </span>
                  </div>
                  
                  {/* Play indicator */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 border border-[#333] bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1.5">
                    <Play className="h-3 w-3 text-[#ff9900]" />
                    <span className="font-mono text-[10px] font-semibold text-[#e5e5e5]">Full Event</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666] mb-2">
                    {formatPastDate(moreHumanThanHumanEvent.date)} · {moreHumanThanHumanEvent.location}
                  </p>
                  
                  <h3 className="text-lg sm:text-xl font-black uppercase leading-tight tracking-tight text-[#e5e5e5] mb-3">
                    {moreHumanThanHumanEvent.title}
                  </h3>
                  
                  <p className="text-sm text-[#737373] leading-relaxed mb-4">
                    {moreHumanThanHumanEvent.description}
                  </p>

                  <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-[#ff9900] transition-colors group-hover:text-[#fbbf24]">
                    View event
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Bottom border */}
      <div className="h-1 w-full bg-linear-to-r from-[#4B8BBE] via-[#FFD43B] to-[#4B8BBE] opacity-60" />
    </section>
  )
}
