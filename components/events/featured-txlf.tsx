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
 * ## Their colors, not ours
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
 *
 * ## Why it is built as tiled panes
 *
 * The first version was a badge beside a column of text on a flat navy
 * rectangle. Correct, legible, and plain next to the four conference surfaces
 * on this same page, each of which gets a brand's whole world — mascots, a
 * decrypting field, a luchador, a rotating head. A partner band does not get
 * to borrow those, because they belong to DEVSA activations and this is not
 * one. It needs a device of its own.
 *
 * The device is the subject: this is a Linux conference, so the card is laid
 * out the way a tiling window manager lays out a screen. A status bar across
 * the top, two panes below it, and a few pixels of darker ground showing
 * through every gap as though the desktop were behind them. That is a layout,
 * not an ornament — it survives at every breakpoint and it carries real
 * content in every region.
 *
 * What was deliberately NOT borrowed, having looked at omarchy.us for the
 * idiom: the theme-swatch chips and the ASCII bar charts. Both are somebody
 * else's signature, and a row of color chips on this card would mean nothing.
 * The bar, the gutters, the mono and the caret are the generic grammar; the
 * chips are a brand.
 *
 * ## The watermark that is not here
 *
 * The content pane was given the badge's lone star as a ground — cut out as a
 * white silhouette and bled off the pane's trailing edge at 5-7%, the way
 * PySanAntonio's clip bleeds off its hero. It did not work at any position
 * tried: the part that landed inside the pane is the Texas outline at the
 * star's centre, which faded to that opacity is an amorphous pale blob rather
 * than a mark, and it sat directly behind the headline. The card's graphic
 * weight belongs to the badge in the pane beside it, at full strength, once.
 *
 * Recorded because the asset is easy to want again and fiddly to cut. From
 * badge.webp: alpha = luminance, clipped to a circle of radius 162 about the
 * centre, composited onto white. Do NOT invert — the badge knocks the star out
 * of a navy disc, so inverting yields the negative, a navy star on white,
 * which is a different mark. That mistake was made first and is not obvious at
 * thumbnail size.
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
 * two colors, so the card stays theirs and stays legible. Copying a partner's
 * contrast failure onto our site is not fidelity.
 *
 * TXLF_DEEP is the only color here that is not theirs: the navy taken down to
 * roughly half its luminance, used for the gutters and the badge pane so the
 * tiles read as separate surfaces. Measured against it, paper is 15.35:1 and
 * the orange 5.96:1, so nothing on this card loses contrast by sitting on it.
 */
const TXLF_NAVY = "#002070"
const TXLF_PANE = "#001548"
const TXLF_DEEP = "#000d30"
const TXLF_PAPER = "#f0f0f0"
const TXLF_ORANGE = "#ff6600"

const TXLF = {
  name: "Texas Linux Festival 2026",
  dateLabel: "November 6–7, 2026",
  location: "Austin, TX",
  href: "https://2026.texaslinuxfest.org/",
  /* Both from their own about page. "Community-run since 2010" is the single
     truest thing about this conference and it was nowhere on the card. */
  domain: "texaslinuxfest.org",
  since: "community-run since 2010",
} as const

/** One tile. The radius is the shell's, less the gutter. */
const PANE = "relative overflow-hidden rounded-xl"

export function FeaturedTxlf() {
  return (
    <section
      /* `group` so the badge pane can answer a pointer anywhere on the card
         rather than only over the badge itself — the whole band is the target,
         the way the conference cards treat theirs. */
      className="group overflow-hidden rounded-2xl p-[5px]"
      style={{ backgroundColor: TXLF_DEEP }}
      data-bg-type="dark"
    >
      {/* The bar. Left is the address, right is the status — the arrangement
          every tiling setup ships with. Both halves carry fact rather than
          chrome; the date and place stay below at a size somebody can read
          across a room, because they are the two things this card exists to
          communicate. */}
      <div
        className={`${PANE} flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5`}
        style={{ backgroundColor: TXLF_NAVY }}
      >
        <span
          className="flex min-w-0 items-center gap-2.5 font-mono text-[11px] tracking-widest"
          style={{ color: TXLF_PAPER }}
        >
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-[1px]"
            style={{ backgroundColor: TXLF_ORANGE }}
          />
          <span className="truncate">{TXLF.domain}</span>
        </span>
        <span
          className="hidden shrink-0 font-mono text-[11px] tracking-widest sm:block"
          style={{ color: `${TXLF_PAPER}b3` }}
        >
          {TXLF.since}
        </span>
      </div>

      <div className="mt-[5px] grid gap-[5px] md:grid-cols-[1.6fr_1fr]">
        {/* The badge pane. First in the source so it leads on a phone, where a
            mark above a headline is the right order and a mark below the call
            to action is not. */}
        <div
          className={`${PANE} max-md:order-first md:order-2 flex items-center justify-center px-6 py-10 md:py-8`}
          style={{ backgroundColor: TXLF_PANE }}
        >
          {/* Their orange, behind their mark. The badge is navy and paper and
              sits flat on a dark pane without it. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(64% 60% at 50% 48%, rgba(255,102,0,0.34), transparent 72%)",
            }}
          />
          <Link
            href={TXLF.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative"
          >
            <Image
              src="/txlf/badge.webp"
              alt="Texas Linux Fest"
              width={480}
              height={480}
              className="h-32 w-32 transition-transform duration-500 group-hover:scale-[1.04] sm:h-40 sm:w-40 md:h-44 md:w-44 lg:h-56 lg:w-56"
            />
          </Link>
        </div>

        {/* The content pane. */}
        <div
          className={`${PANE} md:order-1 p-7 sm:p-9 md:p-10 lg:p-11`}
          style={{ backgroundColor: TXLF_NAVY }}
        >
          {/* A soft lift from the top-left corner, so the pane has a light
              source rather than being a flat fill.

              What was here instead, and why it went: the badge's lone star cut
              out as a silhouette (public/txlf/star.webp) and bled off this
              pane at 5-7%, the way PySanAntonio's clip bleeds off its hero.
              At every position tried, the part of it that landed inside the
              pane was the Texas outline at the star's center, which at that
              opacity is an amorphous pale blob, not a mark — and it sat
              directly behind the headline. The asset is still in public/txlf/
              and is worth keeping: it is correct, it is just too detailed to
              survive being faded. The card's graphic weight belongs to the
              badge in the pane beside this one, at full strength, once. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 85% at 0% 0%, rgba(255,255,255,0.07), transparent 65%)",
            }}
          />

          <div className="relative">
            <p
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest"
              style={{ color: TXLF_ORANGE }}
            >
              <span aria-hidden>$</span>
              Featured · Community Partner
              {/* A shell caret, held steady for readers who ask for less
                  motion — see the rule in globals.css. */}
              <span
                aria-hidden
                className="inline-block h-3 w-[7px] animate-[txlfCaret_1.1s_infinite] align-[-1px]"
                style={{ backgroundColor: TXLF_ORANGE }}
              />
            </p>

            <h2
              className="mt-4 text-balance font-sans text-3xl font-black leading-[1.02] tracking-[-0.02em] sm:text-4xl lg:text-5xl"
              style={{ color: TXLF_PAPER }}
            >
              {TXLF.name}
            </h2>

            <div
              className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
              style={{ color: `${TXLF_PAPER}cc` }}
            >
              <span className="flex items-center gap-2">
                <CalendarDays
                  className="h-4 w-4 shrink-0"
                  style={{ color: TXLF_ORANGE }}
                />
                {TXLF.dateLabel}
              </span>
              <span className="flex items-center gap-2">
                <MapPin
                  className="h-4 w-4 shrink-0"
                  style={{ color: TXLF_ORANGE }}
                />
                {TXLF.location}
              </span>
            </div>

            <p
              className="mt-5 max-w-xl text-base leading-relaxed"
              style={{ color: `${TXLF_PAPER}b3` }}
            >
              The state&apos;s community-run Linux and open source conference,
              and a weekend built for the people who actually use it — at home,
              at work, at school. DEVSA is a community partner.
            </p>

            <Link
              href={TXLF.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/cta mt-7 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
              style={{ backgroundColor: TXLF_ORANGE, color: TXLF_NAVY }}
            >
              Tickets and schedule
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
