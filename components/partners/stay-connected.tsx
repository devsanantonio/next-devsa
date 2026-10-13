"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, CalendarPlus } from "lucide-react"
import { GoogleCalendarIcon, AppleCalendarIcon, OutlookIcon } from "@/components/icons/calendar-icons"
import { DiscordIcon } from "@/components/icons/social-icons"

const SITE = "https://www.devsa.community"
// The same live feed the /events subscribe dialog uses: subscribed, a
// reader's own calendar app picks up new events without them coming back.
const ICAL_URL = `${SITE}/api/events/calendar`
const WEBCAL_URL = ICAL_URL.replace(/^https?:\/\//, "webcal://")
const SUBSCRIBE = [
  { label: "Google", Icon: GoogleCalendarIcon, href: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(WEBCAL_URL)}` },
  { label: "Apple", Icon: AppleCalendarIcon, href: WEBCAL_URL },
  {
    label: "Outlook",
    Icon: OutlookIcon,
    href: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(ICAL_URL)}&name=${encodeURIComponent("DEVSA Community Events")}`,
  },
]
const DISCORD_URL = "https://discord.gg/cvHHzThrEw"

/**
 * Stay Connected: the section for one person on /buildingtogether.
 *
 * It was "Get Involved" until that name went to the partner form below, and
 * it was half a donation pitch — a Support DEVSA tile, and a line saying
 * every dollar "goes into the events on that calendar", which DEVSA does not
 * fund (the groups run their own; DonationCta says what the money does). The
 * donation ask now lives in one place, two sections down, and in the nav.
 *
 * What it offers instead are the ways to stay connected that already exist:
 * browse the calendar, subscribe to it in your own calendar app (the feed was
 * only offered inside a dialog on /events), and the DEVSA Discord. No
 * newsletter signup: sending is not set up yet (it needs an unsubscribe flow
 * and a postal address), and collecting addresses with nothing to send would
 * be a promise DEVSA cannot keep.
 */
export function StayConnected() {
  return (
    <section id="stay-connected" className="w-full bg-white py-16 sm:py-20 md:py-24" data-bg-type="light">
      <div className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                Stay Connected
              </p>
              <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
                Find Your People.{" "}
                <span className="text-gray-600 font-light italic">Show</span> Up.
              </h2>
            </div>
            <p className="max-w-5xl text-lg md:text-xl text-gray-600 leading-[1.45] font-light">
              Every meetup, workshop and conference in San Antonio tech, on one
              calendar. Put it in your own calendar so new events show up on
              their own, and find the people behind them on Discord.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4"
          >
            <Link
              href="/events"
              className="group flex items-center gap-4 rounded-2xl bg-gray-900 p-5 sm:p-6 transition-colors duration-200 hover:bg-gray-800"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <CalendarDays className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-white">Community Calendar</span>
                <span className="block text-sm text-white/70">See what&apos;s coming up</span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-white/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            {/* Not one link: Google, Apple and Outlook each subscribe through a
                different URL, so the tile carries all three. */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                <CalendarPlus className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-gray-900">Add it to your calendar</span>
                <span className="block text-sm text-gray-500">New events show up on their own</span>
              <span className="mt-3 flex gap-2">
                {SUBSCRIBE.map(({ Icon, ...s }) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.label === "Apple" ? undefined : "_blank"}
                    rel={s.label === "Apple" ? undefined : "noopener noreferrer"}
                    aria-label={`Subscribe in ${s.label} Calendar`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:flex-none"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {s.label}
                  </a>
                ))}
              </span>
              </span>
            </div>

            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 transition-colors duration-200 hover:bg-gray-50 hover:border-gray-300"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5865F2]/10 text-[#5865F2]">
                <DiscordIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-gray-900">Join the Discord</span>
                <span className="block text-sm text-gray-500">Where the organizers and the community talk</span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
