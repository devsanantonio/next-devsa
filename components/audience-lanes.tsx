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
// - Builders: someone laughing mid-conversation with a laptop open beside
//   them. It replaced a wider, cooler frame of two people at a distance. At
//   the ~380px this renders, warmth and a face carry further than a correct
//   but static tableau, and the laptop keeps the slot saying "build" rather
//   than only "meet".
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
    /* The verticals are named, deliberately.
    
       This read "20+ specialty groups", which is the organisation's word for
       them, not the reader's. Nobody identifies as someone who attends a
       specialty group; they identify as someone who is into Python, or Linux,
       or game design. Naming them is what turns this lane from a description
       of DEVSA into a way for a reader to find themselves — which is the only
       funnel DEVSA runs.
    
       Prose, not data. Community records carry no category field (see
       `Community` in lib/firebase-admin.ts), so this list does not update when
       a group is added. It is a sample and reads as one; the calendar and
       /buildingtogether are the complete, live answer.
    
       Every term was checked against the live descriptions in the admin and
       maps to at least one real group:
    
         Linux / open source  Linux San Antonio, Red Hat User Group
         Python               Alamo Python
         .NET                 .NET User Group
         game design          Greater Gaming Society, Unreal Engine SA
         UX                   UXSA
         design               UXSA, Unreal Engine SA
         AI                   Alamo City AI, AITX
         agents               Alamo Agents, Alamo City AI, Alamo Tech Collective
         data engineering     Datanauts, Alamo Regional Data Alliance
         security             DEF CON Group SATX, OWASP, SAHA, Locksport
         AWS                  AWS User Group
         Google               Google Developer Group
    
       If a term here ever stops having a group behind it, cut it. A named
       vertical with nothing to click through to is worse than an unnamed one.
    
       "agents" is listed separately from "AI" because it is its own scene here
       rather than a subheading of one — Alamo Agents exists for it specifically
       ("Where Texas builds agent systems… agent systems, workflows, and tools"),
       and these groups have been running the agents, harness and software
       factory events the site spotlights.
    
       "creative" is in the list and "volunteering" and "socials" are not, and
       that is a judgement rather than an oversight.
    
       "design", not "creative", and the difference is whether a group exists.
       Design is served by UXSA and by Unreal Engine SA, whose description asks
       for an "artist, programmer, designer, animator". Creative — in the sense
       of creators, storytellers and brand people — is served by The Model,
       which is "for creators, creatives, founders and builders", and by The
       Creative Futures, a partner. Both real, neither a specialty group. This
       list promises groups, so a reader following "creative" would have found
       nothing to join. The Model's own card on the homepage carries that
       audience, which is where it is true.
    
       Volunteering is real and valuable — Project Quest (workforce training)
       and Youth Code Jam (K-12 computer science) are partners whose programmes
       this audience can give time to. But it answers "how can I contribute",
       not "what am I into", and both are partners rather than specialty groups.
       Dropping it between Python and AI would make the list answer two
       questions at once and do neither well.
    
       Socials are the same shape. Geeks && {...} is a real group — "events that
       are both social and educational" — but "socials" is a format, not a
       subject, and formats belong to the calendar, which already shows them.
    
       One caveat on that row: Alamo Tech Collective's description in the admin
       says only that it is "backed by Zelifcam, a local software company…
       creating jobs, developing talent, and building resources". Nothing about
       agents. Alamo Agents and Alamo City AI carry the term on their own, so it
       is honest as listed — but a reader following "agents" through to Alamo
       Tech Collective will not find it confirmed there. Worth a sentence in
       that record. */
    body: "Python, Linux and open source, .NET, AI, agents, game design, UX, design, data engineering, security, AWS, Google — 20+ specialty groups, every meetup and workshop in one calendar. Find the ones that match what you're actually into.",
    cta: "Build Your Network",
    href: "/events",
    accent: "text-[#00b2a9]",
    image: "/photos/lane-shebuilds.webp",
    imageAlt: "A builder laughing mid-conversation beside an open laptop at SheBuilds",
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
    /* The altitude, not the aggregate.
    
       This read "Reach the whole ecosystem from one place — 20+ specialty
       community groups and the builders and learners inside them. The simplest
       way to connect with your people and back their future." Three problems:
       the count was stale against twenty-three and is the last hardcoded one
       the homepage carried; "the simplest way to connect with your people" is
       the vague register everything else on this site has shed; and it sold
       breadth, which is the vocabulary of a lead list.
    
       What a partner cannot buy elsewhere is the altitude — they already have
       the director and executive relationships in these industries, and what
       they do not have is the frontline. That is the argument PartnerCta makes
       in full, so the lane makes it in short and hands off, which is what a
       lane is for. No number: a count would have to be fetched client-side on
       a page that is a client tree, for one word, and /buildingtogether and
       /events both carry the live figure already.
    
       The href is the anchor rather than the page, so the handoff lands on the
       section that finishes the thought instead of the top of a long page. */
    body: "You already have the director and executive relationships in these industries. This is the other altitude — the engineers, analysts, designers and students doing the work day to day, in every community group in the city.",
    cta: "Become a partner",
    href: "/buildingtogether#partner",
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
