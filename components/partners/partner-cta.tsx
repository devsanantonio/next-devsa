"use client"

import { motion } from "motion/react"
import { Handshake, Mail, ArrowRight } from "lucide-react"

const useCases = [
  "Collaborative workshops & training series",
  "Co-branded conferences and events",
  "Programs reaching 20+ tech communities",
  "Custom collaborations with local builders",
]

export function PartnerCta() {
  return (
    <section className="bg-black border-b border-gray-800" data-bg-type="dark">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: intro text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
                Partner with DEVSA
              </p>
              <h2 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Build Programs With the{" "}
                <span className="text-white/50 font-light italic">
                  Ecosystem
                </span>
                .
              </h2>
            </div>

            <div className="space-y-6 max-w-lg mt-8">
              <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
                Workshops, conferences, and recurring programs —{" "}
                <strong className="font-semibold text-white">
                  co-designed with DEVSA
                </strong>
                , reaching 20+ tech communities across San&nbsp;Antonio.
              </p>
              <p className="text-base md:text-lg text-white/50 leading-relaxed">
                One relationship, one bridge to the whole ecosystem. Let&apos;s
                design something together.
              </p>
            </div>
          </motion.div>

          {/* Right: contact card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center"
          >
            <div className="w-full max-w-md rounded-2xl bg-white/4 border border-white/8 p-6 sm:p-8 space-y-6">
              {/* Use cases */}
              <div>
                <p className="text-xs md:text-sm font-medium text-white/40 uppercase tracking-[0.15em] mb-4">
                  Ways We Partner
                </p>
                <ul className="space-y-3">
                  {useCases.map((useCase) => (
                    <li
                      key={useCase}
                      className="flex items-start gap-3 text-sm md:text-base text-white/70 leading-relaxed"
                    >
                      <span className="block w-1.5 h-1.5 rounded-full bg-[#ef426f] mt-2 shrink-0" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-2">
                <a
                  href="mailto:partner@devsa.community?subject=Partner%20with%20DEVSA"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef426f] hover:bg-[#d93a62] text-white font-semibold py-3.5 text-base transition-colors"
                >
                  <Handshake className="h-5 w-5" />
                  Partner With Us
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
                <a
                  href="mailto:sponsor@devsa.community?subject=Sponsor%20a%20DEVSA%20event"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium py-3.5 text-sm md:text-base transition-all"
                >
                  <Mail className="h-4 w-4" />
                  Sponsor an Event
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
