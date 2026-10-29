import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

/**
 * DEVSA TV's announcement: DEVSA programming is coming to TVSA, San Antonio's
 * public access channel, starting with Christmas editions in December 2026.
 *
 * What it can and can't say yet. TVSA approved the programming on 2026-10-29;
 * the credit wording ("on TVSA" rather than any "DEVSA × TVSA" that reads as a
 * co-production) and use of TVSA's logo are being confirmed with them. This
 * preview shows TVSA's "Public" logo and the three providers' logos on Jesse's
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
 */

// Each logo sized by eye so the three read at the same weight.
const CHANNELS = [
  { provider: "Spectrum", logo: "/tv/spectrum-dark.svg", w: 104, h: 26, number: "20", color: "#00b2a9" },
  { provider: "Grande", logo: "/tv/grande-dark.svg", w: 112, h: 38, number: "19", color: "#ef426f" },
  { provider: "AT&T", logo: "/tv/att-dark.svg", w: 86, h: 35, number: "99", color: "#ff8200" },
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

export function TvHero() {
  return (
    <section className="relative overflow-hidden bg-[#161616] lg:min-h-dvh" data-bg-type="dark">
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
      <div aria-hidden className="absolute inset-x-0 top-0 flex h-1.5">
        <span className="flex-1 bg-[#00b2a9]" />
        <span className="flex-1 bg-[#ef426f]" />
        <span className="flex-1 bg-[#ff8200]" />
      </div>

      <div className="page-shell relative grid items-center gap-12 py-20 md:py-28 lg:min-h-dvh lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Coming this December</p>
          <h1 className="mt-5 text-balance font-sans text-5xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-6xl xl:text-7xl">
            DEVSA is coming to <span className="font-light italic text-white/55">your</span> TV.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
            <strong className="font-semibold text-white">From the meetup room to your living room.</strong> DEVSA
            programming on{" "}
            {/* Logo and comma kept together, so the comma never starts a line on a phone. */}
            <span className="whitespace-nowrap">
              <Image
                src="/tv/tvsa-dark.png"
                alt="TVSA"
                width={845}
                height={365}
                className="ml-1 inline-block h-[1.85em] w-auto -translate-y-[0.1em] align-middle"
              />
              ,
            </span>{" "}
            San Antonio&apos;s public access channel, featuring the groups, speakers and builders DEVSA connects.
          </p>

          {/* Where to watch: TVSA's public access channel on each provider. */}
          <ul className="mt-8 grid max-w-xl grid-cols-3 gap-3" aria-label="Where to watch">
            {CHANNELS.map((c) => (
              <li key={c.provider} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                {/* A fixed-height row, so the numbers line up whatever each logo's shape. */}
                <span className="flex h-10 items-center">
                  <Image src={c.logo} alt={c.provider} width={c.w} height={c.h} className="w-auto max-w-full object-contain object-left" style={{ height: c.h }} />
                </span>
                <span className="block text-3xl font-black tabular-nums text-white md:text-4xl">{c.number}</span>
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1" style={{ background: c.color }} />
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-sm text-white/60">
            <span className="text-[#00b2a9]">+</span> streaming on TVSA&nbsp;&nbsp;
            <span className="text-[#ef426f]">+</span> every episode on our YouTube
          </p>

          {/* The schedule, honestly: the month is set, the slots aren't. */}
          <div className="mt-8 max-w-xl rounded-xl border border-white/10 bg-black/40 p-5 font-mono text-sm">
            <p className="text-white">
              <span className="text-[#00b2a9]">&gt;</span> devsa-tv --schedule
            </p>
            <dl className="mt-3 space-y-1.5 text-white/70">
              <div className="flex gap-3">
                <dt className="w-40 shrink-0 text-white/55">first episodes</dt>
                <dd className="text-white">December 2026</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-40 shrink-0 text-white/55">air dates &amp; times</dt>
                <dd>
                  <span className="text-[#ff8200]">coming soon</span>
                  <span aria-hidden className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-[#ef426f] motion-safe:animate-[txlfCaret_1.1s_infinite]" />
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://www.youtube.com/@devsatx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
            >
              Subscribe on YouTube
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
            >
              Community Calendar
            </Link>
          </div>
        </div>

        {/* Supporting the headline, not competing with it: at max-w-md the mark stood as
            tall as the whole column of copy. */}
        <div className="mx-auto w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[340px]">
          <ClapperMark />
        </div>
      </div>
    </section>
  )
}
