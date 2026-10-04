import { AccessGrantedHero } from "@/components/access-granted/2026/hero"
import { ConferenceBackLink } from "@/components/events/conference-back-link"
import { ACCESS_GREEN } from "@/data/access-granted/2026"
import { ConferenceLineup } from "@/components/events/conference-sections"
import { AccessGrantedFacts } from "@/components/access-granted/2026/event-facts"
import { getConference } from "@/data/conferences"

/**
 * Access Granted on the DEVSA site.
 *
 * This page exists to run the open calls — for talks and for hands — while
 * they are open. The official event page lives in the sasw-geekdom/next-sasw
 * repo, which owns the brand; once the call closes and the lineup is picked,
 * the speakers and sessions move there and that page becomes canonical.
 *
 * Two sections only, on purpose. It used to carry a program section listing
 * the floor and the workshop track, which is out: the tables belong to the
 * partner orgs bringing them, the sessions come out of the call below, and a
 * page whose whole job is to collect submissions should not spend its middle
 * describing an afternoon that is not booked yet. next-sasw's page is where
 * the running order lives once there is one.
 *
 * There is no organizer wall section either — the hero carries the "Powered
 * by" row itself, as next-sasw's band does.
 */
export default function AccessGrantedPage() {
  const conference = getConference("access-granted")

  return (
    // Pure black, matching the lock loop's own ground, so the video has no
    // visible box around it.
    <main className="overflow-x-hidden bg-black" data-bg-type="dark">
      <ConferenceBackLink accent={ACCESS_GREEN} />
      <AccessGrantedHero />
      {/* The week lockup and the date/time/room rail, moved down out of the
          masthead — they are facts, and the schedule is where somebody looking
          one up is already headed. */}
      <AccessGrantedFacts />
      {conference && <ConferenceLineup conference={conference} />}
    </main>
  )
}
