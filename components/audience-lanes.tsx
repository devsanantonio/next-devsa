"use client"

import { motion } from "motion/react"
import Image from "next/image"
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

// Each lane's photo is matched to the audience it addresses rather than being
// generic event imagery:
//
// - Organizers: the people who run a group, stood together at their own event.
// - Partners: a panel — the institutional, on-the-record face of the ecosystem.
// - Builders: two people talking over open laptops. Chosen over the wider
//   frames in the same set because the pair fills it; the alternates put their
//   subjects at opposite edges with a stranger's back between them, which
//   reads as a room rather than a conversation.
//
// All three are 1000x625 to match the aspect-16/10 slot, cropped so faces sit
// in the upper two thirds — the card's bottom scrim darkens whatever is low in
// the frame.
const lanes: Lane[] = [
  {
    eyebrow: "For Builders",
    headlineLead: "Find Your ",
    headlineItalic: "Community",
    headlineTail: ".",
    body: "Every meetup, workshop and conference in one calendar — 20+ specialty groups and the partners behind them. The one place to find your people, build your future, and grow your network.",
    cta: "Build Your Network",
    href: "/events",
    accent: "text-[#00b2a9]",
    image: "/photos/lane-morehuman.webp",
    imageAlt: "Two builders talking over open laptops at More Human Than Human",
  },
  {
    eyebrow: "For Organizers",
    headlineLead: "Grow Your ",
    headlineItalic: "Group",
    headlineTail: ".",
    body: "Get organizer access to the admin portal: publish to the community calendar, manage event registration, and export your RSVPs. Your group keeps its own name, its own people and its own data.",
    cta: "Start your group",
    href: "/signin",
    accent: "text-[#ff8200]",
    image: "/photos/lane-aws.webp",
    imageAlt: "Organizers from the AWS User Group San Antonio at their meetup",
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
    image: "/photos/lane-techbloc.webp",
    imageAlt: "Panelists speaking at a Tech Bloc event in San Antonio",
  },
]

function LaneCard({ lane, index }: { lane: Lane; index: number }) {
  const isExternal = lane.href.startsWith("mailto:") || lane.href.startsWith("http")

  const inner = (
    <div className="flex flex-col h-full">
      {/* Human anchor — photo blends into the card via a bottom scrim */}
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <Image
          src={lane.image}
          alt={lane.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          decoding="async"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
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
      initial={{ y: 20 }}
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
      <div className="relative z-10 page-shell">
        <motion.div
          initial={{ y: 20 }}
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
