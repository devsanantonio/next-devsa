import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { MoreHumanHero } from "@/components/more-human/hero"
import { ConferenceBackLink } from "@/components/events/conference-back-link"
import { ConferenceLineup } from "@/components/events/conference-sections"
import { MoreHumanFacts } from "@/components/more-human/event-facts"
import { getConference } from "@/data/conferences"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"
const MH_AMBER = "#ff9900"

const DESCRIPTION =
  "More Human Than Human is DEVSA's AI conference for engineering, security and the people leading the change — fourteen sessions at Geekdom on what shifts when the tools stop being tools."

export const metadata: Metadata = {
  title: "More Human Than Human — DEVSA's AI Conference | DEVSA",
  description: DESCRIPTION,
  alternates: { canonical: "/events/morehumanthanhuman" },
  openGraph: {
    title: "More Human Than Human — A DEVSA Conference",
    description: DESCRIPTION,
    url: `${siteUrl}/events/morehumanthanhuman`,
    siteName: "DEVSA",
    type: "website",
    images: [
      {
        url: `${siteUrl}/api/og/morehumanthanhuman`,
        width: 1200,
        height: 630,
        alt: "More Human Than Human — DEVSA AI Conference",
      },
    ],
  },
}

/**
 * More Human Than Human's page, restored.
 *
 * ## Why this URL and not a tidier one
 *
 * `/events/morehumanthanhuman`, unhyphenated, which is not what a new route
 * would be called — its siblings are /events/the-model and
 * /events/access-granted. It is this because the URL already exists in the
 * world: it is in speaker thank-you emails that were sent and cannot be
 * recalled, it was in the sitemap until the route came down, and it is what
 * search engines crawled. A hyphenated slug would be a second address for one
 * conference and would leave every one of those links still broken.
 *
 * `/events/pysanantonio` is unhyphenated too, so there was no convention to
 * break.
 *
 * The route coming down is what made those links dead ends — see the note in
 * app/sitemap.ts, which recorded the damage at the time and can now be undone.
 * A static segment beats the `[slug]` catch-all, the same way the other three
 * conference routes do, so this takes the URL back from the soft-404.
 *
 * ## What it has, and what it deliberately does not
 *
 * A masthead, the date rail and the running order. Not a room photograph, because this
 * conference has no wide establishing shot — the four frames in public/hero are
 * portrait and already carry the homepage's bridge — and not a grid of speaker
 * portraits, for the reason set out on `photo` in data/conferences.ts: the
 * headshots cover nine of fourteen slots and a lineup with faces on some rows
 * and not others looks broken. They are also hotlinked from the producer's
 * storage bucket, which is not a dependency this site should take on.
 *
 * The thing this conference does own is its running order, and that is now
 * here in full.
 */
export default function MoreHumanThanHumanPage() {
  const conference = getConference("more-human-than-human")

  return (
    <main className="overflow-x-hidden bg-black" data-bg-type="dark">
      <ConferenceBackLink accent={MH_AMBER} />
      <MoreHumanHero />
      <MoreHumanFacts />
      {conference && <ConferenceLineup conference={conference} />}

      <section className="page-shell pb-20 md:pb-28">
        <div className="flex flex-col gap-3 border-t border-white/10 pt-10 sm:flex-row sm:items-start">
          <Link
            href="/events"
            className="group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-black transition-opacity duration-200 hover:opacity-90"
            style={{ backgroundColor: MH_AMBER }}
          >
            Community Calendar
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/events#conferences"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/30 hover:bg-white/10"
          >
            All DEVSA conferences
          </Link>
        </div>
      </section>
    </main>
  )
}
