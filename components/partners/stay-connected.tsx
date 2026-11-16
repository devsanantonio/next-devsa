"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowUpRight, AtSign, CalendarDays, CalendarPlus } from "lucide-react"
import { GoogleCalendarIcon, AppleCalendarIcon, OutlookIcon } from "@/components/icons/calendar-icons"
import { DiscordIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from "@/components/icons/social-icons"
import { track } from "@vercel/analytics"
import { calendarSubscribeLinks, newSubscribeCode } from "@/lib/calendar-subscribe"

const SITE = "https://www.devsa.community"
// The same live feed the /events subscribe dialog uses: subscribed, a
// reader's own calendar app picks up new events without them coming back.
const ICAL_URL = `${SITE}/api/events/calendar`
const WEBCAL_URL = ICAL_URL.replace(/^https?:\/\//, "webcal://")
const SUBSCRIBE = [
  { label: "Google", key: "google", Icon: GoogleCalendarIcon, href: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(WEBCAL_URL)}` },
  { label: "Apple", key: "webcal", Icon: AppleCalendarIcon, href: WEBCAL_URL },
  {
    label: "Outlook",
    key: "outlook",
    Icon: OutlookIcon,
    href: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(ICAL_URL)}&name=${encodeURIComponent("DEVSA Community Events")}`,
  },
] as const

/**
 * Swap in a coded feed address at the moment of the click, so the subscription
 * can be counted (lib/calendar-subscribe.ts). The rendered href stays the plain
 * address: this section is server-rendered, and a random code in the markup
 * would differ between the server and the browser. Changing href in onClick
 * lands before the browser follows the link.
 */
function codeTheLink(e: React.MouseEvent<HTMLAnchorElement>, key: (typeof SUBSCRIBE)[number]["key"]) {
  const links = calendarSubscribeLinks(SITE, newSubscribeCode())
  e.currentTarget.href = links[key]
  track("calendar_subscribe", { app: key === "webcal" ? "apple" : key, from: "buildingtogether" })
}
// DEVSA's channels, the same list and order as DEVSA TV's "one channel" page and the footer: the website leads
// (this page is on it), and these are for whoever is already on one of them. Following DEVSA on any one is
// following every group, since DEVSA carries all of them.
const CHANNELS = [
  { name: "Discord", handle: "devsa.community/discord", href: "/discord", Icon: DiscordIcon },
  { name: "Instagram", handle: "@devsatx", href: "https://instagram.com/devsatx", Icon: InstagramIcon },
  { name: "LinkedIn", handle: "/company/devsa", href: "https://linkedin.com/company/devsa", Icon: LinkedInIcon },
  { name: "X", handle: "@devsatx", href: "https://x.com/devsatx", Icon: TwitterIcon },
  { name: "YouTube", handle: "@devsatx", href: "https://www.youtube.com/@devsatx", Icon: YouTubeIcon },
] as const

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
 * only offered inside a dialog on /events), and DEVSA's channels. The last was
 * a single "Join the Discord" card until November 2026, which made Discord look
 * like the one other place DEVSA is; it is one of five, listed as DEVSA TV's
 * first episode lists them. No
 * newsletter signup: sending is not set up yet (it needs an unsubscribe flow
 * and a postal address), and collecting addresses with nothing to send would
 * be a promise DEVSA cannot keep.
 */
export function StayConnected() {
  return (
    <section id="stay-connected" className="w-full bg-white py-16 sm:py-20 md:py-24" data-bg-type="light">
      <div className="page-shell">
        {/* grid-cols-1, not the implicit auto track: an auto track sizes to
            its widest unbreakable child, which was the three calendar buttons
            (~423px), and stretched this whole section past a phone's width so
            the page scrolled sideways. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
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
              their own, and follow DEVSA wherever you already are: one channel for
              every group.
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
            <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                <CalendarPlus className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-gray-900">Add it to your calendar</span>
                <span className="block text-sm text-gray-500">New events show up on their own</span>
              </span>
              {/* Their own row, the card's full width on a phone, wrapping on
                  the smallest screens; under the text from sm up. */}
              <span className="flex basis-full flex-wrap gap-2 sm:-mt-1 sm:pl-[3.75rem]">
                {SUBSCRIBE.map(({ Icon, ...s }) => (
                  <a
                    key={s.label}
                    href={s.href}
                    onClick={(e) => codeTheLink(e, s.key)}
                    target={s.label === "Apple" ? undefined : "_blank"}
                    rel={s.label === "Apple" ? undefined : "noopener noreferrer"}
                    aria-label={`Subscribe in ${s.label} Calendar`}
                    className="inline-flex min-w-[5.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:flex-none sm:py-1.5"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {s.label}
                  </a>
                ))}
              </span>
            </div>

            {/* Built like "Add it to your calendar" above it, icon tile, title and a row of buttons indented
                under the title, so the column's three cards share one left edge. One row of icons, not a row
                per channel: listing each handle made this the busiest card in the column. */}
            <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                <AtSign className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-gray-900">Follow DEVSA</span>
                <span className="block text-sm text-gray-500">@devsatx, wherever you already are</span>
              </span>
              <span className="flex basis-full flex-wrap gap-2 sm:-mt-1 sm:pl-[3.75rem]">
                {CHANNELS.map(({ Icon, ...c }) => (
                  <a
                    key={c.name}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`DEVSA on ${c.name}`}
                    title={`${c.name} · ${c.handle}`}
                    onClick={() => track("channel_click", { channel: c.name.toLowerCase(), from: "buildingtogether" })}
                    className="flex h-9 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
