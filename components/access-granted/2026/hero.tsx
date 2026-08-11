import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import {
  ACCESS_AMBER,
  ACCESS_GRANTED,
  ACCESS_GREEN,
  AG_CFS_CLOSES_LABEL,
  AG_LOCK,
  AG_ONE_LINER,
  AG_ORGANIZERS,
  GRID_FADE,
  GRID_LINE,
  type AgCfsPhase,
} from "@/data/access-granted/2026"
import { SastwLockup } from "@/components/access-granted/2026/sastw-lockup"
import { disabledSlot, primaryButton, secondaryButton } from "@/components/access-granted/2026/button-styles"

/**
 * Access Granted's masthead, ported from next-sasw's AccessGrantedBand.
 *
 * The layout, the three art layers, the terminal grammar and the proportions
 * are that component's, not a new design — the activation already had a hero
 * and the two sites should not diverge. What changed is only what had to:
 *
 *  · The heading is an h1, not an h2. There it is a band among sections; here
 *    it is the page's subject.
 *  · `font-display` does not exist in this repo, so the name is set in Geist
 *    Sans black — the closest thing to a display face among the loaded
 *    weights, and what the OG cards use too.
 *  · The buttons are this page's two open calls rather than "Full event
 *    details" / "See the full week", because running those calls is the only
 *    reason this page exists on the DEVSA site.
 *
 * The brand is carried by the green and by terminal grammar: `>_` before the
 * machine-ish labels, mono for anything that reads as data. Restrained on
 * purpose — the brief's own warning was that this must not look like a 1990s
 * movie poster, so the green marks the prompt, the one-liner's rule and the
 * meta rail's icons, and nothing else.
 */
function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-widest text-white/55">
      <span aria-hidden="true" style={{ color: ACCESS_GREEN }}>
        {">_ "}
      </span>
      {children}
    </p>
  )
}

const META = [
  { Icon: CalendarDays, label: "Date", value: ACCESS_GRANTED.dateLabel },
  { Icon: Clock, label: "Time", value: ACCESS_GRANTED.timeLabel },
  {
    Icon: MapPin,
    label: "Where",
    value: `${ACCESS_GRANTED.venue}, ${ACCESS_GRANTED.venueDetail}`,
  },
]

export function AccessGrantedHero({
  phase,
  daysLeft,
}: {
  phase: AgCfsPhase
  /**
   * Computed on the server. The page revalidates hourly, so a whole-day count
   * is never meaningfully stale.
   */
  daysLeft: number
}) {
  const isOpen = phase === "open"

  return (
    <section
      id="top"
      data-bg-type="dark"
      className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden bg-[#0a0a0a]"
    >
      <div className="page-shell relative z-20 pb-20 pt-24 lg:pb-28 lg:pt-28">
        {/*
          `auto` for the copy column, not `1fr`.

          With `1fr` the column takes the whole row while the copy inside it
          caps at its own max width, so the leftover sits between the text and
          the art on top of the gap — an effective trench. Sized to its content,
          the gap is only the gap.

          The lock is a column rather than an absolute overlay: positioned
          absolutely it bleeds down over everything beneath it. It has its own
          glow and a hard silhouette, so it cannot be scrimmed into the black
          the way a photograph could.
        */}
        <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12 xl:gap-16">
          <div className="contents lg:block lg:max-w-xl xl:max-w-2xl">
            {/* No track eyebrow above the name. It briefly read "Tech &
                Builders" — the week's official category — but placing this
                room inside the week's programme is the SASTW site's job, and
                here it only pushed the name down the column. The SastwLockup
                below already says which week this belongs to.

                Orders start at 2 rather than 1 as a result; the values only
                have to be in sequence, not contiguous, and renumbering every
                sibling to close the gap would be churn. */}

            {/* Geist Sans at its heaviest, standing in for next-sasw's
                `font-display` — this repo has no display face, and of what is
                loaded Geist Sans black is the closest thing to one. It takes
                that heading's own `leading-[0.9] tracking-tight` rather than
                mono's letterspacing, which only existed to keep a monospace
                face from reading as code.

                The name is the one thing NOT set in mono here. Everything that
                reads as data — the `>_` prompts, the meta rail, the badges —
                stays Geist Mono, so the terminal grammar still marks the
                machine-ish parts instead of swallowing the title too. */}
            <h1 className="order-2 font-sans text-4xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl">
              <span style={{ color: ACCESS_GREEN }}>Access</span> Granted
            </h1>

            {/* A rule rather than a filled green panel — a solid block of
                #00ff66 at this size shouts, and the green is meant to stay
                sparing. */}
            <p
              className="order-3 mt-5 border-l-2 pl-5 text-pretty text-lg text-white/80"
              style={{ borderColor: ACCESS_GREEN }}
            >
              {AG_ONE_LINER.setup}{" "}
              {/* Desktop-only. `hidden` below lg leaves the space above it
                  intact, so the two halves read as one sentence on a narrow
                  column; from lg the space collapses against the break. */}
              <br className="hidden lg:inline" />
              {AG_ONE_LINER.turn}
            </p>

            <div className="order-5 mt-6">
              <SastwLockup />
            </div>

            <dl className="order-6 mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-white/55">
              {META.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <dt className="sr-only">{label}</dt>
                  <Icon
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: ACCESS_GREEN }}
                    aria-hidden="true"
                  />
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {/* The three badge pills — free · drop-in, all skill levels, no
                sales pitches — used to sit here. next-sasw shows them because
                that page is the front door for attendees, and they answer what
                someone asks before committing an afternoon. This page's job is
                the open calls, and its readers are people deciding whether to
                submit, not whether to turn up. */}

            {/* In the column, not below the grid. Below it they were stranded
                under a much taller art column. */}
            <div className="order-8 mt-9">
              <Prompt>Powered by</Prompt>
              {/* Three across on phones. As a flex-wrap this ran 4 + 1 from
                  414px up — every Pro-sized handset — widowing the last mark.
                  A fixed three keeps the rows even; sm and up it flows on one
                  line. */}
              <ul className="mt-4 grid grid-cols-3 items-center justify-items-start gap-x-6 gap-y-7 sm:flex sm:flex-wrap sm:gap-x-9 sm:gap-y-6">
                {AG_ORGANIZERS.map((org) => (
                  <li key={org.name}>
                    <a
                      href={org.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={org.name}
                      className="block opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
                    >
                      <Image
                        src={org.logo}
                        alt={org.name}
                        width={240}
                        height={120}
                        sizes="160px"
                        className={`w-auto object-contain ${org.heightClass}`}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Both CTAs land on the same section now that one form handles
                both calls — the form's own intent picker is what splits them.
                Two buttons rather than one because the two asks reach
                different people, and "help run it" has to be visible to
                someone who would never submit a talk. */}
            <div className="order-9 mt-9 flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {isOpen ? (
                  <Link href="#call" className={primaryButton}>
                    Submit a talk
                  </Link>
                ) : (
                  <span className={disabledSlot}>Speaker lineup coming soon</span>
                )}
                <Link href="#call" className={secondaryButton}>
                  Help run it
                </Link>
              </div>

              {isOpen && (
                <p className="text-sm text-white/50">
                  {daysLeft === 0 ? (
                    <>
                      The call closes{" "}
                      <span className="font-semibold text-white">today</span>.
                    </>
                  ) : (
                    <>
                      The call closes in{" "}
                      <span className="font-semibold" style={{ color: ACCESS_AMBER }}>
                        {daysLeft} {daysLeft === 1 ? "day" : "days"}
                      </span>{" "}
                      — {AG_CFS_CLOSES_LABEL}.
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/*
            Three layers, so the render sits *in* something rather than on it.

            A transparent PNG with a hard silhouette cannot be dissolved into
            the black — masking it would cut the object. What it can have is an
            environment, and the artwork supplies the logic: it is already
            emitting green light, so the honest move is to let that light land
            on something.

              · a schematic grid, faint and radially masked, giving the glow a
                surface to fall on — HUD rather than poster.
              · the lock's own spill, centred on the body rather than parked
                beside it.
              · a contact shadow under the body — the one cue that says an
                object has weight and is resting on something.

            Both wash layers reach left, past the art and under the copy, rather
            than being a halo around the object. An ellipse centred at 68% of a
            box that extends 150% to the left — centred on the box it would sit
            in empty space instead of on the lock.

            Sized against the copy, not the row: at 26rem the render stood far
            taller than the text beside it and read as the subject with the copy
            as a caption. 22rem brings it roughly level.
          */}
          <div className="relative order-4 mx-auto my-10 w-40 sm:w-48 lg:order-none lg:my-0 lg:ml-auto lg:mr-0 lg:w-72 xl:w-[22rem]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-y-[45%] -left-[150%] -right-[45%]"
              style={{
                backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
                backgroundSize: "34px 34px",
                maskImage: GRID_FADE,
                WebkitMaskImage: GRID_FADE,
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-y-[28%] -left-[110%] -right-[28%] blur-[70px]"
              style={{
                background: `radial-gradient(ellipse 52% 62% at 70% 58%, ${ACCESS_GREEN}4d 0%, transparent 68%)`,
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[12%] bottom-[3%] h-8 rounded-[50%] blur-[26px]"
              style={{ background: `${ACCESS_GREEN}33` }}
            />
            <Image
              src={AG_LOCK.src}
              alt=""
              width={AG_LOCK.width}
              height={AG_LOCK.height}
              priority
              sizes="(min-width: 1280px) 352px, (min-width: 1024px) 288px, 192px"
              className="relative h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
