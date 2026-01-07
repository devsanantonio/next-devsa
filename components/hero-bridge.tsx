"use client"

import { motion } from "motion/react"
import Image from "next/image"

export function HeroBridge() {
  return (
    <section
      id="hero-bridge"
      className="w-full relative h-dvh flex flex-col items-center justify-center overflow-hidden bg-white px-4 sm:px-6"
      data-bg-type="light"
    >
      {/* Hidden H1 for SEO - visually hidden but accessible */}
      <h1 className="sr-only">
        Your Direct Connection to the Tech Community
      </h1>

      {/* Hero Image - Takes up available space but constrained */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-[calc(100%+3rem)] -mx-6 sm:w-[calc(100%+4rem)] sm:-mx-8 md:w-full md:mx-0 md:-mt-32 max-w-none sm:max-w-none md:max-w-4xl lg:max-w-6xl shrink-0"
      >
        <Image
          src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-8-hero+(1).png"
          alt="DEVSA - Your Direct Connection to the Tech Community"
          width={1200}
          height={600}
          priority
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Text content - directly below image */}
      <div className="-mt-4 sm:-mt-8 md:-mt-48 w-full max-w-3xl text-center shrink-0 px-2">
        {/* Animated divider line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-12 sm:w-16 h-0.5 sm:h-1 mx-auto mb-3 sm:mb-6 bg-linear-to-r from-[#f59e0b] via-[#fbbf24] to-[#fcd34d] rounded-full origin-center"
        />

        {/* Main message */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-bold text-slate-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-4 tracking-tight leading-tight"
        >
          You&apos;re absolutely right!
        </motion.h2>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto"
        >
          DEVSA bridges the gap between passionate builders, local partners, and the growing tech ecosystem in&nbsp;San&nbsp;Antonio.
        </motion.p>
      </div>
    </section>
  )
}
