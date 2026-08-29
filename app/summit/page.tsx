import type { Metadata } from "next"
import { SummitStage } from "./summit-stage"

/**
 * `/summit` — a full-bleed backdrop for the screens at the San Antonio Tech
 * Summit, 29 Aug 2026.
 *
 * Not a marketing page. It is meant to be opened on a TV, put into fullscreen,
 * and left running for three hours, which drives most of the decisions in
 * summit-stage.tsx: it locks to 16:9, never scrolls, hides the cursor when
 * idle, and keeps something moving so an OLED panel is not asked to hold a
 * static bright image for the length of the event.
 *
 * noindex because a backdrop is not a search result, and the page is
 * meaningless the day after.
 */
export const metadata: Metadata = {
  title: "San Antonio Tech Summit",
  description:
    "San Antonio Tech Summit — 29 August 2026 at Geekdom, presented by Gentry Media.",
  robots: { index: false, follow: false },
}

export default function SummitPage() {
  return <SummitStage />
}
