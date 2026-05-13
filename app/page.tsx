"use client"

import { HeroCommunities } from "@/components/hero-communities"
import { HeroBridge } from "../components/hero-bridge"
import { EcosystemShowcase } from "@/components/ecosystem-showcase"
import { AboutDevsa } from "@/components/about-devsa"
import { AudienceLanes } from "@/components/audience-lanes"

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <main className="relative w-full">
        <HeroBridge />
        <AboutDevsa />
        <EcosystemShowcase />
        <AudienceLanes />
        <HeroCommunities />
      </main>
    </div>
  )
}
