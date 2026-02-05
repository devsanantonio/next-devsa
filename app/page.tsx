"use client"

import { HeroCommunities } from "@/components/hero-communities"
import { HeroBridge } from "../components/hero-bridge"
import { PartnersSection } from "@/components/partner-section"
import { MagenNewsletterCTA } from "@/components/magen-newsletter-cta"
import { EventsPopup } from "@/components/events-popup"

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <main className="relative w-full">
        <HeroBridge />
        <PartnersSection />
        <HeroCommunities />
        <MagenNewsletterCTA />
      </main>
      <EventsPopup />
    </div>
  )
}
