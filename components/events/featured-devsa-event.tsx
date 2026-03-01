"use client"
import { motion } from "motion/react"
import { upcomingDevsaEvent } from "@/data/events"
import Link from "next/link"
import Image from "next/image"

// Python-inspired geometric pattern for background
function PyTexasBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#306998 1px, transparent 1px),
            linear-gradient(90deg, #306998 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#306998]/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#FFD43B]/5 blur-[150px]" />
    </div>
  )
}

export function FeaturedDevsaEvent() {
  if (!upcomingDevsaEvent) {
    return (
      <section className="relative bg-[#0a0a0a] overflow-hidden" data-bg-type="dark">
        <PyTexasBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#e5e5e5] sm:text-4xl lg:text-5xl leading-[1.1]">
              Featured <span className="text-[#306998]">Event</span>
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

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" data-bg-type="dark">
      <PyTexasBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold tracking-tight text-[#e5e5e5] sm:text-4xl lg:text-5xl leading-[1.1]"
          >
            Featured <span className="text-[#306998]">Event</span>
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
            <div className="relative border border-[#333] bg-[#111] overflow-hidden transition-all duration-500 group-hover:border-[#FFD43B]/50">
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
                      <div className="absolute inset-0 bg-white" />
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <Image
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pytexas2026_day_color.svg"
                          alt="PyTexas 2026"
                          width={400}
                          height={400}
                          className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-[#111] lg:block hidden" />
                  <div className="absolute inset-0 bg-linear-to-t from-[#111] via-transparent to-transparent lg:hidden" />
                  <div className="absolute inset-0 bg-black/30" />
                  
                  {/* Status badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-2 bg-[#FFD43B] text-[#0a0a0a] font-semibold text-[10px] uppercase tracking-wider px-3 py-1.5">
                      <span className="w-1.5 h-1.5 bg-[#306998] rounded-full animate-pulse" />
                      Celebrating 20 Years
                    </span>
                  </div>
                </div>

                {/* Content side */}
                <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                  <div className="absolute inset-0 bg-linear-to-br from-[#FFD43B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666] mb-3">
                      {formattedDate} • {upcomingDevsaEvent.location}
                    </p>
                    
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-none mb-1">
                      <span className="text-[#FFD43B]">PyTexas Conference</span>
                      <span className="block">2026</span>
                    </h2>
                    
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#444] mb-4">
                      Celebrating 20 Years of Python in Texas
                    </p>
                    
                    <p className="text-[#999] text-sm leading-relaxed mb-3">
                      {upcomingDevsaEvent.description}
                    </p>
                    
                    <p className="text-[#306998] text-xs font-medium italic leading-relaxed mb-6">
                      The largest gathering of Python developers in the state of Texas
                    </p>

                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-2 bg-[#FFD43B] text-[#0a0a0a] font-semibold text-xs uppercase tracking-wider px-5 py-2.5 transition-all group-hover:bg-[#306998] group-hover:text-white">
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
    </section>
  )
}
