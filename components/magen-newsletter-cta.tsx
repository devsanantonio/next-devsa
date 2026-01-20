"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function MagenNewsletterCTA() {
  return (
    <section className="relative bg-white py-16 sm:py-24 overflow-hidden" data-bg-type="light">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ef426f]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f59e0b]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16 md:text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Community Spotlight
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 bg-linear-to-r from-[#f59e0b] to-[#fbbf24] rounded-full" />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          
          {/* Left Column - Magen Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="flex items-center gap-4 mb-6 ml-3">
              <div className="relative h-12 w-24 shrink-0">
                <Image
                  src="/magen-logo.png"
                  alt="Magen"
                  fill
                  className="object-contain object-left scale-160"
                />
              </div>
              <div className="-ml-8 h-px flex-1 bg-linear-to-r from-[#f59e0b]/30 to-transparent" />
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Secured by{" "}
              <Link 
                href="https://magentrust.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#f59e0b] hover:text-[#fbbf24] transition-colors underline decoration-2 underline-offset-4"
              >
                Magen Trust
              </Link>
            </h2>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Experience bot protection without the disruption. Our web platform is proudly using San Antonio&apos;s own MAGEN to keep the DEVSA community human-first.
            </p>

            <Link
              href="https://magentrust.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#b45309] font-semibold hover:text-[#92400e] transition-colors group"
            >
              Learn more about Magen
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Right Column - PyTexas Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative h-12 w-24 shrink-0">
                <Image
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pytexas2026_day_color.svg"
                  alt="PyTexas 2026"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <div className="h-px flex-1 bg-linear-to-r from-[#306998]/30 to-transparent" />
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Celebrating{" "}
              <Link 
                href="https://www.pytexas.org/2026/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#306998] hover:text-[#FFD43B] transition-colors underline decoration-2 underline-offset-4"
              >
                20 Years
              </Link>
            </h2>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              April 17–19, 2026 in Austin, TX — Join the largest gathering of Python developers in Texas for three days of software development, data science, and community.
            </p>

            <Link
              href="https://www.pytexas.org/2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#306998] font-semibold hover:text-[#1e4a6d] transition-colors group"
            >
              Learn more about PyTexas
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
