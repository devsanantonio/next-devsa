/**
 * Shared content for the BSides booth surfaces: the /stay-connected linktree,
 * and the spotlight items echoed across the announcement heroes.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

/** Build a QR target on the canonical domain with a scan-source tag. */
export function stayConnectedUrl(src: string) {
  return `${SITE_URL}/stay-connected?src=${src}`
}

/** DEVSA brand video — the platform/"never the final destination" film. */
export const BRAND_VIDEO_URL =
  "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/DevSA_MoreHuman2026_0313B.mp4"

export const BRAND_VIDEO_POSTER =
  "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/0P3A9743.jpg"

export const BRAND_QUOTE =
  "DEVSA is never going to be the final destination. It's the platform that allows you to find your people, to help build your future, to build your network."

export type SocialLink = {
  label: string
  handle: string
  href: string
  icon: "instagram" | "linkedin" | "discord" | "twitter" | "github"
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Discord",
    handle: "Join the community",
    href: "https://discord.gg/cvHHzThrEw",
    icon: "discord",
  },
  {
    label: "Instagram",
    handle: "@devsatx",
    href: "https://instagram.com/devsatx",
    icon: "instagram",
  },
  {
    label: "LinkedIn",
    handle: "DEVSA",
    href: "https://linkedin.com/company/devsa",
    icon: "linkedin",
  },
  {
    label: "Twitter (X)",
    handle: "@devsatx",
    href: "https://twitter.com/devsatx",
    icon: "twitter",
  },
]

export type EventLink = {
  name: string
  href: string
  accent: string
  image: { src: string; alt: string }
}

/** The two upcoming events shown together on one slide, but linked separately. */
export const EVENTS: EventLink[] = [
  {
    name: "Civic Build Night",
    href: "/events/week-00-the-juneteenth-civic-build-jam-mq1hq70u",
    accent: "#4d8eff",
    image: {
      src: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-antigravity.PNG",
      alt: "Civic Build Night",
    },
  },
  {
    name: "Velocicode II",
    href: "https://acmsa.org/velocicode",
    accent: "#ff6b35",
    image: {
      src: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-vc2.png",
      alt: "Velocicode II — ACM San Antonio",
    },
  },
]

export type Spotlight = {
  key: string
  eyebrow: string
  title: string
  /** When set, the hero renders this logo image in place of the text title. */
  logo?: { src: string; alt: string; className?: string }
  /** When set, the slide renders this image as its left-side content. */
  image?: { src: string; alt: string }
  /** When set, the slide renders this muted autoplay video as its left-side content. */
  video?: { src: string; poster?: string }
  /** When set, the slide shows these event posters; the linktree lists each separately. */
  events?: EventLink[]
  /** When set, a text slide also shows this row of photos (e.g. the home hero wall). */
  images?: { src: string; caption?: string }[]
  blurb: string
  /** Tailwind-friendly hex accent pulled from the existing palette. */
  accent: string
  /** Run this slide on a black background (matches image / particle content). */
  dark?: boolean
  /** Which linktree group this link belongs to (omit to keep it out of the linktree). */
  group?: "happening" | "explore"
  href: string
  cta: string
  status: string
}

export const SPOTLIGHTS: Spotlight[] = [
  {
    key: "home",
    eyebrow: "Building Together",
    title: "Find Your People. Build Your Future.",
    blurb:
      "DEVSA bridges passionate builders, local partners, and San Antonio's growing tech ecosystem — communities, events, and resources in one place.",
    images: [
      { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/replay9.jpg" },
      { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/0P3A9580.jpg" },
      { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/techday2.jpg" },
    ],
    accent: "#ef426f",
    dark: true,
    href: "/",
    cta: "Explore DEVSA",
    status: "",
  },
  {
    key: "startup-week",
    eyebrow: "DEVSA × Geekdom",
    title: "San Antonio Startup Week",
    logo: {
      src: "https://devsa-assets.s3.us-east-2.amazonaws.com/poweredbygeekdom.png",
      alt: "San Antonio Startup Week — Powered by Geekdom",
    },
    blurb:
      "DEVSA and Geekdom are coming together for an open call for speakers across five tracks — founders, builders, applied AI, solopreneurs, and capital & community. Sept 28 – Oct 2, 2026.",
    accent: "#ec228d",
    group: "happening",
    href: "/startup-week-2026",
    cta: "Submit a talk",
    status: "Call for speakers open",
  },
  {
    key: "ai-builder",
    eyebrow: "DEVSA × Digital Canvas × 434 Media",
    title: "AI Builder Program",
    blurb:
      "Digital Canvas isn't a new institution. It's a layer connecting two existing pipelines — DEVSA's tech community and an accredited investor network — with industry underwriters in between. The infrastructure is in place. We're the connecting tissue.",
    accent: "#00f2ff",
    dark: true,
    group: "happening",
    href: "/ai-builder-program",
    cta: "Explore the program",
    status: "Now announcing",
  },
  {
    key: "events",
    eyebrow: "Upcoming community events",
    title: "Upcoming events",
    events: EVENTS,
    blurb: "",
    accent: "#4d8eff",
    group: "happening",
    href: "",
    cta: "",
    status: "Upcoming",
  },
  {
    key: "pysanantonio",
    eyebrow: "Upcoming conference: PySanAntonio II",
    title: "PySanAntonio II",
    video: {
      src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysanantonio2.mp4",
      poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysanantonio2.jpg",
    },
    blurb: "",
    accent: "#ffd343",
    dark: true,
    group: "happening",
    href: "/events/pysanantonio",
    cta: "View conference",
    status: "Upcoming",
  },
  {
    key: "who-serves",
    eyebrow: "Who DEVSA Serves",
    title: "Three Audiences, One Bridge.",
    blurb: "",
    accent: "#fbbf24",
    dark: true,
    group: "explore",
    href: "/buildingtogether",
    cta: "Learn more",
    status: "",
  },
  {
    key: "coworking",
    eyebrow: "DEVSA Coworking Space",
    title: "A Space to Build in Downtown San Antonio.",
    blurb:
      "Workstations, a private call office, a projector, and always-stocked coffee. Free to use — no Geekdom day pass or membership required.",
    images: [
      {
        src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_5061.jpg",
        caption: "Plug in & build",
      },
      {
        src: "https://devsa-assets.s3.us-east-2.amazonaws.com/downtown.jpg",
        caption: "Downtown SA",
      },
      {
        src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6350.jpg",
        caption: "Lounge & breaks",
      },
    ],
    accent: "#00b2a9",
    group: "explore",
    href: "/coworking-space",
    cta: "Visit the space",
    status: "",
  },
  {
    key: "calendar",
    eyebrow: "DEVSA Community Calendar",
    title: "Find Your Next Event. Build Your Network.",
    blurb:
      "One calendar for every community. Stop hunting for links — DEVSA brings San Antonio's tech groups together in one place.",
    accent: "#4d8eff",
    group: "explore",
    href: "/events",
    cta: "Browse events",
    status: "",
  },
]
