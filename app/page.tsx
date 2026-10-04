"use client"

import { HeroCommunities } from "@/components/hero-communities"
import { HeroBridge } from "../components/hero-bridge"
import { EcosystemShowcase } from "@/components/ecosystem-showcase"
import { AboutDevsa } from "@/components/about-devsa"
import { AudienceLanes } from "@/components/audience-lanes"
import { DevsaConferences } from "@/components/devsa-conferences"

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white overflow-x-clip">
      <main className="relative w-full">
        <HeroBridge />
        <AboutDevsa />
        <EcosystemShowcase />
        {/* After the ecosystem wall, not before it.

            AboutDevsa ends on "we host them, connect them, and help them grow
            through a shared community calendar, monthly workshops, and
            conferences built right here in San Antonio" — and this section is
            the page paying off that last clause, which had no evidence anywhere
            on it.

            It sat directly after that sentence for a while, which put DEVSA's
            own work in front of the reader before they had met a single group
            it serves. On a page whose whole argument is that DEVSA is a bridge
            rather than a destination — the founder's own quote says "never
            going to be the final destination" — that order made four
            DEVSA-branded conferences read as self-promotion. One slot later,
            the logo wall has just given "activated with these groups" something
            to point at, and the conferences read as the service they are. */}
        <DevsaConferences />
        <AudienceLanes />
        <HeroCommunities />
      </main>
    </div>
  )
}
