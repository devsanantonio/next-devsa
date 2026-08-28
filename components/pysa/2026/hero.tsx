"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import { SastwLockup } from "@/components/pysa/2026/cobrand-row"
import { MascotClip } from "@/components/pysa/2026/mascot-clip"
import { disabledSlot, primaryButton } from "@/components/pysa/2026/button-styles"
import {
  PYSA_2026,
  PYSA_COLORS,
  PYSA_WORDMARK,
  type CfsPhase,
} from "@/data/pysa/2026"

/**
 * Feathers the clip's left edge — the one facing the copy — so its box never
 * reads as a seam against the page.
 *
 * Kept shallow (opaque by 22%) on purpose: the mascot starts the loop left of
 * where he settles and drifts right across it, so a deep fade here erases him
 * for the opening seconds of every pass. (This used to say he walks in from
 * off-frame — that was true of the untrimmed take; the clip now starts with
 * him already on stage, but he is still at his leftmost there.)
 *
 * Deliberately one layer, too. Two gradients with mask-composite needs
 * `intersect` alongside the legacy `-webkit-mask-composite: source-in`, and the
 * two do not mean the same thing — combining them masked the figure almost
 * away. Top and bottom need no help: the section's vertical vignette covers
 * them, and the box is aspect-matched so there is no letterbox edge.
 */
const VIDEO_MASK = "linear-gradient(to right, transparent 0%, black 22%, black 100%)"

/**
 * The mobile counterpart. There the clip runs full-bleed inside the copy flow,
 * so the edges that need help are the horizontal ones — this melts them into
 * the page instead of leaving the frame sitting on it like a card.
 *
 * One layer again, for the reason above: the left and right edges are the
 * viewport's own, so nothing has to be composited across two gradients.
 */
const MOBILE_MASK =
  "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)"

/**
 * PySanAntonio II hero.
 *
 * The primary CTA is a slot rather than a fixed button: while the call for
 * speakers is open it drives submissions, and once it closes the same slot
 * becomes the attendee path. That swap is driven by `phase`, which the page
 * derives from CFS_CLOSES — nobody has to remember to edit this in August.
 */
export function PysaHero({
  phase,
  daysLeft,
}: {
  phase: CfsPhase
  /**
   * Computed on the server. The page revalidates hourly, so a whole-day count
   * is never meaningfully stale — and passing it in beats a mount effect,
   * which would both trip react-hooks/set-state-in-effect and flash an empty
   * line on first paint.
   */
  daysLeft: number
}) {
  const isOpen = phase === "open"

  return (
    <section
      id="top"
      data-bg-type="dark"
      /* min-h-dvh from sm up only: filling the viewport is a desktop goal, and
         on a phone the column is already tall enough that forcing a full
         viewport only adds dead space above and below the copy. */
      className="relative flex flex-col justify-center overflow-hidden bg-[#0a0a0a] text-white sm:min-h-dvh"
    >
      {/* Blue wash behind the mascot, echoing the guitar. Desktop only: it is
          sized and placed for the figure bled off the right edge, and on a
          phone — where the clip sits in the copy flow instead — all it does is
          lift the background's blue channel from 10 to 15 down the right half,
          which reads as a stray glow with a visible edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-1/4 hidden h-140 w-140 rounded-full opacity-30 blur-[120px] sm:block"
        style={{
          background: `radial-gradient(circle, ${PYSA_COLORS.blue} 0%, transparent 65%)`,
        }}
      />

      {/* Mascot clip, bled off the right rather than boxed in a card.
          Desktop only — the phone gets its own copy further down, in the copy
          flow. Both pull the same 900 KB file, so neither placement is the
          expensive one any more.

          The box carries the clip's own 1114:720 ratio and is centred
          vertically rather than stretched to the section height. That way
          object-cover fills it exactly — no letterboxing, so VIDEO_MASK's edge
          lands on the picture's edge instead of leaving a hard line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 hidden aspect-1114/720 w-[78%] -translate-y-1/2 select-none sm:block lg:w-[64%] xl:w-[58%]"
      >
        <MascotClip
          className="h-full w-full object-cover"
          style={{ maskImage: VIDEO_MASK, WebkitMaskImage: VIDEO_MASK }}
        />
      </div>

      {/* Left-to-right scrim: opaque under the copy, clear over the figure. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.9) 32%, rgba(10,10,10,0.35) 58%, rgba(10,10,10,0) 80%)",
        }}
      />
      {/* Vertical vignette — settles the figure under the navbar and fades
          its boots into the call-for-speakers section below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]"
      />

      <div className="page-shell relative z-20 pb-20 pt-24 md:pb-24 md:pt-32">
        <div className="max-w-xl xl:max-w-2xl">
          {/* Only the transform animates in. Fading from opacity:0 would ship
              the headline and the primary CTA invisible in the server HTML,
              leaving the hero blank if hydration is slow or fails. */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5 sm:gap-6"
          >
            <div className="flex flex-col gap-4 sm:gap-5">
              {/* The event's own name leads. "Part of …" is a qualifier, so it
                  follows the headline rather than introducing it — otherwise
                  the modifier lands before the noun, and two display wordmarks
                  end up stacked back to back competing for first glance. */}
              <div className="flex flex-col gap-3">
                {/* The wordmark is art, not type — Amador is Adobe-Fonts-only,
                    so it cannot be set live. The alt text carries the name and
                    "returns." stays real text, which keeps the h1 meaningful to
                    screen readers and search engines. */}
                <h1 className="flex flex-col items-start gap-1 font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] md:text-5xl lg:text-6xl xl:text-7xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PYSA_WORDMARK.svgDark}
                    alt="PySanAntonio"
                    width={PYSA_WORDMARK.width}
                    height={PYSA_WORDMARK.height}
                    className="h-auto w-full max-w-[26rem] lg:max-w-[32rem] xl:max-w-[38rem]"
                  />
                  <span className="font-light italic" style={{ color: PYSA_COLORS.blue }}>
                    returns October 2026
                  </span>
                </h1>

                <SastwLockup />
              </div>

              {/* Phones get the clip here, in the copy flow between the week
                  lockup and the pitch, rather than beside the copy — there is
                  no room for it beside anything at this width.

                  No corners, no ring, and -mx-6 breaks it out of the page
                  gutter (1.5rem at this width, and it never renders wider) so
                  there are no side edges at all. The clip's own frame is
                  already near-black at every edge — within a few points of the
                  page — so with MOBILE_MASK melting the top and bottom, the
                  only thing left on screen is the mascot. */}
              <MascotClip
                className="-mx-6 aspect-1114/720 w-auto object-cover sm:hidden"
                style={{ maskImage: MOBILE_MASK, WebkitMaskImage: MOBILE_MASK }}
              />

              <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg md:text-xl">
                San Antonio&apos;s Python conference is back for a second year —
                an afternoon of{" "}
                <strong className="font-semibold text-white">
                  learning, networking, and community building
                </strong>{" "}
                with the people already doing the work here.
              </p>
            </div>

            {/* Date / time / place rail */}
            <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/60">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" style={{ color: PYSA_COLORS.blue }} />
                <dt className="sr-only">Date</dt>
                <dd>{PYSA_2026.dateLabel}</dd>
              </div>
              <div className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: PYSA_COLORS.blue }} />
                <dt className="sr-only">Time</dt>
                <dd>{PYSA_2026.timeLabel}</dd>
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: PYSA_COLORS.blue }} />
                <dt className="sr-only">Location</dt>
                <dd>
                  {PYSA_2026.venue}, {PYSA_2026.venueDetail}
                </dd>
              </div>
            </dl>

            {/* CTA slot — swaps with the call's phase. Single action on
                purpose: last year's recap is reachable from the archive card
                further down, and it was competing here. */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {isOpen ? (
                  <Link href="#call-for-speakers" className={primaryButton}>
                    Submit a talk
                  </Link>
                ) : (
                  <span className={disabledSlot}>Speaker lineup coming soon</span>
                )}
              </div>

              {isOpen && (
                <p className="text-sm text-white/50">
                  {daysLeft === 0 ? (
                    <>Submissions close <span className="font-semibold text-white">today</span>.</>
                  ) : (
                    <>
                      Submissions close in{" "}
                      <span className="font-semibold" style={{ color: PYSA_COLORS.yellow }}>
                        {daysLeft} {daysLeft === 1 ? "day" : "days"}
                      </span>{" "}
                      — September 11, 2026.
                    </>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade into the call for speakers, matching the hero treatment
          on /buildingtogether. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-linear-to-t from-[#0a0a0a] to-transparent"
      />
    </section>
  )
}
