import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { DD } from "@/components/demo-day/theme"
import { PapelPicado } from "@/components/demo-day/papel-picado"
import { ConfluenciaDisplay, ConfluenciaName } from "@/components/demo-day/wordmark"
import {
  DEMO_DAY_DEADLINE,
  DEMO_DAY_DESCRIPTOR,
  DEMO_DAY_PATH,
  DEMO_DAY_PAVILION_YEAR,
} from "@/lib/demo-day"

/**
 * Confluencia on the homepage — the slim version, directly after the
 * conferences.
 *
 * Why here: the homepage says DEVSA runs its own events and then shows the
 * four conferences; Confluencia is the fifth it owns, so it reads as "and
 * this is next", not an ad. It is also where most visitors are, and a
 * campaign with a January 31 deadline has to be seen in that window.
 *
 * Why slim: the homepage's argument is that DEVSA is a bridge, not a
 * destination, and DevsaConferences was moved down once already so DEVSA's
 * own events would not read as self-promotion. A full campaign band would
 * tip that back. So: the name, the dated descriptor, one sentence, the
 * deadline, two buttons, and the industries strip as the only visual — it
 * shows what Confluencia is about at a glance. No papel picado sheet; that
 * lives on /about and the share card.
 *
 * The Community Calendar stays the homepage's primary action. "Support" goes
 * to the designated donation, which is the site's #2 ask (Donate) aimed at
 * something specific rather than a third competing CTA.
 *
 * Temporary by design: after the funding deadline this either becomes
 * "funded — see you in April" or comes off the homepage. /about keeps its band.
 */
export function ConfluenciaHomeBand() {
  return (
    <section
      id="confluencia"
      className="relative w-full scroll-mt-20 overflow-hidden bg-[#0a0a0a]"
      data-bg-type="dark"
    >
      <div className="page-shell pt-16 md:pt-20">
        <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/55">
          What We&apos;re Building Next
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <h2>
              <ConfluenciaDisplay className="block text-[16vw] text-white sm:text-8xl xl:text-9xl" />
              <span className="sr-only">, {DEMO_DAY_DESCRIPTOR}</span>
            </h2>
            <p
              className="mt-3 font-sans text-2xl font-black tracking-[-0.02em] md:text-3xl"
              style={{ color: DD.marigold }}
            >
              DEVSA Demo Day {DEMO_DAY_PAVILION_YEAR}
            </p>
          </div>

          <div className="max-w-xl lg:pb-1">
            <p className="text-lg md:text-xl font-light leading-[1.45] text-white/70">
              Once a year, an industry partner brings the problem, San
              Antonio&apos;s builders bring the work, and investors are in the
              room when they show it.{" "}
              <span className="font-normal text-white">
                It happens if it is funded by {DEMO_DAY_DEADLINE}.
              </span>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {/* Opens the event page's inquiry form with "Lead partner"
                  already chosen — the form reads the #inquire-lead hash. */}
              <Link
                href={`${DEMO_DAY_PATH}#inquire-lead`}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: DD.marigold, color: DD.ink }}
              >
                Lead <ConfluenciaName />
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href={DEMO_DAY_PATH}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
              >
                See <ConfluenciaName />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PapelPicado variant="industries" className="mt-12 pb-6 md:mt-16" />
    </section>
  )
}
