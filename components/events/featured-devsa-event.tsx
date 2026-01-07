"use client"
import { motion } from "motion/react"
import { Calendar, MapPin, ArrowRight, Tv } from "lucide-react"
import { upcomingDevsaEvent } from "@/data/events"
import Link from "next/link"

// Aztec-inspired geometric pattern for background
function AztecBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#ff9900 1px, transparent 1px),
            linear-gradient(90deg, #ff9900 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#ff9900]/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#00f2ff]/5 blur-[150px]" />
    </div>
  )
}

// Corner decoration component
function AztecCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const rotations = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }
  
  return (
    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${rotations[position]}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M0 0h8v64H0z" fill="#333" />
        <path d="M0 0h64v8H0z" fill="#333" />
        <path d="M16 16h4v24h-4z" fill="#ff9900" opacity="0.6" />
        <path d="M16 16h24v4H16z" fill="#ff9900" opacity="0.6" />
        <path d="M28 28h2v12h-2z" fill="#00f2ff" opacity="0.4" />
        <path d="M28 28h12v2H28z" fill="#00f2ff" opacity="0.4" />
      </svg>
    </div>
  )
}

// Border decoration
function AztecBorder() {
  return (
    <div className="h-1 w-full bg-linear-to-r from-[#ff9900] via-[#00f2ff] to-[#ff9900] opacity-60" />
  )
}

export function FeaturedDevsaEvent() {
  if (!upcomingDevsaEvent) {
    return (
      <section className="relative bg-[#0a0a0a] overflow-hidden" data-bg-type="dark">
        <AztecBackground />
        <AztecBorder />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#e5e5e5] sm:text-4xl lg:text-5xl leading-[1.1]">
              Featured <span className="text-[#ff9900]">Event</span>
            </h2>
            <p className="mt-4 text-base font-normal leading-7 text-[#737373] sm:text-lg">
              Join us at this upcoming event to connect with the community and DEVSA team.
            </p>
          </div>
          <div className="flex items-center justify-center border border-[#333] bg-[#111]/80 backdrop-blur-sm p-16">
            <div className="text-center">
              <p className="text-base font-medium text-[#737373]">
                No upcoming event available at the moment.
              </p>
              <p className="mt-1 text-sm text-[#525252]">Check back later for new events!</p>
            </div>
          </div>
        </div>
        <AztecBorder />
      </section>
    )
  }

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" data-bg-type="dark">
      <AztecBackground />
      <AztecBorder />
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 lg:top-6 lg:left-6 hidden sm:block">
        <AztecCorner position="top-left" />
      </div>
      <div className="absolute top-4 right-4 lg:top-6 lg:right-6 hidden sm:block">
        <AztecCorner position="top-right" />
      </div>
      <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 hidden sm:block">
        <AztecCorner position="bottom-left" />
      </div>
      <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 hidden sm:block">
        <AztecCorner position="bottom-right" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold tracking-tight text-[#e5e5e5] sm:text-4xl lg:text-5xl leading-[1.1]"
          >
            Featured <span className="text-[#ff9900]">Event</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-base font-normal leading-7 text-[#737373] sm:text-lg sm:leading-8"
          >
            Join us at this upcoming event to connect with the community and DEVSA team.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="group relative overflow-hidden border border-[#333] bg-[#111]/80 backdrop-blur-sm"
        >
          {/* Gradient accent */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#ff9900]/10 blur-3xl transition-all duration-500 group-hover:bg-[#ff9900]/20" />
          <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-[#00f2ff]/10 blur-3xl" />
          
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2.5 border border-[#333] bg-[#111]/80 backdrop-blur-sm px-4 py-2">
                  <Tv className="w-3.5 h-3.5 text-[#ff9900]" />
                  <span className="font-mono text-[10px] sm:text-xs text-[#a3a3a3] tracking-[0.15em] uppercase">
                    DEVSA TV Recording
                  </span>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black uppercase leading-[0.95] tracking-tight text-[#e5e5e5] group-hover:text-[#ff9900] transition-colors duration-300">
                  {upcomingDevsaEvent.title}
                </h3>
                
                {/* Description */}
                <p className="max-w-2xl font-mono text-sm sm:text-base leading-relaxed text-[#737373]">
                  {upcomingDevsaEvent.description}
                </p>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-[#ff9900]/50 bg-[#ff9900]/10">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff9900]" />
                    </div>
                    <div>
                      <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#525252]">Date</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#e5e5e5]">
                        {new Date(upcomingDevsaEvent.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-[#333]" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-[#00f2ff]/50 bg-[#00f2ff]/10">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#00f2ff]" />
                    </div>
                    <div>
                      <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#525252]">Location</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#e5e5e5]">{upcomingDevsaEvent.location}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              {upcomingDevsaEvent.url && (
                <div className="shrink-0 lg:self-center">
                  <Link
                    href={upcomingDevsaEvent.url}
                    className="group/btn inline-flex items-center justify-center gap-3 bg-[#ff9900] px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold uppercase tracking-wider text-[#0a0a0a] transition-all duration-300 hover:bg-[#00f2ff] hover:scale-105"
                  >
                    <span className="font-mono">Register Now</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <AztecBorder />
    </section>
  )
}
