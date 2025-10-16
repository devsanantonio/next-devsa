"use client"

import { HeroCommunities } from "../components/hero-communities"
import { PySAPopup } from "../components/pysa-popup"

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-black">
      <main className="relative w-full">
        <HeroCommunities />
        <PySAPopup />
      </main>
    </div>
  )
}
