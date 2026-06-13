import { Metadata } from "next"
import { SpotlightHero } from "@/components/stay-connected/spotlight-hero"
import { Linktree } from "@/components/stay-connected/linktree"
import { SITE_URL } from "@/data/stay-connected"

export const metadata: Metadata = {
  title: "Stay Connected | DEVSA",
  description:
    "Find your people, build your future. Connect with DEVSA — San Antonio's tech community. Discover Startup Week, the AI Builder Program, the Bounty Program, and join us on Discord, Instagram, LinkedIn, and X.",
  alternates: { canonical: "/stay-connected" },
  openGraph: {
    title: "Stay Connected | DEVSA",
    description:
      "Find your people, build your future. Connect with DEVSA — San Antonio's tech community.",
    url: `${SITE_URL}/stay-connected`,
    siteName: "DEVSA",
    type: "website",
  },
}

export default function StayConnectedPage() {
  return (
    <div className="w-full overflow-x-hidden bg-white">
      <main className="relative w-full">
        <SpotlightHero />
        <Linktree />
      </main>
    </div>
  )
}
