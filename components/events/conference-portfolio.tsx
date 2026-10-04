"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { conferences, type Conference } from "@/data/conferences"
import { getEventBrand } from "@/lib/event-brands"

/**
 * The conferences DEVSA owns, as a portfolio.
 *
 * The page already ends on "Watch Past Conferences", which is a video shelf —
 * a conference appears there once there is footage. That left The Model and
 * Access Granted nowhere: both became official DEVSA events the week they ran
 * and neither has a recording, so the site never said DEVSA runs them.
 *
 * So this band answers a different question. Not "what can I watch" but "what
 * does this organisation put on", which is the question a partner, a speaker
 * or an organiser is actually asking. It sits above the archive for that
 * reason: the standing brands first, the tape second.
 *
 * Each card borrows its accent from lib/event-brands.ts, the same registry the
 * calendar cards read, so a conference looks like itself in both places and a
 * colour can only be changed in one file. More Human Than Human is not in that
 * registry and carries its own — see the note on its record.
 */
function accentOf(conference: Conference): string {
  const brand = getEventBrand(conference.brand)
  return brand?.accent ?? conference.accent ?? "#ffffff"
}

function ConferenceCard({
  conference,
  index,
}: {
  conference: Conference
  index: number
}) {
  const accent = accentOf(conference)
  const isHistory = conference.status === "history"

  const inner = (
    <>
      {/* The accent as a rule rather than a fill. Four saturated panels in a
          row stopped reading as four conferences and started reading as a
          palette; a hairline gives each one its colour without the grid
          turning into swatches. */}
      <span
        aria-hidden
        className="block h-0.5 w-10 rounded-full"
        style={{ backgroundColor: accent }}
      />

      <div className="mt-5 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-balance font-sans text-xl md:text-2xl font-black tracking-[-0.02em] text-white">
            {conference.name}
          </h3>
          {isHistory && (
            <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
              Archive
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-white/60">
          {conference.blurb}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/35">
          {/* "Last held" on a brand that is coming back would read as an
              ending, and "Next" would promise a date nobody has set yet. */}
          {isHistory ? "Held" : "Most recently"} {conference.lastRun}
          {" · "}
          {conference.venue}
        </p>

        {conference.href && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
            Event page
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/conf:translate-x-0.5 group-hover/conf:-translate-y-0.5" />
          </span>
        )}
      </div>
    </>
  )

  const shell =
    "group/conf flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-200"

  return (
    <motion.div
      initial={{ y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="h-full"
    >
      {conference.href ? (
        <Link
          href={conference.href}
          className={`${shell} hover:border-white/20 hover:bg-white/[0.06]`}
        >
          {inner}
        </Link>
      ) : (
        /* No page, so no link. A card that looks clickable and is not is worse
           than one that plainly is not — More Human's page came down with the
           conference, and its footage lives in the archive band below. */
        <div className={shell}>{inner}</div>
      )}
    </motion.div>
  )
}

export function ConferencePortfolio() {
  return (
    <section
      id="conferences"
      className="scroll-mt-20 w-full bg-[#0a0a0a]"
      data-bg-type="dark"
    >
      <div className="page-shell py-16 sm:py-20 md:py-24">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-4"
        >
          <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/40">
            Conferences
          </p>
          <h2 className="text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
            The Ones{" "}
            <span className="text-white/50 font-light italic">We</span> Run.
          </h2>
          <p className="text-lg md:text-xl font-light leading-[1.45] text-white/65">
            Not the community calendar — these are DEVSA&apos;s own, built here
            and coming back.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
          {conferences.map((conference, i) => (
            <ConferenceCard
              key={conference.key}
              conference={conference}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
