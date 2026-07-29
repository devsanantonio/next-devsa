"use client"

import HeroSection from "@/components/pysa/2025/hero-section"
import SessionsSection from "@/components/pysa/2025/sessions-section"
import SponsorsSection from "@/components/pysa/2025/sponsors-section"
import PyTexasCTA from "@/components/pysa/2025/pytexas-cta"

export default function PySanAntonio2025Page() {
  return (
    <main className="bg-white overflow-x-hidden" data-bg-type="dark">
      <HeroSection />
      <SessionsSection />
      <SponsorsSection />
      <PyTexasCTA />
    </main>
  )
}
