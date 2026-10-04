"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { conferences, type Conference } from "@/data/conferences"
import {
  ConferenceBand,
  accentOf,
} from "@/components/events/conference-band"

/**
 * The conferences DEVSA owns, as a portfolio.
 *
 * The page's archive band answered "what can I watch". This answers "what does
 * this organization put on", which is the question a partner, a speaker or an
 * organizer is actually asking — and the only one a conference with no footage
 * yet can appear in.
 *
 * ## Each card wears its own mark
 *
 * The first version set every name in the site's own type with a colored rule
 * above it, which made four conferences look like four rows of a table. Three
 * of them have a lettering mark of their own and the fourth has a piece of
 * motion, all of it already in this repo and none of it being used here:
 *
 *   · The Model and Access Granted through EventBrandLockup, the same
 *     component the calendar cards use, so a brand cannot read one way on the
 *     calendar and another in the portfolio.
 *   · PySanAntonio as its drawn wordmark. It is art rather than lettering —
 *     the face is Adobe-Fonts-only and cannot be set live — so the asset is
 *     the only honest way to show it.
 *   · More Human Than Human as the stack its own site set — see
 *     MoreHumanWordmark. This card used to be the exception: the rotating head
 *     from its title sequence on a loop, with the name laid over it, because
 *     this was the one conference here with no lettering. The head is still
 *     here, on hover, but it is no longer carrying the card.
 *
 * ## Four across
 *
 * An earlier pass ran two to a row, on the grounds that four left roughly 250px
 * per card and PySA's wordmark is 240px of that. Four fits once the marks are
 * scaled a notch at lg — see the band below — and four is what the section is
 * for: the whole portfolio in one glance.
 *
 * ## Every card is a mark, and every clip is on hover
 *
 * All four read as lettering at rest and all four keep their motion behind it.
 * Nothing in this grid autoplays. That is partly manners — four conference
 * tiles decoding four videos nobody has pointed at is a cost with nothing on
 * the other side of it — and partly that a card which needs motion to be
 * legible is a card that cannot be skimmed.
 */
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
      {/* The mark, on the brand's own ground. A fixed height so four cards
          line up whatever shape their lettering is, and the scale a notch down
          at lg: four across leaves each card about 305px and roughly 265px
          inside its padding, while PySanAntonio's drawn wordmark is 240px of
          that on its own. The squeeze belongs to this grid, not to the mark. */}
      <ConferenceBand
        conference={conference}
        className="h-44 px-5 sm:h-52 lg:px-4"
        markClassName="lg:scale-[0.88]"
      />

      <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="flex-1 text-sm leading-relaxed text-white/60">
            {conference.blurb}
          </p>
          {isHistory && (
            <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
              Archive
            </span>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/35">
            {/* "Last held" on a brand that is coming back would read as an
                ending, and "Next" would promise a date nobody has set yet. */}
            {isHistory ? "Held" : "Most recently"} {conference.lastRun}
            {" · "}
            {conference.venue}
          </p>

          {conference.href && (
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: accent }}
            >
              Event page
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/conf:translate-x-0.5 group-hover/conf:-translate-y-0.5" />
            </span>
          )}
        </div>
      </div>
    </>
  )

  const shell =
    "group/conf flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-200"

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
          className={`${shell} hover:border-white/20 hover:bg-white/6`}
        >
          {inner}
        </Link>
      ) : (
        /* No page, so no link. A card that looks clickable and is not is worse
           than one that plainly is not — More Human's page came down with the
           conference. */
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
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">
            Conferences
          </p>
          <h2 className="text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
            The Ones{" "}
            <span className="text-white/50 font-light italic">We</span> Run.
          </h2>
          {/* "DEVSA-led", not "DEVSA's own", which is what this said. The
              cards below each open onto a page carrying a "Powered by" row of
              partner marks, so the old line was contradicted two clicks away —
              and it took credit from the groups in those rows. */}
          <p className="text-lg md:text-xl font-light leading-[1.45] text-white/65">
            Not the community calendar — these are DEVSA-led, activated with the
            community groups and partners who build them with us.
          </p>
        </motion.div>

        {/* Four across on a desktop so the whole portfolio is one glance, two
            on a tablet, one on a phone. At a quarter of the shell each card is
            about 305px wide against roughly 450px tall, which is the portrait
            shape these want — a mark above a short block of copy. */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
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
