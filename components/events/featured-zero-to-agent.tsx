"use client"
import { motion } from "motion/react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

function AgentGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glow accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/2 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-white/1.5 blur-[150px]" />
    </div>
  )
}

export function FeaturedZeroToAgent() {
  return (
    <section className="relative bg-black overflow-hidden" data-bg-type="dark">
      <AgentGridBackground />

      {/* Top accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

      <div className="mt-6 relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-2 border border-white/10 bg-white/3 px-3 py-1.5">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="white" className="animate-pulse"><polygon points="6,0 12,12 0,12" /></svg>
              <span className="font-geist-pixel-square text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                Featured Event
              </span>
            </span>
          </div>

          <h2 className="text-white leading-none text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Zero to <span className="font-geist-pixel-square">Agent</span>
            <span className="block text-white/40 text-xl sm:text-2xl md:text-3xl mt-2 font-normal tracking-wide">San Antonio</span>
          </h2>
        </motion.div>

        {/* Event Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="-mt-2 relative border border-white/10 bg-white/2 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Image side */}
              <div className="relative h-52 sm:h-60 lg:h-auto lg:min-h-80 overflow-hidden bg-black">
                <Image
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/v-c-v.png"
                  alt="Zero to Agent — San Antonio"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-r from-transparent to-black/80 hidden lg:block" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent lg:hidden" />
              </div>

              {/* Content side */}
              <div className="relative p-5 sm:p-6 lg:p-8 flex flex-col justify-center">

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="space-y-2">
                    <p className="font-geist-pixel-square text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                      Date & Time
                    </p>
                    <p className="font-geist-mono text-white text-sm sm:text-base leading-relaxed">
                      April 25, 2026 &middot; 12:00 PM – 2:30 PM CT
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-geist-pixel-square text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                      Location
                    </p>
                    <p className="font-geist-mono text-white text-sm sm:text-base leading-relaxed">
                      Geekdom &middot; 3rd Floor
                    </p>
                    <p className="font-geist-mono text-white/40 text-xs sm:text-sm">
                      San Antonio, TX
                    </p>
                  </div>

                  <div className="h-px w-full bg-white/10 my-4" />

                  <p className="text-white/60 text-sm sm:text-base leading-7 max-w-md">
                    DEVSA is the San Antonio community partner for{" "}
                    <span className="text-white font-semibold">Zero to Agent</span>—a
                    10-day global build week. We&apos;re bringing v0 by Vercel 
                    to the heart of downtown at{" "}
                    <span className="text-white font-semibold">Geekdom</span>.
                  </p>
                  <p className="text-white/60 text-sm sm:text-base leading-7 max-w-md">
                    From idea to deployed agent, this is your chance to ship something real.
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="https://luma.com/hwfvt791"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 bg-white text-black font-semibold text-sm uppercase tracking-wider px-6 py-3 transition-all hover:bg-white/90 active:scale-[0.98] w-fit"
                >
                  <span className="font-geist-pixel-square">
                    Register
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                <p className="mt-4 font-geist-pixel-grid text-[10px] font-medium text-white/40 uppercase tracking-[0.15em] leading-normal">
                  Powered by Vercel &middot; Hosted by DEVSA
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />
    </section>
  )
}
