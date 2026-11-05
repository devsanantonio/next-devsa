import type { Metadata } from "next"
import { SlidesTerminal } from "@/components/slides/slides-terminal"
import { sortedDecks } from "@/lib/slides"

/**
 * /slides: the decks DEVSA presents at its events, one page each at
 * /slides/<slug>. A terminal window that opens straight onto the list, so
 * the decks are the first thing on screen. Add a deck in lib/slides.ts.
 *
 * Kept out of search: decks are made for a room, sometimes before what they
 * announce is public.
 */
export const metadata: Metadata = {
  title: "Slides",
  description: "The decks DEVSA presents at its events, ready to open and present.",
  alternates: { canonical: "/slides" },
  robots: { index: false, follow: false },
}

export default function SlidesPage() {
  return (
    <main className="min-h-screen bg-black" data-bg-type="dark">
      <h1 className="sr-only">Slides</h1>
      <div className="page-shell pb-20 pt-20 md:pt-24">
        <SlidesTerminal decks={sortedDecks()} />
      </div>
    </main>
  )
}
