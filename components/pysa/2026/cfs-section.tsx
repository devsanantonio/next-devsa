import { PysaSpeakerForm } from "@/components/pysa/2026/speaker-form"
import { MascotSticker } from "@/components/pysa/2026/mascot-sticker"
import { SESSION_FORMATS, type CfsPhase } from "@/data/pysa/2026"

const AUDIENCE = [
  "You shipped something with Python and learned things the docs don't cover.",
  "You maintain a library, a pipeline, a model, or a pile of automation.",
  "You've never spoken before and want a room that's on your side.",
]

/**
 * The call for speakers: context on the left, form on the right, set on the
 * dark surface in PySanAntonio's blue and yellow.
 */
export function CallForSpeakersSection({ phase }: { phase: CfsPhase }) {
  return (
    <section
      id="call-for-speakers"
      data-bg-type="dark"
      className="relative scroll-mt-24 overflow-hidden bg-[#0a0a0a] py-20 md:py-24"
    >
      {/* Desktop: the two-column layout leaves a tall gap under the context
          column, because the form is much taller. The sticker fills exactly
          that space, mirrored so the figure faces back into the form. */}
      <MascotSticker
        className="bottom-0 -left-12 hidden w-64 lg:block xl:w-72"
        rotate={5}
        flip
        from="left"
        variant="full"
      />

      {/* Mobile: enters from the left so the mascot alternates sides down the
          page. Held to the section's bottom padding, below the form. */}
      <MascotSticker
        className="-bottom-4 -left-8 w-32 sm:hidden"
        rotate={7}
        flip
        from="left"
        opacity={0.75}
      />

      <div className="page-shell relative grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT — context */}
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Call for speakers
            </p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Put a talk on the{" "}
              <span className="font-light italic" style={{ color: "#4a90d9" }}>
                schedule.
              </span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-white/60 md:text-lg">
              The lineup is built entirely out of submissions — we don&apos;t
              book a roster and call it a community. If you use Python for
              anything, from production systems to research to weekend
              curiosity, there&apos;s a slot here for you.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {AUDIENCE.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-white/70">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: "#ffdd00" }}
                />
                {line}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
              Three formats
            </p>
            <div className="flex flex-wrap gap-2">
              {SESSION_FORMATS.map((f) => (
                <span
                  key={f.value}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/70"
                >
                  {f.label}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              Not sure it fits the conference? Ask us to route it to Alamo
              Python&apos;s regular meetups instead — the form has an option for
              that. We&apos;d rather find the right room for your talk than turn
              it down.
            </p>
          </div>
        </div>

        {/* RIGHT — the form */}
        <PysaSpeakerForm phase={phase} />
      </div>
    </section>
  )
}
