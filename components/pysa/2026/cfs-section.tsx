"use client"

import { useState } from "react"
import { PysaSpeakerForm } from "@/components/pysa/2026/speaker-form"
import { CoBrandRow } from "@/components/pysa/2026/cobrand-row"
import { MascotSticker } from "@/components/pysa/2026/mascot-sticker"
import { type CfsPhase } from "@/data/pysa/2026"

/**
 * The call for speakers: context on the left, form on the right, set on the
 * dark surface in PySanAntonio's blue and yellow.
 *
 * The left column is deliberately short — headline, one paragraph, the routing
 * note, and who's behind it. The talk lengths live in the form's own format
 * picker rather than being previewed here, and the "who should submit" list
 * folded into the paragraph.
 */
export function CallForSpeakersSection({ phase }: { phase: CfsPhase }) {
  // The success card is far shorter than the form, so the grid row collapses on
  // submit. A mascot anchored to that row's bottom would jump up onto the copy,
  // so he retires here and reappears inside the success card instead.
  const [submitted, setSubmitted] = useState(false)

  return (
    <section
      id="call-for-speakers"
      data-bg-type="dark"
      className="relative scroll-mt-24 overflow-hidden bg-[#0a0a0a] py-20 md:py-24"
    >
      {/* The stickers anchor to this wrapper, not the section — the organiser
          row below is part of the section now, so `bottom-0` on the section
          would drop the mascot straight onto the logos. */}
      <div className="relative">
        {/* Desktop: the two-column layout leaves a tall gap under the context
            column, because the form is much taller. The sticker fills exactly
            that space, mirrored so the figure faces back into the form.

            Retired once the form is submitted — the success card is far shorter,
            so the grid row collapses and a sticker anchored to its bottom lands
            on top of the copy. He reappears inside the success card instead. */}
        {!submitted && (
          <MascotSticker
            className="bottom-0 -left-12 hidden w-64 lg:block xl:w-72"
            rotate={5}
            flip
            from="left"
            variant="full"
          />
        )}

        <div className="page-shell relative grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — context */}
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Call for speakers
              </p>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                Share what you&apos;re{" "}
                <span className="font-light italic" style={{ color: "#4a90d9" }}>
                  building.
                </span>
              </h2>
              <p className="max-w-md text-base leading-relaxed text-white/60 md:text-lg">
                The schedule comes together from whoever raises a hand. If you
                use Python at work, in research, or on something you tinker with
                on weekends, there&apos;s a slot here for you — first-time
                speakers very much included.
              </p>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-white/50">
              Not sure it fits the conference? Ask us to route it to Alamo
              Python&apos;s regular meetups instead — the form has an option for
              that. We&apos;d rather find the right room for your talk than turn
              it down.
            </p>

            {/* Who's behind it, in the column rather than in a band under the
                mascot. Sits above the sticker, which still fills the gap left
                by the much taller form. */}
            <CoBrandRow className="border-t border-white/10 pt-7" />
          </div>

          {/* RIGHT — the form */}
          <PysaSpeakerForm phase={phase} onSubmitted={() => setSubmitted(true)} />
        </div>
      </div>
    </section>
  )
}
