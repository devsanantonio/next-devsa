import { Ban } from "lucide-react"
import { AccessGrantedCallForm } from "@/components/access-granted/2026/call-form"
import {
  ACCESS_AMBER,
  ACCESS_GREEN,
  AG_CFP,
  AG_VOLUNTEER,
  type AgCfsPhase,
} from "@/data/access-granted/2026"

/**
 * Both open calls, in one section, beside one form.
 *
 * They were two sections with a form each. That framing made them look like
 * competing asks — and it forced anyone who would do either to choose a page
 * before they could answer. Read together they are one invitation with two
 * doors, which is what the room actually needs.
 *
 * The talk brief keeps its exclusions as a visible list. That is deliberate,
 * per the event brief: a security CFP that does not print "no vendor pitches"
 * receives vendor pitches, and stating the sponsor carve-out in public is how
 * it stops being an awkward private conversation five times over.
 *
 * Amber marks the volunteer half against the talk half's green, the same split
 * the page used when these were separate — so the two asks still read as
 * different asks inside one column.
 */
export function CallSection({ phase }: { phase: AgCfsPhase }) {
  return (
    <section
      id="call"
      data-bg-type="dark"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/10 bg-[#0a0a0a] py-20 md:py-24"
    >
      {/* `lg:items-start` is load-bearing.

          Grid items stretch to the row height by default, so the form — a
          bordered card — was being pulled down to whatever the brief column
          measured. Its content stayed put at the top and the surplus came out
          as a tall dead band inside the card, below the submit button. Aligned
          to the start, the card is only as tall as the form, and the two
          columns share a top edge instead of a bottom one. */}
      <div className="page-shell grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT — both briefs */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              Call for speakers &amp; volunteers
            </p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              {AG_CFP.headingLead}{" "}
              <span className="font-light italic" style={{ color: ACCESS_GREEN }}>
                {AG_CFP.headingAccent}
              </span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-white/60 md:text-lg">
              {AG_CFP.body}
            </p>
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              {AG_CFP.audience}
            </p>
          </div>

          {/* Concrete subjects, drawn from what these groups actually present.
              "We want technical talks" gets abstractions back; naming real
              things gets real submissions. Mono and prompt-marked, so it reads
              as a list of leads rather than a second paragraph. */}
          <ul className="flex flex-col gap-2">
            {AG_CFP.examples.map((example) => (
              <li
                key={example}
                className="flex gap-2.5 font-mono text-xs leading-relaxed text-white/55"
              >
                <span aria-hidden style={{ color: ACCESS_GREEN }}>
                  {">_"}
                </span>
                {example}
              </li>
            ))}
          </ul>

          {/* What we'll turn down — stated, not implied. */}
          <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Ban className="h-4 w-4 text-red-400" />
              {AG_CFP.avoid.heading}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {AG_CFP.avoid.items.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-white/55">
                  {item}
                </li>
              ))}
            </ul>
            <p className="border-t border-white/10 pt-3 text-sm font-medium text-white/70">
              {AG_CFP.avoid.sponsorNote}
            </p>
          </div>

          {/* The first-timer callout and the slot count used to sit here. Both
              are out: the callout restated a promise the form's own checkbox
              already makes at the moment it is actionable, and the slot count
              is an organiser's detail that reads as a discouragement — "three
              slots" tells someone deciding whether to write an abstract that
              the odds are long. The reserved slot itself is unchanged. */}

          {/* The other half of the ask. Amber, so it reads as a different door
              rather than more of the same brief. */}
          <div className="flex flex-col gap-3 border-t border-white/10 pt-8">
            <h3
              className="text-2xl font-bold leading-tight tracking-tight md:text-3xl"
              style={{ color: ACCESS_AMBER }}
            >
              {AG_VOLUNTEER.heading}
            </h3>
            <p className="max-w-md text-base leading-relaxed text-white/60">
              {AG_VOLUNTEER.body}
            </p>
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              {AG_VOLUNTEER.examples}
            </p>
          </div>
        </div>

        {/* RIGHT — one form for both */}
        <AccessGrantedCallForm phase={phase} />
      </div>
    </section>
  )
}
