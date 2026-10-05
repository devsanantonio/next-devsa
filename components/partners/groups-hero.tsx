"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

/**
 * The hero photograph, and the rule for choosing the next one.
 *
 * Seven frames have been through this slot, and all but one moved for the same
 * reason: this page, /events and the homepage marquee all draw on one weekend
 * of photography, so it is easy to land on the same room twice.
 *
 *   · techday5 — hotlinked from S3 at 5.4 MB for something that renders
 *     scrimmed to near-black. The repo already had it at 73 KB.
 *   · IMG_0444 — already the marquee's /hero/sastw-room-full.webp.
 *   · IMG_0441 — the same angle on the same moment as the /events band's
 *     jordana.jpg, which is why the two pages read as one picture.
 *   · 4W1A6905 / mason.jpg — session-room frames, then no photograph at all
 *     for a while, then DSC05122, which was the same speaker on the same
 *     stage as the marquee's /hero/sastw-the-reading.webp. A perceptual hash
 *     put those 102/256 apart — comfortably "different" — and by eye they are
 *     one talk.
 *
 * Hence the rule, which has now caught three collisions a filename check
 * missed: **a shared venue is not a duplicate, a shared vantage point is.**
 * Render the candidate and /events' band in their own treatments, at size,
 * side by side, and look.
 *
 * ## Why this frame
 *
 * creativefutures.jpeg. A packed room — roughly eighteen people, daylight,
 * teal walls, somebody standing at the right. It is the only candidate that is
 * a room rather than a speaker, which is what "Twenty-Three Groups. No Shared
 * Room." needs, and it is a different venue from every marquee frame and from
 * the /events band, so there is no vantage point left to collide with. It is
 * already 2048x1152, so it is used uncropped.
 *
 * Rejected along the way, all worth not re-litigating: the
 * founder-in-empty-chairs frame, which is the better *idea* for the headline
 * and the wrong picture for a page whose pull-quote says "We don't run the
 * groups" — opening on a portrait of the person who runs DEVSA contradicts
 * that before anybody reads it; the podium frame whose slide reads "LET THE
 * MACHINES DO THE WORK" in bright magenta, because a hero cannot carry
 * somebody else's headline beside the h1; and the hallway frame, which fits
 * "No Shared Room" best of all and is a bright white corridor under a dark
 * scrim, so two of its three people crush to black.
 *
 * ## The scrim is this heavy because the frame is this bright
 *
 * Every earlier frame here was `grayscale`. This one is in color, which is
 * the point of it — but it is also a daylit room where the previous one was a
 * dark stage, and that changes the arithmetic completely rather than slightly.
 *
 * Its windows peak at a relative luminance of 0.90. Holding white/55 at the
 * 4.5:1 floor over that needs the ground below L=0.048, which needs a scrim of
 * at least 0.946 — so the ramp sits at 0.95 flat across the whole copy column
 * and only opens after 60%. The left three fifths are therefore near-black and
 * the room shows in the right third. That is forced, not a composition choice:
 * there is no gradient that keeps a frame this bright visible *behind* white
 * type. If more of the room is ever wanted, the lever is a darker photograph,
 * not a lighter scrim.
 *
 * Measured per element against its own footprint rather than the whole column,
 * because the eyebrow is 214px wide and the body runs to 858: eyebrow 4.61:1
 * (the binding one), body 6.77:1, pull-quote 6.05:1, h1 11.06:1.
 *
 * There is no HERO_IMAGE_URL const any more. The path is written into the
 * Tailwind class below, because the image has to be declared inside an `lg:`
 * variant to stay unfetched on phones — see the note there.
 */

export function GroupsHero() {
  return (
    <section
      className="relative overflow-hidden bg-black min-h-dvh flex flex-col items-center justify-center"
      data-bg-type="dark"
    >
      {/* lg and up only, and a background rather than an <img>.

          A phone shows about 22% of a 16:9 frame through object-cover, so a
          wide room arrives as a vertical slice of two or three people with the
          rest of it gone. Nothing that makes this frame work survives a
          portrait viewport: the room, its depth and the copy-left/light-right
          balance are all horizontal.

          It was also costing contrast rather than paying for itself. Holding
          the copy over that slice needed a flat tint on top of the ramp —
          bytes downloaded, on the connection most likely to be metered, in
          order to darken our own page.

          A background-image declared inside an `lg:` variant is never fetched
          below that width. `hidden lg:block` on an <img> would not have saved
          the bytes: every major browser still fetches a display:none image. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center lg:bg-[url(/photos/buildingtogether-hero.webp)]"
      />

      {/* The picture comes out of focus as well as out of the dark, so there is
          no edge where it begins — it is blurred under the copy and sharp in
          the open third, with the mask doing the hand-off. backdrop-blur reads
          whatever is painted behind it, which is why this sits above the img
          and below the ramp.

          7px, not the 40px of backdrop-blur-2xl. A large radius does not
          soften a room full of faces, it dissolves them into cloud, and the
          whole reason this frame is here is that it reads as people. At 7px
          they stay people and the start is still smooth, because what makes it
          smooth is the mask, not the radius. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 hidden backdrop-blur-[7px] lg:block"
        style={{
          maskImage:
            "linear-gradient(to right, #000 0%, #000 38%, rgba(0,0,0,0.55) 58%, transparent 76%)",
          WebkitMaskImage:
            "linear-gradient(to right, #000 0%, #000 38%, rgba(0,0,0,0.55) 58%, transparent 76%)",
        }}
      />

      {/* The darkness, on the same axis.

          Flat at 0.95 until 60%, then open — not a ramp easing across the
          whole width, which is what this was when the frame behind it was a
          dark stage. The copy block is max-w-4xl and its longest lines end
          around 62%, and a daylit room is bright enough that anything under
          0.95 beneath them fails AA. So the fall-off starts where the copy
          ends rather than travelling through it.

          object-position is not involved and could not help: a MacBook Air at
          1470x832 and a 2560x1440 monitor are both within a hair of 16:9, and
          so is this image, so object-cover crops nothing horizontally on
          either and there is nothing for it to move. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 60%, rgba(0,0,0,0.62) 73%, rgba(0,0,0,0.26) 87%, rgba(0,0,0,0.14) 100%)",
        }}
      />
      {/* The flat mobile tint that used to sit here went with the photo. It
          existed only to hold the copy over it; below lg the ground is the
          section's own black and every measured ratio is the one in the
          comment on the eyebrow. */}

      <div className="relative z-20 page-shell py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 flex flex-col">
        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="space-y-4">
            {/* /55, not /40. On black that was 3.66:1 against a 4.5:1 floor for
                text this size — it only ever passed inspection because a
                photograph was behind it. The floor is alpha 0.456 on both
                #000 and #0a0a0a; /55 measures 6.27:1 and matches the eyebrow
                on /events' band. */}
            <p className="text-sm md:text-base font-medium text-white/55 uppercase tracking-[0.2em]">
              Building Together
            </p>
            {/* This was "Where Partners and Communities Come Together to
                Build." — true of almost any community organization, and
                nothing a reader could picture. The page's own WhyDevsa section
                said the same thing far better two scrolls down, so it is the
                headline now and that section is gone.

                A premise rather than an answer, which is what a hero has to
                be: it needs no setup, and everything below it — the wall, the
                mechanism, the ask — reads as the consequence. */}
            <h1 className="text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Twenty-Three Groups.{" "}
              <span className="text-white/50 font-light italic">No Shared</span>{" "}
              Room.
            </h1>
          </div>

          <div className="space-y-8 max-w-3xl mt-8">
            <div className="space-y-6">
              <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
                San Antonio never lacked tech communities. What it lacked was
                anywhere they could see each other — groups meeting across the
                city on their own calendars, to their own audiences, mostly
                unaware of one another.
              </p>

              {/* The reassurance an organizer needs before anything else, and
                  the page's whole posture in two sentences. It is load-bearing
                  here: this is the page where somebody decides whether to hand
                  over their group's events. */}
              <div className="border-l-4 border-white/20 pl-6 md:pl-8">
                <p className="text-base md:text-lg text-white/60 leading-relaxed">
                  DEVSA was built to close that gap, and nothing more than that.
                  We don&apos;t run the groups — they run themselves, keep their
                  own names and keep their own people. What we give them is{" "}
                  <span className="font-medium text-white/85">one calendar</span>,{" "}
                  <span className="font-medium text-white/85">
                    one public directory
                  </span>
                  , and one room to meet partners in.
                </p>
              </div>
            </div>

            {/* CTAs — Community Calendar leads, and is now the only one here;
                the Coworking link beside it went when the room closed. */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
              <Link
                href="/events"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg bg-white text-gray-900 font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-100"
              >
                Community Calendar
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Bottom fade into the logo showcase */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent z-20" />
    </section>
  )
}
