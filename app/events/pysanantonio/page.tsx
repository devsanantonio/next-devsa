import { PysaHero } from "@/components/pysa/2026/hero"
import { CoBrandRow } from "@/components/pysa/2026/cobrand-row"
import { CallForSpeakersSection } from "@/components/pysa/2026/cfs-section"
import { ArchiveCta2025 } from "@/components/pysa/2026/archive-cta"
import { daysUntilClose, getCfsPhase } from "@/data/pysa/2026"

/**
 * Revalidate hourly so the call-for-speakers phase flips on its own after
 * CFS_CLOSES without anyone shipping a deploy.
 */
export const revalidate = 3600

export default function PySanAntonioPage() {
  const phase = getCfsPhase()

  return (
    <main className="overflow-x-hidden bg-[#0a0a0a]" data-bg-type="dark">
      <PysaHero phase={phase} daysLeft={daysUntilClose()} />

      {/* Organizer band — lifted out of the hero so the headline fits a laptop
          viewport. Lands just below the fold, which is where "who is behind
          this" belongs anyway. */}
      <section
        id="activated-by"
        data-bg-type="dark"
        className="scroll-mt-24 bg-[#0a0a0a]"
      >
        <div className="page-shell border-t border-white/10 py-8">
          <CoBrandRow />
        </div>
      </section>

      <CallForSpeakersSection phase={phase} />
      <ArchiveCta2025 />
    </main>
  )
}
