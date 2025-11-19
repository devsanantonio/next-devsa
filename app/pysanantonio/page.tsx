"use client"

import HeroSection from "@/components/pysa/hero-section"
import SessionsSection from "@/components/pysa/sessions-section"
import SponsorsSection from "@/components/pysa/sponsors-section"
import PyTexasCTA from "@/components/pysa/pytexas-cta"

export default function PySanAntonioPage() {
  return (
    <main className="bg-white overflow-x-hidden" data-bg-type="dark">
      <HeroSection />
      <SessionsSection />
      <SponsorsSection />
      <PyTexasCTA />
    </main>
  )
}
