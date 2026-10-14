"use client"

import { motion } from "motion/react"
import { GetInvolvedForm } from "@/components/get-involved/get-involved-form"
import type { GetInvolvedPath } from "@/lib/get-involved"

/**
 * Get Involved: the five ways to use DEVSA as a bridge, and the form to start
 * one, in one section of /buildingtogether.
 *
 * The ways are the menu, and the form beside them is how to act on one. They
 * are not wired to the form's dropdown: an earlier draft made each a button
 * that set it, and keeping the two in lockstep boxed the section in. The old
 * /get-involved page redirects here carrying ?path= and ?way=, so links from
 * elsewhere still open the form with a choice made.
 *
 * Every way names something that already happened and can be checked on this
 * site: the event, the partner, the groups. It is not the capabilities list
 * PartnerCta's note retired; a way that cannot point at a real instance does
 * not belong here. Nothing DEVSA cannot do today is offered — no newsletter
 * placements (sending is not set up) and no job posts (the board is gone).
 *
 * The examples are written in, not fetched: they are past events used as
 * evidence, and do not go stale when the calendar moves on.
 */
const WAYS: { key: string; title: string; example: string }[] = [
  { key: "calendar", title: "List your events on the calendar", example: "Geekdom's SATX Open Coffee Club" },
  { key: "host", title: "Host with a community group", example: "PyTexas Foundation with Alamo Python" },
  { key: "program", title: "Run a program across the groups", example: "SA Startup + Tech Week, through ten groups" },
  { key: "popup", title: "Co-design a pop-up", example: "SheBuilds with Lovable, Zero to Agent with Vercel" },
  { key: "embed", title: "Embed the calendar on your site", example: "Free, with an RSS feed, on the calendar page" },
]

export function PartnerWays({
  initialPath = "partner",
  initialWay = "",
}: {
  initialPath?: GetInvolvedPath
  initialWay?: string
}) {
  return (
    <section
      id="get-involved"
      className="w-full bg-white py-14 md:py-16 scroll-mt-20"
      data-bg-type="light"
    >
      <div className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
              Get Involved
            </p>
            {/* Same eyebrow, heading ramp and intro size as StayConnected
                above, so the two white sections read as one system. */}
            <h2 className="mt-4 text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
              Bring the Idea.{" "}
              <span className="text-gray-600 font-light italic">We&apos;ll Bring</span>{" "}
              the Builders.
            </h2>
            <p className="mt-5 max-w-xl text-lg md:text-xl text-gray-600 leading-[1.45] font-light">
              Five ways in, each with a real example.
            </p>

            {/* Title and line in the same type as StayConnected's tiles
                (16px semibold over 14px gray). The brand-pink bar marks the
                example: a shape needs 3:1 and #ef426f is 3.7:1 on white,
                where pink text at this size would not pass. */}
            <ul aria-label="Ways to work with DEVSA" className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {WAYS.map(({ key, title, example }) => (
                <li key={key} className="py-3">
                  <span className="block text-base font-semibold text-gray-900">{title}</span>
                  <span className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <span aria-hidden className="h-3.5 w-1 shrink-0 rounded-full bg-[#ef426f]" />
                    {example}
                  </span>
                </li>
              ))}
            </ul>

            {/* Giving has one door: the donation form directly below. Worded
                as support, not sponsorship: the form makes a general gift and
                cannot be designated to a single event (only to a campaign
                listed in lib/campaigns.ts), so promising sponsorship here
                would mislead.
                Anyone backing a specific event can say so through Partner with
                DEVSA. */}
            <p className="mt-4 text-sm text-gray-600">
              Want to support the work?{" "}
              <a
                href="#donate"
                className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"
              >
                Give through the donation form
              </a>
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="scroll-mt-24 lg:sticky lg:top-24"
          >
            <GetInvolvedForm initialPath={initialPath} initialWay={initialWay} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
