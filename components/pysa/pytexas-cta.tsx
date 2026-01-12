"use client"

import { motion } from "motion/react"
import Link from "next/link"
import Image from "next/image"

export default function PyTexasCTA() {
  return (
    <section className="relative w-full h-75 md:h-202.5 flex items-end justify-center overflow-hidden" data-bg-type="dark">
      {/* Background SVG Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pytexas2026_day_color.svg"
          alt="PyTexas 2026"
          fill
          className="object-contain md:object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center p-4 pb-8 md:p-16 lg:p-20 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="https://www.pytexas.org/2026/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 md:h-12 items-center justify-center overflow-hidden rounded-full bg-[#FFD43B] px-4 md:px-8 font-bold text-xs md:text-base text-[#0a0a0a] transition-all hover:bg-[#FFD43B]/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD43B] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] shadow-lg shadow-[#FFD43B]/30"
          >
            <span>Learn More</span>
            <svg
              className="w-4 h-4 md:w-6 md:h-6 ml-1.5 md:ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
