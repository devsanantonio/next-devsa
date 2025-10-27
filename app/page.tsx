"use client"

import { HeroCommunities } from "@/components/hero-communities"
import { HeroBridge } from "../components/hero-bridge"
import { PySAPopup } from "../components/pysa-popup"
import { PartnersSection } from "@/components/partner-section"

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <main className="relative w-full">
        <HeroBridge />
        <HeroCommunities />
        <PySAPopup />
      </main>
    </div>
  )
}
