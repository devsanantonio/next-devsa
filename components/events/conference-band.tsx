"use client"

import type { Conference } from "@/data/conferences"
import { getEventBrand } from "@/lib/event-brands"
import { ConferenceMark } from "@/components/events/conference-mark"
import type { LockupSize } from "@/components/events/event-brand-lockup"
import {
  ConferenceCipherField,
  ConferenceHoverClip,
  ConferenceMascots,
} from "@/components/events/conference-card-fx"

export function accentOf(conference: Conference): string {
  const brand = getEventBrand(conference.brand)
  return brand?.accent ?? conference.accent ?? "#ffffff"
}

export function surfaceOf(conference: Conference): string {
  return getEventBrand(conference.brand)?.surface ?? "#0a0a0a"
}

/**
 * One conference's mark on its own ground, with the play that brand brought
 * with it from next-sasw's /schedule.
 *
 * Each effect is keyed off the brand rather than offered to every conference:
 * the cipher field is Access Granted's subject, the mascots are The Model's,
 * the luchador is PySanAntonio's and the rotating head is More Human's. A
 * conference wearing one of the others' would be an effect for its own sake.
 *
 * ## The layer order is load-bearing
 *
 * The effects go before the mark, and that placement is not tidiness. Each is
 * absolutely positioned while the mark is a static block, and within one
 * stacking context a positioned element paints above a static one whatever the
 * DOM order — so the mark carries an explicit `z-2` to climb back over them.
 * Without it the ciphertext lies across Access Granted's lettering and the
 * clips bury the wordmarks, which is the one thing here that may not be
 * covered. The mascots are the exception and come after, because they are the
 * one effect meant to pass in front of the lettering; they walk over the
 * wordmark on next-sasw's band too.
 *
 * ## Why it is shared
 *
 * This was the top half of a ConferencePortfolio card until the homepage grew a
 * conferences section that wanted the same thing at a different size. Two
 * copies of this would be two places to register a fifth conference's effect,
 * and the failure would be silent — one surface animating and the other not.
 *
 * The caller owns the box: `className` sets the height and padding, and
 * `markClassName` the scale, because the portfolio's four-up grid is tighter
 * than the homepage's and the squeeze belongs to whichever grid is doing it.
 */
export function ConferenceBand({
  conference,
  className = "",
  markClassName = "",
  markSize = "card",
  ground = "brand",
}: {
  conference: Conference
  className?: string
  markClassName?: string
  /** See LOCKUP_SIZES in event-brand-lockup. */
  markSize?: LockupSize
  /**
   * `brand` paints the conference's own surface behind the mark, which is what
   * makes a portfolio card read as a card.
   *
   * `none` leaves it transparent, for the homepage, where the tiles are not
   * meant to read as boxes at all. With a border and a brand ground they would
   * — and worse, inconsistently: three of the four surfaces are #0a0a0a, the
   * same value as the section behind them, while The Model's is #09090B. On a
   * borderless row that one point of difference showed up as a single faint
   * rectangle among three invisible ones, which looks like a bug rather than a
   * choice. Transparent, all four sit on one continuous field and the brand's
   * ground only arrives with the effect, on hover.
   */
  ground?: "brand" | "none"
}) {
  const accent = accentOf(conference)

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={
        ground === "brand"
          ? { backgroundColor: surfaceOf(conference) }
          : undefined
      }
    >
      {conference.brand === "access-granted" && (
        <ConferenceCipherField accent={accent} />
      )}
      {conference.hoverVideo && conference.hoverPoster && (
        <ConferenceHoverClip
          src={conference.hoverVideo}
          poster={conference.hoverPoster}
        />
      )}

      <ConferenceMark
        conference={conference}
        size={markSize}
        className={`relative z-2 w-full origin-center ${markClassName}`}
      />

      {conference.brand === "the-model" && <ConferenceMascots color={accent} />}
    </div>
  )
}
