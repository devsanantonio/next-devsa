"use client"

import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { PartnerStrip } from "@/components/ai-builder/partner-strip"

export function ProgramOverview() {
  return (
    <section
      data-bg-type="dark"
      className="w-full bg-neutral-950 px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 max-w-4xl font-geist-pixel-square text-3xl font-black uppercase leading-[1.15] tracking-wide text-white md:text-5xl lg:text-6xl"
        >
          Built in San Antonio.{" "}
          <span className="font-medium text-white/30">
            Operated by the partners building the ecosystem.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mb-10 max-w-3xl text-base leading-relaxed text-white/50 md:text-lg"
        >
          Digital Canvas isn&apos;t a new institution. It&apos;s a program layer
          connecting two pipelines that already exist — DEVSA&apos;s tech
          community and an accredited investor network — with industry
          underwriters in between. The infrastructure is in place. We&apos;re the
          connecting tissue.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-16"
        >
          <a
            href="https://www.digitalcanvas.community/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#88FF00] px-6 py-3 text-sm font-semibold text-neutral-900 transition-all duration-200 hover:bg-[#9dff33] hover:shadow-[0_0_24px_-4px_#88FF0080]"
          >
            Visit Digital Canvas
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>

        {/* The partners — the pipelines the program connects */}
        <div className="border-t border-white/10 pt-10">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
            The partners
          </p>
          <PartnerStrip />
        </div>
      </div>
    </section>
  )
}
