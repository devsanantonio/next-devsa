import { EventsHero } from "@/components/events/events-hero"
import { FeaturedDevsaEvent } from "@/components/events/featured-devsa-event"
import { FeaturedOnDemandEvent } from "@/components/events/featured-on-demand-event"
import { CommunityEventsSection } from "@/components/events/community-events-section"

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <EventsHero />
      <FeaturedDevsaEvent />
      <FeaturedOnDemandEvent />
      <CommunityEventsSection />
    </main>
  )
}
