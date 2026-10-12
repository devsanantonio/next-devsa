import type { Metadata } from "next"
import { ConferenceBackLink } from "@/components/events/conference-back-link"
import {
  DEMO_DAY_ACCENT,
  DemoDayBacking,
  DemoDayHero,
  DemoDayIndustries,
  DemoDaySteps,
  DemoDayTerms,
  DemoDayWhy,
} from "@/components/demo-day/sections"
import { DemoDayInquiryForm } from "@/components/demo-day/inquiry-form"
import { PapelPicado } from "@/components/demo-day/papel-picado"
import { ShootingStars } from "@/components/demo-day/shooting-stars"
import { NIGHT_SKY, StarField } from "@/components/demo-day/theme"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

/*
 * Search and share copy, kept in step with the page.
 *
 * The description leads with the format (one industry, the builders, the
 * investors) and keeps the funding rule, because a result that reads as a
 * scheduled event would be a promise the page does not make. ~150 characters,
 * so it is not cut off in results; the earlier version ran to 195.
 *
 * The name leads, with "a DEVSA Demo Day" beside it so a search result says
 * what kind of event this is. Renamed from plain "Demo Day" on 2026-10-11;
 * /events/demo-day permanently redirects here (next.config.ts).
 *
 * No date in the title or description — April 2027 is a goal, stated on the
 * page with its condition. No "Fiesta" either: it is a registered mark, and in
 * a title it would read as a listing.
 */
const TITLE = "Confluencia: a DEVSA Demo Day for San Antonio's Builders"
const SHARE_TITLE = "Confluencia · a DEVSA Demo Day"
const DESCRIPTION =
  "Once a year, one industry brings the problem, San Antonio's builders bring the work, and investors are in the room. It happens if it is funded."

/*
 * The share card is the Demo Day papel picado sheet, made with Nano Banana Pro
 * from the reference kit (the DEVSA mark, its papel picado cut, the layout and
 * the site's sheet style). The source is 1179x896, so the card is composed
 * rather than cropped: the sheet at full card height, centered on a ground
 * matched to the source's own night, its edges feathered in, the string carried
 * out to both sides. A static file rather than an app/api/og route because
 * there is nothing on it to render — it is artwork, not a template.
 */
const OG_IMAGE = `${siteUrl}/demo-day/og.jpg`
const OG_ALT =
  "Confluencia, a DEVSA Demo Day: a marigold papel picado sheet hanging on a string against a starry night sky, with the DEVSA logo and the words DEMO DAY cut out of the paper"

export const metadata: Metadata = {
  // The root layout's template appends " | DEVSA"; adding it here doubled it.
  title: TITLE,
  description: DESCRIPTION,
  // Without this the page inherited the site-wide list (Python meetups, Linux
  // user groups…), none of which is this page.
  keywords: [
    "Confluencia",
    "Confluencia San Antonio",
    "Demo Day San Antonio",
    "DEVSA Demo Day",
    "San Antonio builders",
    "AI builders San Antonio",
    "industry partner",
    "startup investors San Antonio",
    "aerospace San Antonio",
    "cybersecurity San Antonio",
    "healthcare bioscience San Antonio",
    "manufacturing San Antonio",
    "military defense San Antonio",
    "robotics San Antonio",
    "San Antonio tech community",
    "DEVSA",
  ],
  alternates: { canonical: "/events/confluencia" },
  openGraph: {
    title: SHARE_TITLE,
    description: DESCRIPTION,
    url: `${siteUrl}/events/confluencia`,
    siteName: "DEVSA",
    locale: "en_US",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT, type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

/*
 * No Event JSON-LD. schema.org Event needs a startDate and a location, and
 * Demo Day has neither until it is funded; a guessed date in structured data
 * is exactly the kind of claim the page avoids in prose. Add it — with the
 * real date, venue and offers — once there is one. The layout's Organization
 * and WebSite blocks still apply.
 */

/**
 * Demo Day's own page.
 *
 * It lived as the closing section of /about for a while and outgrew it: one
 * band was explaining the event, recruiting a paying lead partner and taking
 * donations, three readers with three different questions. This is the URL a
 * partner, a sponsor or a board member is sent to; /about keeps a short band
 * that points here.
 *
 * Under /events beside the conference routes because it is one more event
 * DEVSA owns. A static segment, so it beats the `[slug]` catch-all and is
 * untouched by the per-request rule for Firestore events.
 *
 * Event-page idiom, not marketing: the mono eyebrow and the back link, as on
 * the conference pages. Site black with stars over it, the papel picado sheet
 * as the masthead and a string of sheets under it — the Cosmic Nights theme,
 * set out in components/demo-day/theme.tsx. See
 * components/demo-day/sections.tsx for what the page deliberately leaves out
 * until it is true.
 */
export default function ConfluenciaPage() {
  return (
    <main className="relative isolate overflow-x-hidden" style={NIGHT_SKY} data-bg-type="dark">
      <StarField />
      <ShootingStars />
      <ConferenceBackLink accent={DEMO_DAY_ACCENT} />
      {/* The builders' strip hangs above the name on phones, where it is the
          first color on a narrow screen, and below it from lg up (laptops and
          external monitors), where the name gets the top of the page. Two
          instances, one shown per breakpoint: the hidden one never intersects
          the viewport, so its animation loop never starts. */}
      <PapelPicado className="-mt-2 lg:hidden" />
      <DemoDayHero />
      <PapelPicado className="hidden lg:block" />
      <DemoDayIndustries />
      <DemoDaySteps />
      <DemoDayWhy />
      <PapelPicado variant="industries" className="-mt-4 mb-6" />
      <DemoDayBacking />
      <DemoDayInquiryForm />
      <DemoDayTerms />
    </main>
  )
}
