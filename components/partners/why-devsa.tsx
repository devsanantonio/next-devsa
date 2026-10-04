"use client"

import { motion } from "motion/react"

/**
 * The reason DEVSA exists, on the page where that reason has to do work.
 *
 * The homepage already tells this story, at the end, as a narrative device:
 * "Where is the tech community in San Antonio?" answered by "we found it, and
 * it was scattered". That version is written for a stranger who has just
 * arrived and is being shown around.
 *
 * This is the same argument written for the opposite reader. Everyone on this
 * page has already decided to look — they are weighing whether to put a group,
 * a budget or a name behind DEVSA, and that decision turns on whether the gap
 * being closed was real. So it states the problem as a fact about the city
 * rather than as a question, and it says plainly what DEVSA does not do, since
 * "will you absorb my group?" is the first thing an organizer wants answered.
 *
 * Deliberately not the homepage's wording. Two pages making the same argument
 * is the point; two pages making it in the same sentences is the duplication
 * that made them feel like one page split in half.
 *
 * Sits after the logo wall on purpose. The wall is the evidence — forty marks
 * in one place — and this is the line that tells you what you just looked at.
 */
export function WhyDevsa() {
  return (
    <section className="w-full bg-neutral-950" data-bg-type="dark">
      <div className="page-shell py-16 sm:py-20 md:py-24 lg:py-28">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl space-y-8"
        >
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
              Why This Exists
            </p>
            <h2 className="text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Twenty Groups.{" "}
              <span className="text-white/50 font-light italic">No Shared</span>{" "}
              Room.
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
              San Antonio never lacked tech communities. What it lacked was
              anywhere they could see each other — groups meeting across the
              city on their own calendars, to their own audiences, mostly
              unaware of one another.
            </p>

            {/* The reassurance an organizer needs before anything else. The
                homepage makes this point too; here it is load-bearing, because
                this is the page where somebody decides whether to hand over
                their group's events. */}
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
        </motion.div>
      </div>
    </section>
  )
}
