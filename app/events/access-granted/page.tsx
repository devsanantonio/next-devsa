import { AccessGrantedHero } from "@/components/access-granted/2026/hero"
import { CallSection } from "@/components/access-granted/2026/call-section"
import { agDaysUntilClose, getAgCfsPhase } from "@/data/access-granted/2026"

/**
 * Revalidate hourly so the call-for-speakers phase flips on its own after
 * AG_CFS_CLOSES without anyone shipping a deploy.
 */
export const revalidate = 3600

/**
 * Access Granted on the DEVSA site.
 *
 * This page exists to run the open calls — for talks and for hands — while
 * they are open. The official event page lives in the sasw-geekdom/next-sasw
 * repo, which owns the brand; once the call closes and the lineup is picked,
 * the speakers and sessions move there and that page becomes canonical.
 *
 * Two sections only, on purpose. It used to carry a programme section listing
 * the floor and the workshop track, which is out: the tables belong to the
 * partner orgs bringing them, the sessions come out of the call below, and a
 * page whose whole job is to collect submissions should not spend its middle
 * describing an afternoon that is not booked yet. next-sasw's page is where
 * the running order lives once there is one.
 *
 * There is no organiser wall section either — the hero carries the "Powered
 * by" row itself, as next-sasw's band does.
 */
export default function AccessGrantedPage() {
  const phase = getAgCfsPhase()

  return (
    <main className="overflow-x-hidden bg-[#0a0a0a]" data-bg-type="dark">
      <AccessGrantedHero phase={phase} daysLeft={agDaysUntilClose()} />
      <CallSection phase={phase} />
    </main>
  )
}
