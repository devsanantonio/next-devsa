"use client"

import HeroSection from "@/components/pysa/hero-section"
import SpeakersSection from "@/components/pysa/speakers-section"
import SessionsSection from "@/components/pysa/sessions-section"
import SponsorsSection from "@/components/pysa/sponsors-section"
import AfterPartySection from "@/components/pysa/after-party-section"
import ParkingSection from "@/components/pysa/parking-section"

export default function PySanAntonioPage() {
  return (
    <main className="bg-white overflow-x-hidden" data-bg-type="dark">
      <HeroSection />
      <SpeakersSection />
      <SessionsSection />
      <SponsorsSection />
      <AfterPartySection />
      <ParkingSection />
    </main>
  )
}
