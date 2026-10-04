import { PysaHero } from "@/components/pysa/2026/hero"
import { ConferenceBackLink } from "@/components/events/conference-back-link"
import { PysaFacts } from "@/components/pysa/2026/event-facts"
import { PYSA_COLORS } from "@/data/pysa/2026"
import { ArchiveCta2025 } from "@/components/pysa/2026/archive-cta"
import {
  ConferenceLineup,
  ConferenceRoom,
} from "@/components/events/conference-sections"
import { getConference } from "@/data/conferences"

/**
 * PySanAntonio, after the 2026 edition.
 *
 * Three things came off this page once the conference had run.
 *
 * The call for speakers, because there is nothing to submit to. Only the
 * section is gone — CFS_CLOSES, getCfsPhase and the form component all remain
 * in the repo, so next year's call is a one-line re-add rather than a rebuild.
 *
 * The preview reel, because it was made to sell an afternoon that has already
 * happened. On the other two activations it still earns its place; here the
 * page's job has changed from "come to this" to "here is what it was", and a
 * trailer is the wrong register for a record.
 *
 * What replaces both is the room itself. The photograph leads because it
 * answers the question a trailer was answering badly — what the afternoon
 * actually looked like, and how full it was — and the schedule follows it,
 * because that is the order someone reads a record in: the room, then what
 * happened in it.
 */
export const revalidate = 3600

export default function PySanAntonioPage() {
  const conference = getConference("pysanantonio")

  return (
    <main className="overflow-x-hidden bg-[#0a0a0a]" data-bg-type="dark">
      <ConferenceBackLink accent={PYSA_COLORS.blue} />
      <PysaHero />
      {/* The week lockup and the date/time/room rail, moved down out of the
          masthead — they are facts, and the schedule is where somebody looking
          one up is already headed. */}
      <PysaFacts />
      {conference && (
        <>
          <ConferenceRoom conference={conference} />
          <ConferenceLineup conference={conference} />
        </>
      )}
      <ArchiveCta2025 />
    </main>
  )
}
