import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TheModelHero } from "@/components/the-model/2026/hero"
import {
  ConferenceLineup,
  ConferenceRoom,
} from "@/components/events/conference-sections"
import { getConference } from "@/data/conferences"
import { MODEL_INK, MODEL_LAVENDER, THE_MODEL } from "@/data/the-model/2026"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

export const metadata: Metadata = {
  title: "The Model — Creatives, Founders and Builders | DEVSA",
  description:
    "The Model is DEVSA's creative-and-code afternoon: San Antonio's creative economy and its builders in one room, showing each other what comes next. Held at Geekdom.",
  alternates: { canonical: "/events/the-model" },
  openGraph: {
    title: "The Model — A DEVSA Conference",
    description: `${THE_MODEL.tagline.setup} ${THE_MODEL.tagline.turn}`,
    url: `${siteUrl}/events/the-model`,
    siteName: "DEVSA",
    type: "website",
  },
}

/**
 * The Model on the DEVSA site.
 *
 * It had no page here at all until now, which was the wrong way round: of the
 * three Startup + Tech Week activations, the two with the least standing had
 * routes, components and data files, and the one taking the flagship slot had
 * a colour in a registry and nothing else.
 *
 * Deliberately a standing page rather than a call-for-speakers page. The
 * Access Granted route exists to run its open calls and says so; this one
 * exists because a conference DEVSA owns and intends to run again should have
 * a front door whether or not anything is open on it today. When there is a
 * date and a call, they go here.
 */
export default function TheModelPage() {
  const conference = getConference("the-model")

  return (
    <main
      className="overflow-x-hidden"
      style={{ backgroundColor: MODEL_INK }}
      data-bg-type="dark"
    >
      <TheModelHero />
      {conference && (
        <>
          <ConferenceRoom conference={conference} />
          <ConferenceLineup conference={conference} />
        </>
      )}

      {/* The "It's coming back" block that sat here is gone at the organisers'
          request. The two links stay: the reel section above ends on a
          "Powered by" row, and a page with no way onward is a dead end. */}
      <section className="page-shell pb-20 md:pb-28">
        <div className="flex flex-col gap-3 border-t border-white/10 pt-10 sm:flex-row sm:items-start">
          <Link
            href="/events"
            className="group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
            style={{ backgroundColor: MODEL_LAVENDER, color: MODEL_INK }}
          >
            Community Calendar
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/events#conferences"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 hover:border-white/30"
          >
            All DEVSA conferences
          </Link>
        </div>
      </section>
    </main>
  )
}
