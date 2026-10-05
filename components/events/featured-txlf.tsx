import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react"

/**
 * Texas Linux Fest 2026, in the calendar's featured slot.
 *
 * It is a slot precisely so the calendar never has to know what is in it, and
 * this is the first thing in it that DEVSA does not run — which is the point
 * worth getting right. DEVSA is a community partner here, not the host, and
 * the card says so rather than letting a prominent band imply otherwise.
 *
 * ## Their colors, not ours
 *
 * Every other branded surface on this site carries a DEVSA activation's
 * palette. This one carries Texas Linux Fest's, sampled from their own badge
 * rather than guessed: a deep navy that is roughly 60% of the mark's ink, the
 * off-white it sits against, and the orange that is both their ticket block
 * and their headline type on the live site.
 *
 * Navy sets the type on the orange, not white. Their own ticket block is white
 * on orange, which measures 2.94:1 — below the 4.5:1 floor for body text.
 * Their navy on the same orange is 4.97:1 and uses nothing outside their own
 * two colors. Copying a partner's contrast failure onto our site is not
 * fidelity.
 *
 * The badge is their mark, already in DEVSA's partner records. It is a
 * self-contained roundel with its own white ground, so it needs no inversion
 * on either surface — see lib/logo-invert.ts for why that distinction matters.
 * Copied to public/txlf/ rather than read from the partner record at runtime:
 * a mark updated in the admin will not reach this copy, which is the tradeoff
 * taken because a fetch for one image on a mostly-static card is the wrong
 * shape. If TXLF rebrands, this file is the second place to change.
 *
 * ## One surface, not three
 *
 * This was built as a tiling window manager — a status bar, two panes, and a
 * few pixels of darker ground showing through every gutter. The idea was that
 * a Linux conference should be laid out the way a Linux desktop is, and at the
 * full width of the shell it worked.
 *
 * It does not survive being a column. Narrow, the bar and the two panes stop
 * reading as a tiled screen and start reading as three rounded boxes pushed
 * together, which is worse than no device at all. So the card is one surface
 * now and the Linux idiom is carried by what still fits at this size: the mono
 * label, the prompt and the blinking caret.
 *
 * The label says "Featured Event" in as many words. The old eyebrow said
 * "Featured · Community Partner", which named the relationship but never the
 * thing — on a calendar page, a reader should not have to infer that the one
 * card above the list is the featured one.
 */
const TXLF_NAVY = "#002070"
const TXLF_PAPER = "#f0f0f0"
const TXLF_ORANGE = "#ff6600"

const TXLF = {
  name: "Texas Linux Festival 2026",
  dateLabel: "November 6–7, 2026",
  location: "Austin, TX",
  href: "https://2026.texaslinuxfest.org/",
  since: "community-run since 2010",
} as const

export function FeaturedTxlf() {
  return (
    <section
      className="group overflow-hidden rounded-2xl"
      style={{ backgroundColor: TXLF_NAVY }}
      data-bg-type="dark"
    >
      <div className="p-6 sm:p-7 lg:p-8">
        {/* The label row. Mono and a shell prompt because this is the one
            conference on the page whose subject is the terminal — the rest of
            the tiling went, this stayed, because it costs one line. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest"
            style={{ color: TXLF_ORANGE }}
          >
            <span aria-hidden>$</span>
            Featured Event
            {/* Held steady for readers who ask for less motion — the rule is
                in globals.css beside the keyframe. */}
            <span
              aria-hidden
              className="inline-block h-3 w-[7px] animate-[txlfCaret_1.1s_infinite] align-[-1px]"
              style={{ backgroundColor: TXLF_ORANGE }}
            />
          </p>
          <p
            className="font-mono text-[11px] uppercase tracking-widest"
            style={{ color: `${TXLF_PAPER}b3` }}
          >
            {TXLF.since}
          </p>
        </div>

        {/* The mark beside the name rather than in a pane of its own, which is
            what lets this be one card. */}
        <div className="mt-6 flex items-center gap-4 sm:gap-5">
          <Link
            href={TXLF.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Image
              src="/txlf/badge.webp"
              alt="Texas Linux Fest"
              width={480}
              height={480}
              className="h-16 w-16 transition-transform duration-500 group-hover:scale-[1.04] sm:h-20 sm:w-20"
            />
          </Link>

          <div className="min-w-0">
            <h3
              className="text-balance font-sans text-xl font-black leading-[1.08] tracking-[-0.02em] sm:text-2xl"
              style={{ color: TXLF_PAPER }}
            >
              {TXLF.name}
            </h3>
            <div
              className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]"
              style={{ color: `${TXLF_PAPER}cc` }}
            >
              <span className="flex items-center gap-1.5">
                <CalendarDays
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: TXLF_ORANGE }}
                />
                {TXLF.dateLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: TXLF_ORANGE }}
                />
                {TXLF.location}
              </span>
            </div>
          </div>
        </div>

        {/* Written here rather than lifted from their site. Their own words
            belong to them, and a sentence saying why a DEVSA reader should
            care is a different sentence from the one they open with. */}
        <p
          className="mt-5 text-[15px] leading-relaxed"
          style={{ color: `${TXLF_PAPER}b3` }}
        >
          The state&apos;s community-run Linux and open source conference, and a
          weekend built for the people who actually use it. DEVSA is a community
          partner.
        </p>

        <Link
          href={TXLF.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/cta mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
          style={{ backgroundColor: TXLF_ORANGE, color: TXLF_NAVY }}
        >
          Tickets and schedule
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  )
}
