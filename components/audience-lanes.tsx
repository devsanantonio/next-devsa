"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

type Lane = {
  eyebrow: string
  headlineLead: string
  headlineItalic: string
  headlineTail: string
  body: string
  cta: string
  href: string
  accent: string
}

const lanes: Lane[] = [
  {
    eyebrow: "For Builders",
    headlineLead: "Find Your ",
    headlineItalic: "Community",
    headlineTail: ".",
    body: "Discover meetups, conferences, and workshops happening every week across San Antonio's tech community.",
    cta: "Build Your Network",
    href: "/events",
    accent: "text-white/60",
  },
  {
    eyebrow: "For Organizers",
    headlineLead: "Grow Your ",
    headlineItalic: "Group",
    headlineTail: ".",
    body: "Run a tech group in San Antonio? Get organizer access — list your group on Building Together and add events to the community calendar.",
    cta: "Start your group",
    href: "/signin",
    accent: "text-amber-400",
  },
  {
    eyebrow: "For Partners",
    headlineLead: "Reach the ",
    headlineItalic: "Ecosystem",
    headlineTail: ".",
    body: "One relationship, 20+ communities, every conference and the citywide job board — all backed by a single 501(c)(3) bridge.",
    cta: "Become a partner",
    href: "/buildingtogether",
    accent: "text-[#ef426f]",
  },
]

function LaneCard({ lane, index }: { lane: Lane; index: number }) {
  const isExternal = lane.href.startsWith("mailto:") || lane.href.startsWith("http")

  const inner = (
    <div className="flex flex-col h-full space-y-5 md:space-y-6">
      <p
        className={`text-xs font-medium uppercase tracking-[0.2em] ${lane.accent}`}
      >
        {lane.eyebrow}
      </p>
      <h3 className="text-balance font-sans text-white leading-[1.05] text-2xl md:text-3xl lg:text-[2.25rem] font-black tracking-[-0.02em]">
        {lane.headlineLead}
        <span className="text-white/55 font-light italic">
          {lane.headlineItalic}
        </span>
        {lane.headlineTail}
      </h3>
      <p className="flex-1 text-base text-white/65 leading-relaxed">
        {lane.body}
      </p>
      <div className="inline-flex items-center gap-2 text-sm font-medium text-white pt-2">
        {lane.cta}
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </div>
  )

  const className =
    "group block h-full rounded-2xl bg-neutral-900 border border-neutral-800 p-6 md:p-8 transition-all duration-200 hover:bg-neutral-900/70 hover:border-neutral-700"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
    >
      {isExternal ? (
        <a href={lane.href} className={className}>
          {inner}
        </a>
      ) : (
        <Link href={lane.href} className={className}>
          {inner}
        </Link>
      )}
    </motion.div>
  )
}

export function AudienceLanes() {
  return (
    <section
      id="audience-lanes"
      className="w-full bg-neutral-950 py-16 md:py-24 relative overflow-hidden"
      data-bg-type="dark"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm md:text-base font-medium text-white/50 uppercase tracking-[0.2em]">
              Who DEVSA Serves
            </p>
            <h2 className="text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Three Audiences,{" "}
              <span className="text-white/55 font-light italic">One</span>{" "}
              Bridge.
            </h2>
          </div>
        </motion.div>

        <div className="mt-12 md:mt-16 grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          {lanes.map((lane, i) => (
            <LaneCard key={lane.eyebrow} lane={lane} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
