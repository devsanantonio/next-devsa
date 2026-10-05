"use client"

import { useState } from "react"
import Link from "next/link"
import { conferences, type Conference } from "@/data/conferences"
import { AG_LOCK } from "@/data/access-granted/2026"
import { ConferenceMark } from "@/components/events/conference-mark"
import { accentOf, surfaceOf } from "@/components/events/conference-band"
import {
  ConferenceHoverClip,
  ConferenceMascots,
} from "@/components/events/conference-card-fx"

/**
 * The four conferences DEVSA runs, as a lineup rather than a card grid.
 *
 * ## Why this is not cards
 *
 * It was, twice. The second attempt matched the site's card shape exactly —
 * aspect-16/10 visual, padded copy, rounded-2xl on neutral-900 — which fixed
 * the problem of looking pasted in and created a worse one: AudienceLanes
 * directly below is built the same way, so the page ran two identical
 * constructions back to back and the transition between them read as a repeat.
 *
 * Grepping the homepage, those two were the only sections sharing that
 * construction. The page's vocabulary is wider than it looks — the hero drifts
 * tilted photo columns, EcosystemShowcase runs a horizontal logo marquee,
 * HeroCommunities uses no grid at all. So the fix was not to break the system
 * but to use a different pattern inside it.
 *
 * ## What a lineup gets that a card could not
 *
 * Each of these brands owns a piece of motion — Claude Code mascots, a
 * decrypting spotlight, a luchador, a rotating head — and in a four-up grid
 * each one was confined to about 305x190px. Here the hovered brand takes the
 * whole band: roughly 1200x500, full-bleed behind the lettering. The mascots
 * have floor to cross, the ciphertext has a field to fill, and the clips are
 * the size they were shot for.
 *
 * It also reads as a bill rather than a catalogue, which is closer to what
 * these are. No boxes, no borders, no blurb — the marks and their motion.
 *
 * ## How the hover works
 *
 * One piece of state here, not four inside the effects. The hover target is a
 * wordmark and the thing that responds is a full-bleed layer behind it: two
 * different elements, so the state has to live above both. Each effect takes an
 * optional `active` prop for exactly this; left undefined they self-manage,
 * which is what the /events cards still do.
 *
 * Nothing runs at rest. Four videos and a simulation idling behind a section
 * nobody has pointed at is a cost with nothing on the other side of it.
 */
function EffectLayer({
  conference,
  active,
}: {
  conference: Conference
  active: boolean
}) {
  return (
    <div
      aria-hidden={!active}
      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: surfaceOf(conference) }}
    >
      {/* Access Granted shows the padlock, not the ciphertext field.
      
          The field is a spotlight — it only reveals where the cursor is, which
          works on a 305px card and disappears across a band this wide. The
          padlock is the activation's own artwork and the thing its masthead
          leads with, and at full width it reads the way the luchador and the
          rotating head do. The field is untouched on the /events cards, where
          its scale is right. */}
      {conference.brand === "access-granted" && (
        <ConferenceHoverClip
          src={AG_LOCK.src}
          poster={AG_LOCK.poster}
          active={active}
          /* The loop is a lit object on black rather than a filmed room, so it
             is placed rather than cropped — `contain` keeps the whole lock in
             frame, and a lighter tint since it is mostly dark already. */
          className="h-full w-full object-contain"
          scrim="bg-black/55"
        />
      )}
      {conference.hoverVideo && conference.hoverPoster && (
        <ConferenceHoverClip
          src={conference.hoverVideo}
          poster={conference.hoverPoster}
          active={active}
          /* `contain`, like Access Granted's padlock above and for the same
             reason: both of these are a lit object on black — PySanAntonio's
             luchador, More Human's wireframe head — rather than a filmed room.
             They are placed, not cropped.

             With `cover` they were cut, and only on a wide display, which is
             what made it easy to miss. This layer is full-bleed, so the band's
             aspect is the viewport's: a MacBook Air at 1470 is about 1.8:1
             against a 1.55:1 clip and loses a little, while a 2560 monitor is
             nearer 3.2:1 and crops roughly half the clip's height — taking the
             sombrero off the top and the guitar off the bottom.

             It costs nothing to show them whole. Both clips are black-grounded
             and this section is #0a0a0a, so there is no letterbox to see. */
          className="h-full w-full object-contain"
          scrim="bg-black/70"
        />
      )}
      {conference.brand === "the-model" && (
        <ConferenceMascots
          color={accentOf(conference)}
          active={active}
          /* Bigger than the card's 18px — this band is roughly four times the
             area, and they were reading as specks in it. */
          size={30}
        />
      )}
    </div>
  )
}

export function DevsaConferences() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section
      id="devsa-conferences"
      /* Takes the viewport from lg up.

         The content — eyebrow, headline, intro and four marks in two columns —
         runs to roughly 800px, which fills a laptop and leaves the top of
         AudienceLanes showing on a tall external monitor. A lineup that shares
         the screen with the next section's heading stops being a lineup.

         It also gives the hover effects the canvas they were designed for.
         Each of these brands owns a piece of motion and the whole argument for
         this section over a card grid was that the hovered brand gets the
         whole band; a taller band means the mascots have more floor to cross
         and the object-contain clips render larger rather than being pinned to
         a short strip.

         A minimum, not a height: below lg, and anywhere the content outgrows
         the viewport, it simply flows. justify-center keeps the lineup in the
         middle of whatever it gets. */
      className="relative flex w-full scroll-mt-20 flex-col justify-center overflow-hidden bg-[#0a0a0a] lg:min-h-dvh"
      data-bg-type="dark"
    >
      {conferences.map((conference) => (
        <EffectLayer
          key={conference.key}
          conference={conference}
          active={hovered === conference.key}
        />
      ))}

      <div className="page-shell relative z-10 py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/50">
            What We Run Together
          </p>
          <h2 className="mt-5 text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
            Four Conferences. Built{" "}
            <span className="font-light italic text-white/50">Here</span>.
          </h2>
          <p className="mt-4 text-lg md:text-xl font-light leading-[1.45] text-white/65">
            DEVSA-led, activated with these groups and our partners. For the
            creatives, founders, builders and engineers already doing the work.
          </p>
        </div>

        {/* The bill. Two columns so each mark has room to be read at `panel`
            size, generous vertical rhythm, and nothing around them — the
            lockups are the only thing holding the layout.

            Unhovered marks drop to 35% rather than staying lit. With a
            full-bleed effect behind them the band becomes one brand's world
            for as long as the pointer is there, and three other logos at full
            strength would argue with it. */}
        <ul className="mt-14 grid gap-x-10 gap-y-12 md:mt-20 md:grid-cols-2 md:gap-y-16 lg:gap-x-20">
          {conferences.map((conference) => {
            const dimmed = hovered !== null && hovered !== conference.key
            const inner = (
              <span
                className={`block origin-left transition-opacity duration-300 ${
                  dimmed ? "opacity-35" : "opacity-100"
                }`}
              >
                <ConferenceMark conference={conference} size="panel" />
              </span>
            )

            return (
              <li
                key={conference.key}
                onPointerEnter={() => setHovered(conference.key)}
                onPointerLeave={() => setHovered(null)}
              >
                {conference.href ? (
                  <Link href={conference.href} className="block w-fit">
                    {inner}
                  </Link>
                ) : (
                  /* No page, so no link — More Human's came down with the
                     conference. It still lights the band on hover. */
                  <div className="w-fit">{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
