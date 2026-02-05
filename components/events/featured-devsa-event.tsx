"use client"
import { motion } from "motion/react"
import { Tv } from "lucide-react"
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
    <div className="mt-1.5 h-1 w-full bg-linear-to-r from-[#ff9900] via-[#00f2ff] to-[#ff9900] opacity-60" />
  )
}

export function FeaturedDevsaEvent() {
  if (!upcomingDevsaEvent) {
    return (
      <section className="relative bg-[#0a0a0a] overflow-hidden" data-bg-type="dark">
        <AztecBackground />
        <AztecBorder />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24">
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

  const formattedDate = new Date(upcomingDevsaEvent.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  })

  // Split title for styling (first 2 words in accent color)
  const titleWords = upcomingDevsaEvent.title.split(' ')
  const titleFirst = titleWords.slice(0, 2).join(' ')
  const titleRest = titleWords.slice(2).join(' ')

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" data-bg-type="dark">
      <AztecBackground />
      <AztecBorder />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24">
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link 
            href={upcomingDevsaEvent.url || "#"} 
            target={upcomingDevsaEvent.url?.startsWith("http") ? "_blank" : undefined}
            rel={upcomingDevsaEvent.url?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group block"
          >
            <div className="relative border border-[#333] bg-[#111] overflow-hidden transition-all duration-500 group-hover:border-[#fbbf24]/50">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 z-20"><AztecCorner position="top-left" /></div>
              <div className="absolute top-0 right-0 z-20"><AztecCorner position="top-right" /></div>
              <div className="absolute bottom-0 left-0 z-20"><AztecCorner position="bottom-left" /></div>
              <div className="absolute bottom-0 right-0 z-20"><AztecCorner position="bottom-right" /></div>

              <div className="grid lg:grid-cols-2">
                {/* Visual side */}
                <div className="relative h-56 sm:h-64 lg:h-auto lg:min-h-80 overflow-hidden">
                  {upcomingDevsaEvent.video ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    >
                      <source src={upcomingDevsaEvent.video} type="video/mp4" />
                    </video>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-linear-to-br from-[#ff9900]/20 via-[#0a0a0a] to-[#00f2ff]/20" />
                      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#ff9900]/30 blur-3xl rounded-full animate-pulse" />
                          <Tv className="relative w-16 h-16 sm:w-20 sm:h-20 text-[#ff9900]/60" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-[#111] lg:block hidden" />
                  <div className="absolute inset-0 bg-linear-to-t from-[#111] via-transparent to-transparent lg:hidden" />
                  <div className="absolute inset-0 bg-black/30" />
                  
                  {/* Status badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-2 bg-[#fbbf24] text-[#0a0a0a] font-semibold text-[10px] uppercase tracking-wider px-3 py-1.5">
                      <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full animate-pulse" />
                      Registration Open
                    </span>
                  </div>
                </div>

                {/* Content side */}
                <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                  <div className="absolute inset-0 bg-linear-to-br from-[#fbbf24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666] mb-3">
                      {formattedDate} • {upcomingDevsaEvent.location}
                    </p>
                    
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-none mb-1">
                      <span className="text-[#fbbf24]">{titleFirst}</span>
                      {titleRest && <span className="block">{titleRest}</span>}
                    </h2>
                    
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#444] mb-4">
                      DEVSA AI Conference 2026
                    </p>
                    
                    <p className="text-[#999] text-sm leading-relaxed mb-3">
                      {upcomingDevsaEvent.description}
                    </p>
                    
                    <p className="text-[#ff9900] text-xs font-medium italic leading-relaxed mb-6">
                      Where local builders shape the future of AI in San Antonio
                    </p>

                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-2 bg-[#fbbf24] text-[#0a0a0a] font-semibold text-xs uppercase tracking-wider px-5 py-2.5 transition-all group-hover:bg-[#ff9900]">
                        View Event
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
      <AztecBorder />
    </section>
  )
}
