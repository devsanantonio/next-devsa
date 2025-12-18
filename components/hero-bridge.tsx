"use client"

import { motion } from "motion/react"

export function HeroBridge() {
  const words = ["Your", "Direct", "Connection"]
  const subtitleWords = ["to", "the", "Tech", "Community"]

  return (
    <section 
      id="hero-bridge" 
      className="w-full relative min-h-dvh flex flex-col overflow-hidden bg-white"
      data-bg-type="light"
    >
      {/* Background image - responsive sizing */}
      <div 
        className="absolute inset-0 bg-contain scale-180 md:scale-100 md:bg-cover bg-center bg-no-repeat z-1"
        style={{
          backgroundImage: "url('https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-8-hero+(1).png')",
        }}
      />

      {/* Hidden H1 for SEO - visually hidden but accessible */}
      <h1 className="sr-only">
        {words.join(' ')} {subtitleWords.join(' ')}
      </h1>

      {/* Spacer to push content to bottom */}
      <div className="flex-1" />

      {/* Bottom text - anchored to bottom */}
      <div className="relative z-10 pb-10 sm:pb-12 lg:pb-16 px-6 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Animated divider line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 sm:w-20 h-0.5 mx-auto mb-8 bg-linear-to-r from-[#f59e0b] via-[#fbbf24] to-[#fcd34d] rounded-full origin-center"
          />

          {/* Main message */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold text-slate-900 text-2xl sm:text-3xl lg:text-4xl mb-4 tracking-tight leading-tight"
          >
            You&apos;re absolutely right!
          </motion.h2>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto"
          >
            DEVSA bridges the gap between passionate builders, local partners, and the growing tech ecosystem in&nbsp;San&nbsp;Antonio.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
