import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import { SastwLockup } from "@/components/pysa/2026/cobrand-row"
import { primaryButton, secondaryButton } from "@/components/pysa/2026/button-styles"
import {
  PYSA_2026,
  PYSA_ASSETS,
  PYSA_COLORS,
  PYSA_WORDMARK,
  type CfsPhase,
} from "@/data/pysa/2026"

/** Feathers the still's left edge so its box never reads as a seam. */
const IMAGE_MASK =
  "linear-gradient(to right, transparent 0%, black 30%, black 100%)"

/**
 * Featured-event hero for the community calendar, built from the PySanAntonio
 * hero so the two read as the same event.
 *
 * Deliberately not a copy of that hero. It uses the poster still rather than the
 * 7 MB clip — this is a promo on a page whose real job is the calendar below it —
 * and it stays a compact band instead of claiming a full viewport. The heading is
 * an h2 for the same reason: the calendar section owns the page's subject, so a
 * promo should not outrank it in the outline.
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

      {/* Desktop only: the still, bled off the right edge. Now that the box is
          viewport-tall it crops the sides rather than the top, so the raised
          fingers survive — but the figure sits right of centre in the frame, so
          the window is biased that way to keep the guitar from clipping. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] select-none md:block">
        <Image
          src={PYSA_ASSETS.mascotVideoPoster}
          alt=""
          aria-hidden
          fill
          sizes="54vw"
          className="object-cover object-[58%_center]"
          style={{ maskImage: IMAGE_MASK, WebkitMaskImage: IMAGE_MASK }}
        />
      </div>

      {/* Phones get the standing mascot in the lower-right instead of the still.
          bottom-0 puts his boots on the section edge so nothing crops him, and
          the copy's tall bottom padding reserves the band he stands in — that is
          what keeps him off the full-width button and the countdown line. */}
      <Image
        src={PYSA_ASSETS.mascotSticker}
        alt=""
        aria-hidden
        width={PYSA_ASSETS.mascotStickerWidth}
        height={PYSA_ASSETS.mascotStickerHeight}
        sizes="120px"
        className="pointer-events-none absolute bottom-0 right-4 z-10 h-auto w-24 select-none sm:hidden"
      />

      {/* Desktop scrim: solid under the copy, clearing before the still. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.9) 34%, rgba(10,10,10,0.35) 58%, rgba(10,10,10,0) 80%)",
        }}
      />

      {/* pt clears the fixed navbar even on a viewport too short for the content
          to stay centred. pb-60 at base reserves the 206px band the mobile
          mascot stands in, with clearance, so he can never reach the button;
          from sm up he is gone and it returns to normal. */}
      <div className="page-shell relative z-20 pb-60 pt-24 sm:pb-16 md:pb-20 md:pt-28">
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
