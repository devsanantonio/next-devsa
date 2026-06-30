import { Metadata } from "next"
import { StartupWeekHero } from "@/components/startup-week/hero"
import { SITE_URL } from "@/data/stay-connected"

export const metadata: Metadata = {
  title: "San Antonio Startup Week 2026 — Call for Speakers | DEVSA",
  description:
    "DEVSA × Geekdom open call for speakers at San Antonio Startup Week, Sept 28 – Oct 2, 2026. Five speaking tracks: Founder, Tech & Builders, AI & Applied Innovation, Small Business & Solopreneur, and Capital & Community.",
  alternates: { canonical: "/startup-week-2026" },
  openGraph: {
    title: "San Antonio Startup Week 2026 — Call for Speakers | DEVSA",
    description:
      "DEVSA × Geekdom open call for speakers at San Antonio Startup Week, Sept 28 – Oct 2, 2026.",
    url: `${SITE_URL}/startup-week-2026`,
    siteName: "DEVSA",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/api/og/startup-week`,
        width: 1200,
        height: 630,
        alt: "San Antonio Startup Week 2026 — DEVSA × Geekdom call for speakers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "San Antonio Startup Week 2026 — Call for Speakers | DEVSA",
    description:
      "DEVSA × Geekdom open call for speakers at San Antonio Startup Week, Sept 28 – Oct 2, 2026.",
    images: [`${SITE_URL}/api/og/startup-week`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

export default function StartupWeek2026Page() {
  return <StartupWeekHero />
}
