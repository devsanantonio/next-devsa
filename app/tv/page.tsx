import type { Metadata } from "next"
import { TvHero } from "@/components/tv/tv-hero"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const SHORT =
  "DEVSA programming is coming to TVSA, San Antonio's public access channel: Christmas editions this December, on Spectrum 20, Grande 19 and AT&T 99. Air dates and times coming soon."

/**
 * DEVSA TV, as a preview. One page on its own route (not under /events),
 * linked from nowhere yet and kept out of search until TVSA confirms how the
 * programming is credited and the schedule is set. Drop the robots line when
 * it launches. See components/tv/tv-hero.tsx for what the page may say.
 */
export const metadata: Metadata = {
  title: "DEVSA TV — Coming to TVSA This December",
  description: SHORT,
  alternates: { canonical: "/tv" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "DEVSA TV — Coming to TVSA This December",
    description: SHORT,
    url: `${siteUrl}/tv`,
    siteName: "DEVSA",
    type: "website",
  },
}

export default function TvPage() {
  return (
    <main className="bg-[#161616]">
      <TvHero />
    </main>
  )
}
