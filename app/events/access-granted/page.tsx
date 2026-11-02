import { AccessGrantedHero } from "@/components/access-granted/2026/hero"
import { ConferenceBackLink } from "@/components/events/conference-back-link"
import { ACCESS_GREEN } from "@/data/access-granted/2026"
import { ConferenceLineup } from "@/components/events/conference-sections"
import { AccessGrantedFacts } from "@/components/access-granted/2026/event-facts"
import { getConference } from "@/data/conferences"

/**
 * Access Granted on the DEVSA site.
 *
 * It was built to run the open calls, for talks and for hands. Those closed with
 * the first edition (September 30, 2026); the page is now the record of that
 * afternoon and the way in for partners on the next one. next-sasw carries the
 * same brand and the same one-liner, so a wording change to either is made in
 * both.
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
      {/* The first edition's facts, moved down out of the masthead: the
          schedule is where somebody looking one up is already headed. */}
      {conference && <AccessGrantedFacts conference={conference} />}
      {conference && <ConferenceLineup conference={conference} />}
    </main>
  )
}
