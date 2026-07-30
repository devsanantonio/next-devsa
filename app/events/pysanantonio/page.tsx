import { PysaHero } from "@/components/pysa/2026/hero"
import { MascotInterlude } from "@/components/pysa/2026/mascot-interlude"
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
      {/* Mobile only — the mascot grows on scroll as the handoff into the call
          for speakers. Desktop has him in the hero video instead. */}
      <MascotInterlude />
      <CallForSpeakersSection phase={phase} />
      <ArchiveCta2025 />
    </main>
  )
}
