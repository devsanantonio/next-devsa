import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react"

/**
 * Texas Linux Fest 2026, in the calendar's featured slot.
 *
 * The slot has been empty since Startup + Tech Week closed. It is a slot
 * precisely so the calendar never has to know what is in it, and this is the
 * first thing in it that DEVSA does not run — which is the point worth getting
 * right. DEVSA is a community partner here, not the host, and the card says so
 * rather than letting a prominent band imply otherwise.
 *
 * ## Their colours, not ours
 *
 * Every other branded surface on this site carries a DEVSA activation's
 * palette. This one carries Texas Linux Fest's, sampled from their own badge
 * rather than guessed: a deep navy that is roughly 60% of the mark's ink, and
 * the off-white it sits against. On a page that is otherwise black and white,
 * a navy band reads unmistakably as somebody else's event, which is exactly
 * the right signal for a partner listing.
 *
 * The badge is their mark, already in DEVSA's partner records and already on
 * the logo walls. It is a self-contained roundel with its own white ground, so
 * it needs no inversion on either surface — see lib/logo-invert.ts for why
 * that distinction matters.
 *
 * Copied to public/txlf/ rather than read from the partner record at runtime.
 * The tradeoff is real and worth naming: a mark updated in the admin will not
 * reach this copy. It is taken because this card is a prominent, mostly-static
 * band and a fetch for one image on it is the wrong shape — but if TXLF ever
 * rebrands, this file is the second place to change.
 *
 * The description is written here rather than lifted from their site. Their
 * own words belong to them, and a sentence that says why a DEVSA reader should
 * care is a different sentence from the one they open their homepage with.
 */

/**
 * Their palette, sampled rather than guessed — the navy and paper from the
 * badge, the orange from the live site, where it is both the ticket block and
 * the headline type and is unmistakably the primary accent.
 *
 * The card was navy-only at first, which was under-branded: navy is the mark's
 * ink, but their signature on screen is orange on blue. The orange is what
 * makes this read as Texas Linux Fest at a glance.
 *
 * Navy sets the type on the orange, not white. Their own ticket block is white
 * on orange, which measures 2.94:1 — below the 4.5:1 floor for body text.
 * Their navy on the same orange is 4.97:1 and uses nothing outside their own
 * two colours, so the card stays theirs and stays legible. Copying a partner's
 * contrast failure onto our site is not fidelity.
 */
const TXLF_NAVY = "#002070"
const TXLF_PAPER = "#f0f0f0"
const TXLF_ORANGE = "#ff6600"

const TXLF = {
  name: "Texas Linux Festival 2026",
  dateLabel: "November 6–7, 2026",
  location: "Austin, TX",
  href: "https://2026.texaslinuxfest.org/",
} as const

export function FeaturedTxlf() {
  return (
    <section
      className="overflow-hidden rounded-2xl"
      style={{ backgroundColor: TXLF_NAVY }}
      data-bg-type="dark"
    >
      <div className="flex flex-col gap-8 p-7 sm:p-9 md:flex-row md:items-center md:gap-12 md:p-11">
        {/* The badge. Fixed width so the roundel keeps its proportions at every
            breakpoint rather than growing with the column. */}
        <div className="shrink-0">
          <Link href={TXLF.href} target="_blank" rel="noopener noreferrer">
            <Image
              src="/txlf/badge.webp"
              alt="Texas Linux Fest"
              width={480}
              height={480}
              className="h-28 w-28 sm:h-32 sm:w-32 md:h-40 md:w-40"
            />
          </Link>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: TXLF_ORANGE }}
          >
            Featured · Community Partner
          </p>

          <h3
            className="mt-3 text-balance font-sans text-2xl font-black leading-[1.05] tracking-[-0.02em] sm:text-3xl md:text-4xl"
            style={{ color: TXLF_PAPER }}
          >
            {TXLF.name}
          </h3>

          <div
            className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
            style={{ color: `${TXLF_PAPER}cc` }}
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />
              {TXLF.dateLabel}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {TXLF.location}
            </span>
          </div>

          <p
            className="mt-5 max-w-xl text-base leading-relaxed"
            style={{ color: `${TXLF_PAPER}b3` }}
          >
            The state&apos;s community-run Linux and open source conference, and
            a weekend built for the people who actually use it — at home, at
            work, at school. DEVSA is a community partner.
          </p>

          <Link
            href={TXLF.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-7 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
            style={{ backgroundColor: TXLF_ORANGE, color: TXLF_NAVY }}
          >
            Tickets and schedule
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
