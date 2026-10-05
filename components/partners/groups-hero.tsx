"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

/**
 * Type on black. There is no photograph here any more.
 *
 * There was one for a long time, and it went through four frames — techday5,
 * IMG_0444, IMG_0441, 4W1A6905, mason.jpg — each swapped for the same reason:
 * /events, /buildingtogether and the homepage marquee all draw on one weekend
 * of photography, and it is easy to land on the same room twice. The rule that
 * came out of that, kept here because the photo pool has not changed and the
 * other two surfaces still use it: **a shared venue is not a duplicate, a
 * shared vantage point is.** IMG_0441 and the /events band's jordana.jpg are
 * the same angle on the same moment, which is why they collided; mason.jpg
 * looks the other way down the same room and did not. Filenames and hashes
 * will not tell you which is which — only rendering both in their own
 * treatments, at size, side by side.
 *
 * None of that applies while the hero is black, which is the point. The
 * headline is a premise, the paragraph under it is the argument, and the
 * pull-quote is the reassurance an organizer needs before handing over their
 * group's events. All three were competing with a grayscale room for
 * attention, and the room was never carrying an idea the words did not.
 *
 * It also cost: the scrims had to sit at 95% across the left of the frame to
 * hold the type at AA, which meant most of the picture was being paid for and
 * thrown away.
 */

export function GroupsHero() {
  return (
    <section
      className="relative overflow-hidden bg-black min-h-dvh flex flex-col items-center justify-center"
      data-bg-type="dark"
    >
      <div className="page-shell py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 flex flex-col">
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
                Build." — true of almost any community organisation, and
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
