"use client"

import { HeroBridge } from "../components/hero-bridge"
import { PySAPopup } from "../components/pysa-popup"

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <main className="relative w-full">
        <HeroBridge />
        <PySAPopup />
      </main>
    </div>
  )
}
