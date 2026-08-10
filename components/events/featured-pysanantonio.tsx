import Link from "next/link"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import { SastwLockup } from "@/components/pysa/2026/cobrand-row"
import { MascotClip } from "@/components/pysa/2026/mascot-clip"
import { primaryButton, secondaryButton } from "@/components/pysa/2026/button-styles"
import {
  PYSA_2026,
  PYSA_COLORS,
  PYSA_WORDMARK,
  type CfsPhase,
} from "@/data/pysa/2026"

/**
 * Feathers the clip's left edge — the one facing the copy — so its box never
 * reads as a seam.
 *
 * Shallow (opaque by 15%) because the figure MOVES. This was 30% when the box
 * held a still, and that still was the clip's best frame: the mascot settled
 * right of centre, well clear of the fade. Over the loop he drifts about 170px
 * left of there, far enough that a 30% fade washed out his face and bow tie
 * for the opening seconds of every pass.
 *
 * Little is lost by pulling it back, because this fade was largely redundant:
 * the desktop scrim below clears at 80% of the viewport, which is already the
 * left 63% of this box. The scrim hides the seam; the mask only has to soften
 * what is left.
 */
const IMAGE_MASK =
  "linear-gradient(to right, transparent 0%, black 15%, black 100%)"

/**
 * Featured-event hero for the community calendar, built from the PySanAntonio
 * hero so the two read as the same event.
 *
 * Deliberately not a copy of that hero. It crops the clip to a taller, narrower
 * window and stays a band rather than claiming the page, and the heading is an
 * h2: the calendar section below owns this page's subject, so a promo should
 * not outrank it in the outline.
 *
 * It held the poster still instead of the clip while the clip was 6.8 MB —
 * too much to spend on a promo above the thing the page is actually for. At
 * 900 KB that tradeoff is gone, and the still it was showing is now this
 * video's poster frame, so nothing regresses if playback never starts.
 */
export function FeaturedPySanAntonio({
  phase,
  daysLeft,
}: {
  phase: CfsPhase
  /** Computed on the server; the page revalidates hourly. */
  daysLeft: number
}) {
  return (
    <section
      data-bg-type="dark"
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden border-b border-white/10 bg-[#0a0a0a] text-white"
    >
      {/* Blue wash, echoing the guitar — same accent as the event page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full opacity-25 blur-[110px]"
        style={{
          background: `radial-gradient(circle, ${PYSA_COLORS.blue} 0%, transparent 65%)`,
        }}
      />

      {/* Desktop only: the clip, bled off the right edge. Now that the box is
          viewport-tall it crops the sides rather than the top, so the raised
          fingers survive — but the figure sits right of centre in the frame, so
          the window is biased that way to keep the guitar from clipping.

          Box, crop and mask are unchanged from the still this replaced — the
          poster below IS that still, so the section looks identical until
          playback starts and then simply moves. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] select-none md:block">
        <MascotClip
          className="h-full w-full object-cover object-[58%_center]"
          style={{ maskImage: IMAGE_MASK, WebkitMaskImage: IMAGE_MASK }}
        />
      </div>

      {/* No mascot on phones. He stood in the lower-right here, which meant the
          copy had to reserve a tall band below itself to keep him off the
          full-width button — a lot of dead space on the one viewport that can
          least afford it, to carry art that is already on the conference page.
          The clip above is desktop-only, so phones get the copy and the wash. */}

      {/* Desktop scrim: solid under the copy, clearing before the clip. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.9) 34%, rgba(10,10,10,0.35) 58%, rgba(10,10,10,0) 80%)",
        }}
      />

      {/* pt clears the fixed navbar even on a viewport too short for the content
          to stay centred. Base pb used to be pb-60, reserving the band the
          mobile mascot stood in; with him gone every breakpoint just gets
          normal spacing. */}
      <div className="page-shell relative z-20 pb-16 pt-24 md:pb-20 md:pt-28">
        <div className="flex max-w-[36rem] flex-col gap-6 xl:max-w-[40rem]">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Featured event
            </p>

            <h2 className="flex flex-col items-start gap-1 font-sans text-3xl font-black leading-[0.95] tracking-[-0.02em] md:text-4xl lg:text-5xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PYSA_WORDMARK.svgDark}
                alt="PySanAntonio"
                width={PYSA_WORDMARK.width}
                height={PYSA_WORDMARK.height}
                className="h-auto w-full max-w-[22rem] lg:max-w-[26rem]"
              />
              <span className="font-light italic" style={{ color: PYSA_COLORS.blue }}>
                returns October 2026
              </span>
            </h2>

            <SastwLockup />
          </div>

          <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/60">
            <div className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" style={{ color: PYSA_COLORS.blue }} />
              <dt className="sr-only">Date</dt>
              <dd>{PYSA_2026.dateLabel}</dd>
            </div>
            <div className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: PYSA_COLORS.blue }} />
              <dt className="sr-only">Time</dt>
              <dd>{PYSA_2026.timeLabel}</dd>
            </div>
            <div className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color: PYSA_COLORS.blue }} />
              <dt className="sr-only">Location</dt>
              <dd>
                {PYSA_2026.venue}, {PYSA_2026.venueDetail}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3">
            {/* Two paths out. The hero fills the viewport, so someone who came
                to browse events would otherwise have to scroll past a whole
                screen of promo to reach the thing this page is actually for. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/events/pysanantonio" className={primaryButton}>
                View the conference
              </Link>
              <Link href="#community-calendar" className={secondaryButton}>
                Community Calendar
              </Link>
            </div>

            {phase === "open" && (
              <p className="text-sm text-white/50">
                {daysLeft === 0 ? (
                  <>
                    Call for speakers closes{" "}
                    <span className="font-semibold text-white">today</span>.
                  </>
                ) : (
                  <>
                    Call for speakers closes in{" "}
                    <span className="font-semibold" style={{ color: PYSA_COLORS.yellow }}>
                      {daysLeft} {daysLeft === 1 ? "day" : "days"}
                    </span>
                    .
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
