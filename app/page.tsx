"use client"

import { HeroCommunities } from "@/components/hero-communities"
import { HeroBridge } from "../components/hero-bridge"
import { PartnersSection } from "@/components/partner-section"

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <main className="relative w-full">
        <HeroCommunities />
        <PartnersSection />
        <HeroBridge />
      </main>
    </div>
  )
}
