import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

/**
 * DEVSA TV's announcement: DEVSA programming is coming to TVSA, San Antonio's
 * public access channel, starting with Christmas editions in December 2026.
 *
 * What it can and can't say yet. TVSA approved the programming on 2026-10-29;
 * the credit wording ("on TVSA" rather than any "DEVSA × TVSA" that reads as a
 * co-production) and use of TVSA's logo are being confirmed with them. The
 * page shows TVSA's "Public" logo and the three providers' logos on Jesse's
 * call; if TVSA or a provider says no, swap the image back for the name. Air
 * dates and times aren't set: the schedule says so rather than guessing.
 * Channel numbers are TVSA's own (sa.gov, the Public row). TVSA hands DEVSA
 * the recordings, so every episode also goes up on DEVSA's YouTube.
 *
 * The logos in public/tv/ are versions for a dark ground: TVSA's white card
 * removed and "PUBLIC" lightened, and each provider's dark lettering turned
 * off-white, brand colors kept.
 *
 * The mark is the DEVSA mark redrawn as a clapperboard ("SA" becomes "TV"),
 * set on #161616 because its near-black body disappears on pure black, and
 * never with a "DEVSA TV" wordmark beside it. Its arm claps shut once on load;
 * reduced motion leaves it open and still.
 *
 * ## Layout (2026-11-01)
 *
 * Rebuilt from scratch because it was busy: eight elements in five idioms
 * (headline, a paragraph with a logo set into it, three channel cards with
 * color bars, a mono "+ streaming" line, a terminal schedule box, two buttons,
 * the mark, and a tricolor stripe over all of it), so nothing led.
 *
 * Now two parts. Above: the headline, one lead line and one action, with the
 * mark beside them at a size that can carry the right half. Below: where and
 * when, as one row of facts in the shape the conference pages use (value
 * large, label small), with each provider's logo as the label over its channel
 * number, and YouTube as the fourth place to watch. The terminal box, the
 * streaming line, the second button and the stripe are gone. The month is in
 * the lead line ("starting this December"); air dates and times are not set,
 * and the page says nothing more specific than the month until they are.
 */

// Each logo sized by eye so the three read at the same weight.
const CHANNELS = [
  { provider: "Spectrum", logo: "/tv/spectrum-dark.svg", w: 104, h: 26, number: "20" },
  { provider: "Grande", logo: "/tv/grande-dark.svg", w: 112, h: 38, number: "19" },
  { provider: "AT&T", logo: "/tv/att-dark.svg", w: 86, h: 35, number: "99" },
]

function ClapperMark() {
  return (
    <svg
      viewBox="-24.7 -267 764.4 823.4"
      className="h-auto w-full"
      role="img"
      aria-label="The DEVSA TV mark: the DEVSA logo drawn as a film clapperboard"
    >
      {/* The arm: hinged at its left end, so it rotates about (0, -8). */}
      <g className="tv-arm" style={{ transformBox: "view-box", transformOrigin: "0px -8px", transform: "rotate(-13deg)" }}>
        <g transform="translate(0 -99.9)">
          <rect x="0" y="0" width="735.7" height="91.9" rx="14" fill="#2b2b2b" />
          <path fill="#00b2a9" d="M196,0 h150 l-46,91.9 h-150 Z" />
          <path fill="#ef426f" d="M358,0 h150 l-46,91.9 h-150 Z" />
          <path fill="#ff8200" d="M520,0 h150 l-46,91.9 h-150 Z" />
        </g>
      </g>
      <g>
        <rect x="0" y="0" width="735.7" height="91.9" rx="14" fill="#2b2b2b" />
        <path fill="#00b2a9" d="M196,0 h150 l-46,91.9 h-150 Z" />
        <path fill="#ef426f" d="M358,0 h150 l-46,91.9 h-150 Z" />
        <path fill="#ff8200" d="M520,0 h150 l-46,91.9 h-150 Z" />
        <rect x="0" y="0" width="136" height="91.9" rx="14" fill="#0a0a0a" />
        <circle cx="38" cy="26" r="11" fill="#eeeeee" />
        <circle cx="38" cy="66" r="11" fill="#eeeeee" />
        <circle cx="98" cy="66" r="11" fill="#eeeeee" />
      </g>
      <g transform="translate(0 0.6)">
        <path d="M0,107.3h735.7v413.8c0,16.8-13.8,30.7-30.7,30.7H30.6c-16.9,0-30.6-13.8-30.6-30.7V107.3Z" fill="#0a0a0a" />
        <path
          d="M193.1,320.3l-95,95c-7.7,7.7-7.7,18.4,0,24.5l27.6,27.6c7.7,7.7,18.4,7.7,24.5,0l134.9-134.9c6.8-5.6,7.7-15.7,2.1-22.4-.6-.8-1.3-1.5-2.1-2.1l-134.9-134.9c-6.1-6.1-18.4-6.1-24.5,0l-27.6,27.6c-7.7,6.1-7.7,16.9,0,24.5l95,95h0Z"
          fill="#eeeeee"
        />
        <path
          d="M352.5,459.8c0,9.2,6.1,15.3,15.3,15.3h245.2c9.2,0,15.3-6.1,15.3-15.3v-46c0-9.2-6.1-15.3-15.3-15.3h-245.3c-9.2,0-15.3,6.1-15.3,15.3v46h0Z"
          fill="#eeeeee"
        />
        <g transform="translate(348.7 370.2)">
          <path
            fill="#eeeeee"
            d="M44.47 0V-113.33H2.05V-145.5H127.26V-113.33H84.84V0Z M181.36 0 128.9 -145.5H169.89L204.31 -45.49L238.74 -145.5H279.73L226.86 0Z"
          />
        </g>
      </g>
    </svg>
  )
}

/** YouTube's play button, in its own red with the white triangle. */
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-auto">
      <path fill="#ffffff" d="M9.545 15.568V8.432L15.818 12z" />
      <path
        fill="#ff0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  )
}

export function TvHero() {
  return (
    <section className="relative overflow-hidden bg-[#161616]" data-bg-type="dark">
      {/* The clap: open, shut on the beat, open again. Once, on load. */}
      <style>{`
        @keyframes tv-clap {
          0%, 55% { transform: rotate(-13deg); }
          68% { transform: rotate(0deg); }
          100% { transform: rotate(-13deg); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .tv-arm { animation: tv-clap 1.6s cubic-bezier(.6, 0, .3, 1) .4s 1 both; }
        }
      `}</style>

      {/* One screen from lg: the statement fills the space under the navbar and the
          facts row sits on the bottom edge. */}
      <div className="page-shell flex flex-col pt-12 pb-10 md:pt-20 lg:min-h-[min(calc(100svh-3rem),56rem)] lg:pt-16">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* The mark leads on a phone, where there is no room beside anything. */}
          <div className="order-first mx-auto w-full max-w-[200px] sm:max-w-[240px] lg:order-last lg:max-w-[400px]">
            <ClapperMark />
          </div>

          <div className="max-w-2xl">
            {/* No eyebrow: "Coming this December" repeated the facts row's last
                entry, and the headline needs nothing over it. */}
            <h1 className="text-balance font-sans text-5xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-6xl lg:text-7xl">
              DEVSA is coming to <span className="font-light italic text-white/55">your</span> TV.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
              <strong className="font-semibold text-white">From the meetup room to your living room.</strong> The
              groups, speakers and builders DEVSA connects, on{" "}
              {/* Logo and comma kept together, so the comma never starts a line on a phone.
                  TVSA's letters without the "PUBLIC" line under them (2026-11-01), at
                  the text's own size: the letters fill 91% of the image, so 0.78em
                  makes them as tall as Geist's capitals, sat on the baseline. At
                  1.5em it read as a logo dropped into the sentence. */}
              <span className="whitespace-nowrap">
                <Image
                  src="/tv/tvsa.png"
                  alt="TVSA"
                  width={858}
                  height={292}
                  className="inline-block h-[0.78em] w-auto translate-y-[0.04em] align-baseline"
                />
                ,
              </span>{" "}
              San Antonio&apos;s public access channel, starting this December.
            </p>
            <a
              href="https://www.youtube.com/@devsatx"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
            >
              Subscribe on YouTube
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Where and when, as facts. The provider's logo is each channel's label. */}
        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 md:grid-cols-4 lg:mt-12">
          {CHANNELS.map((c) => (
            <div key={c.provider} className="relative min-w-0">
              <dt className="flex h-8 items-center">
                <Image src={c.logo} alt={c.provider} width={c.w} height={c.h} className="w-auto max-w-full object-contain object-left" style={{ height: Math.round(c.h * 0.8) }} />
                <span className="sr-only">, channel</span>
              </dt>
              <dd className="mt-2 font-sans text-3xl font-black tabular-nums leading-none text-white md:text-4xl">{c.number}</dd>
            </div>
          ))}
          {/* YouTube is a fourth place to watch: TVSA hands DEVSA the recordings, so
              every episode goes up on the channel. It took the place of "First
              episodes: December", which moved into the lead line. */}
          <div className="min-w-0">
            <dt className="flex h-8 items-center gap-2 text-base font-semibold tracking-tight text-white">
              <YouTubeIcon />
              YouTube
            </dt>
            <dd className="mt-2 font-sans text-3xl font-black leading-none tracking-tight text-white md:text-4xl">
              <a href="https://www.youtube.com/@devsatx" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white/80">
                @devsatx
              </a>
            </dd>
            <dd className="mt-2 text-sm text-white/55">Every episode</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
