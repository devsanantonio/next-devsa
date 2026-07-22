"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

type Lane = {
  eyebrow: string
  headlineLead: string
  headlineItalic: string
  headlineTail: string
  body: string
  cta: string
  href: string
  accent: string
  image: string
  imageAlt: string
}

// Placeholder imagery — real DevSA event photos standing in until purpose-shot
// portraits are available.
const lanes: Lane[] = [
  {
    eyebrow: "For Builders",
    headlineLead: "Find Your ",
    headlineItalic: "Community",
    headlineTail: ".",
    body: "One platform, one source of truth — connecting you to 20+ specialty community groups and the partners behind them. It's the single channel to find your people, build your future, and grow your network.",
    cta: "Build Your Network",
    href: "/events",
    accent: "text-[#00b2a9]",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.jpg",
    imageAlt: "Builders connecting at a DevSA community event",
  },
  {
    eyebrow: "For Organizers",
    headlineLead: "Grow Your ",
    headlineItalic: "Group",
    headlineTail: ".",
    body: "Get organizer access to our admin portal: publish to the community calendar, manage event registration, and own your attendee data — all on the platform built for San Antonio's builders, organizers, and partners.",
    cta: "Start your group",
    href: "/signin",
    accent: "text-[#ff8200]",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/shebuilds/8O8A0023+2.jpg",
    imageAlt: "An organizer leading a DevSA workshop",
  },
  {
    eyebrow: "For Partners",
    headlineLead: "Reach the ",
    headlineItalic: "Ecosystem",
    headlineTail: ".",
    body: "Reach the whole ecosystem from one place — 20+ specialty community groups and the builders and learners inside them. The simplest way to connect with your people and back their future.",
    cta: "Become a partner",
    href: "/buildingtogether",
    accent: "text-[#ef426f]",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/0P3A9743.jpg",
    imageAlt: "Partners and community members at a DevSA conference",
  },
]

function LaneCard({ lane, index }: { lane: Lane; index: number }) {
  const isExternal = lane.href.startsWith("mailto:") || lane.href.startsWith("http")

  const inner = (
    <div className="flex flex-col h-full">
      {/* Human anchor — photo blends into the card via a bottom scrim */}
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <img
          src={lane.image}
          alt={lane.imageAlt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/10 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col space-y-5 md:space-y-6 p-6 md:p-8">
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
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  )

  const className =
    "group block h-full overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 transition-all duration-200 hover:bg-neutral-900/70 hover:border-neutral-700"

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
