import { CalendarDays, MapPin, Zap } from "lucide-react"
import {
  SASTW_2026,
  SASTW_ACTIVATIONS,
  SASTW_LOGO,
  SASTW_MAGENTA,
  SASTW_REGISTER_URL,
  MODEL_INK,
  MODEL_LAVENDER,
  type SastwActivation,
} from "@/data/sastw/2026"
import { ACCESS_GREEN } from "@/data/access-granted/2026"
import { PYSA_WORDMARK } from "@/data/pysa/2026"
import { BoltShader } from "@/components/sastw/bolt-shader"

/**
 * Featured-event hero for the community calendar — the whole week, not one
 * activation inside it.
 *
 * This replaced a PySanAntonio band. PySanAntonio is still here, but as one of
 * three DEVSA afternoons listed below the copy rather than as the thing the
 * page leads with: three activations promoted one at a time is three deploys
 * and two of them are always wrong.
 *
 * Built from next-sasw's homepage hero so the two sites read as the same week —
 * the wordmark, the "current runs through SA." line, the bolt with the WebGL
 * current in it, the five-circuit sweep, the magenta. Two departures:
 *
 *  · That hero is light (white ground, magenta accent, black Oswald). This band
 *    stays on the site's near-black, because the three activation lockups below
 *    are dark-surface treatments — ACCESS_GREEN is 1.4:1 on white and PySA's
 *    dark wordmark is drawn in a blue lifted specifically for black.
 *  · There the line and the mark are separate: an h1 in Oswald with the mark in
 *    the navbar above it. Here the mark IS the heading and the line opens the
 *    paragraph, because a promo band inside a page has one heading slot to
 *    spend and the wordmark says the name better than type can.
 *
 * The heading is an h2 for the same reason its predecessor's was: the calendar
 * section below owns this page's subject, so a promo should not outrank it in
 * the outline.
 */

/**
 * Buttons, in SASTW magenta rather than PySanAntonio's yellow or Access
 * Granted's green — this band is the week's, so it wears the week's colour.
 *
 * Same shape as those two sets (rounded-lg, px-6 py-3.5 sm:py-3, text-sm),
 * because the shape is the site's and only the colour is the event's. The
 * magenta is written as a literal because Tailwind scans this file as text at
 * build time and cannot see through the imported constant — keep it in step
 * with SASTW_MAGENTA in data/sastw/2026.ts by hand.
 *
 * Black label on the fill, not white. #ff32a0 carries white at only 3.4:1;
 * against #0a0a0a it is 6.2:1. next-sasw ships the white-label version as a
 * known, documented exception — there is no reason to inherit the exception
 * along with the colour.
 */
const base =
  "group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 sm:py-3 text-sm font-semibold sm:font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"

const primaryButton = `${base} bg-[#ff32a0] text-[#0a0a0a] hover:bg-[#e62c90] focus-visible:ring-[#ff32a0]`

const META = [
  { Icon: CalendarDays, label: "Date", value: SASTW_2026.dateLabel },
  { Icon: Zap, label: "Edition", value: SASTW_2026.edition },
  // The district, not a building. This rail used to name The Rand, which is
  // DEVSA's floor for the week rather than the week's address — see `location`
  // in data/sastw/2026.ts. Nothing on the band names a building now; where the
  // three activations sit is their own pages' to say.
  { Icon: MapPin, label: "Where", value: SASTW_2026.location },
]

/**
 * Each activation as its own brand, at one optical size.
 *
 * Not a house treatment with three titles in it. Two of these three brands are
 * a font and a colour rather than a file — Access Granted splits its first word
 * into the green, The Model catches its second in a selection block — so
 * setting them as plain white text would be as wrong as swapping PySanAntonio's
 * wordmark for the words "Py San Antonio". These are the same lockups the three
 * pages use, held to the cap height of the line beside them: a wordmark three
 * times the height of its neighbours reads as a ranking nobody intended.
 */
function ActivationLockup({ lockup }: { lockup: SastwActivation["lockup"] }) {
  if (lockup === "pysanantonio") {
    return (
      // `svgDark`, not `svg`: the light variant draws in #0059b7, which is
      // 2.9:1 on this ground and sinks into it.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={PYSA_WORDMARK.svgDark}
        alt="PySanAntonio"
        width={PYSA_WORDMARK.width}
        height={PYSA_WORDMARK.height}
        className="h-6 w-auto sm:h-7"
      />
    )
  }

  if (lockup === "access-granted") {
    return (
      // Geist Sans at its heaviest, which is how the Access Granted page here
      // stands in for next-sasw's Oswald — this repo has no display face.
      <span className="font-sans text-xl font-black uppercase leading-none tracking-tight text-white sm:text-2xl">
        <span style={{ color: ACCESS_GREEN }}>Access</span> Granted
      </span>
    )
  }

  return (
    <span className="font-mono text-xl font-medium uppercase leading-none tracking-tight text-white/85 sm:text-2xl">
      The{" "}
      <span
        className="box-decoration-clone px-1.5"
        style={{ backgroundColor: MODEL_LAVENDER, color: MODEL_INK }}
      >
        Model
      </span>
    </span>
  )
}

/**
 * Takes no props. It carried `phase` and `daysLeft` for a line under the
 * button counting down PySanAntonio's call for speakers; with that gone the
 * band is entirely static content, which is also what let /events stop
 * revalidating hourly.
 */
export function FeaturedSastw() {
  return (
    // A contained band inside the calendar, not a hero in front of it.
    //
    // This used to be `min-h-dvh` and full-bleed, which meant a visitor who
    // clicked a nav item labelled "Community Calendar" landed on a screen with
    // no calendar on it and nothing indicating one existed. It also put a
    // permanent full-viewport promo above twenty other groups' events on the
    // surface whose whole value is being the neutral index — and it needed a
    // "Community Calendar" skip button, which is a design admitting its own
    // hero is in the way.
    //
    // Rounded and inset now, sitting between the calendar's headline and its
    // list. The page says what it is, makes its pitch, then delivers, and the
    // feature reads as an item inside the calendar rather than a toll gate in
    // front of it.
    <section
      data-bg-type="dark"
      className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] text-white"
    >
      {/* Magenta wash, standing in for the glow the shader canvas throws. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full opacity-25 blur-[110px]"
        style={{
          background: `radial-gradient(circle, ${SASTW_MAGENTA} 0%, transparent 65%)`,
        }}
      />

      {/* Desktop only: the bolt, with the current running through it. No mascot
          equivalent on phones either — the mark is the week's identity, but on
          the one viewport that can least afford it the copy and the wash carry
          the band on their own. Which is also why the shader is behind a `md`
          breakpoint rather than an `active` prop: below it the canvas is not
          rendered at all, so no phone pays for a WebGL context it can't see.

          Not `pointer-events-none`, unlike everything else layered into this
          band. The sweep is the whole reason this is a shader rather than the
          flat SVG, and it needs the cursor — the scrim above it stays inert so
          the events reach the canvas. */}
      <div className="absolute inset-y-0 right-0 hidden w-[52%] select-none items-center justify-center md:flex">
        <BoltShader className="aspect-square w-[78%] max-w-136" />
      </div>

      {/* Desktop scrim: solid under the copy, clearing before the bolt. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.9) 34%, rgba(10,10,10,0.35) 58%, rgba(10,10,10,0) 80%)",
        }}
      />

      {/* Own padding, not `page-shell`. The band is inset within the calendar's
          shell now, so borrowing the page gutter again would indent the copy
          twice. The navbar-clearing top padding is gone with the same change —
          nothing sits under the navbar any more. */}
      <div className="relative z-20 px-6 py-12 sm:px-8 md:py-14 lg:px-12">
        <div className="flex max-w-xl flex-col gap-6 xl:max-w-160">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Featured event
            </p>

            {/* The lockup IS the heading — no typeset title beside it.
                "San Antonio Startup + Tech Week" set in Geist next to its own
                wordmark was the same name twice in two voices, and the week
                has a mark precisely so it doesn't have to be spelled out. The
                `alt` carries the name for anything that can't see it, which is
                what keeps this a real h2 in the outline rather than an image
                with a heading wrapped around nothing.

                Bigger than it was when it shared the block with a headline —
                it is now the only thing at this level. */}
            <h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SASTW_LOGO.white}
                alt={SASTW_2026.name}
                width={1200}
                height={300}
                className="h-auto w-full max-w-104 lg:max-w-lg"
              />
            </h2>
          </div>

          <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/60">
            {META.map(({ Icon, label, value }) => (
              <div key={label} className="inline-flex items-center gap-2">
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: SASTW_MAGENTA }}
                  aria-hidden="true"
                />
                <dt className="sr-only">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-4">
            {/* The week's own headline opens the paragraph rather than
                standing as a second heading over it. It is a line, not a
                label — and read as the first sentence of the copy it does the
                job it was written for, which is to say what the week feels
                like before the paragraph says what is in it.

                Set in the body face at the body size, only heavier, so it
                leads the paragraph without competing with the lockup above.
                The last three words are held together so the magenta never
                orphans onto its own line. */}
            <p className="text-pretty text-base text-white/70">
              <span className="font-semibold text-white">
                The current{" "}
                <span className="whitespace-nowrap">
                  runs through{" "}
                  <span style={{ color: SASTW_MAGENTA }}>SA.</span>
                </span>
              </span>{" "}
              Five days across downtown — keynotes, pitch stages, workshops, and a week full of activations powered by
              DEVSA.
            </p>

            {/* A list, not three more sentences. Each one is a brand, and the
                brands are the point — see ActivationLockup.

                Three plain anchors, no internal/external branch. Two of these
                do have a DEVSA page, and both still point at sasw.co: a reader
                here is asking what is on, and those two pages answer "how do I
                submit a talk" instead. The reasoning lives with the hrefs in
                data/sastw/2026.ts. */}
            <ul
              className="flex flex-col gap-4 border-l pl-5"
              style={{ borderColor: "rgba(255,50,160,0.35)" }}
            >
              {SASTW_ACTIVATIONS.map((activation) => (
                <li key={activation.name}>
                  <a
                    href={activation.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${activation.name} — ${activation.dateLabel}`}
                    className="inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
                  >
                    <ActivationLockup lockup={activation.lockup} />
                    <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
                      {activation.dateLabel}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            {/* One action, not two.

                There was a "Community Calendar" button beside this one, whose
                job was to let someone escape a full-viewport promo and reach
                the list. The band sits inside the calendar now, with the list
                directly beneath it, so a link to the section it lives in would
                point at itself. Removing it is the check that the reorder
                actually worked — if the band still needed an escape hatch, it
                would still be in the way. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={SASTW_REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={primaryButton}
              >
                Register for the week
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
