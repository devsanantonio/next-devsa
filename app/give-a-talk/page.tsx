import type { Metadata } from "next"
import { GiveATalkClient } from "./give-a-talk-client"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const TITLE = "Give a Talk in San Antonio"
const DESCRIPTION =
  "Give a talk in San Antonio: the tech community groups looking for speakers right now, in one place, or tell DEVSA your idea and we'll find the group it fits. Lightning talks, full talks and workshops; first talks welcome."

/**
 * Every open call for speakers: community groups' standing calls (opened by
 * their organizers in the admin, lib/speaker-calls.ts) and any DEVSA conference
 * whose call is open today. Read client-side so an organizer opening or closing
 * a call shows here at once, as the rest of the site's admin-managed content does.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/give-a-talk" },
  openGraph: {
    title: `${TITLE} | DEVSA`,
    description: DESCRIPTION,
    url: `${siteUrl}/give-a-talk`,
    siteName: "DEVSA",
    // Its own card (app/api/og/give-a-talk), with the live number of open calls.
    images: [{ url: `${siteUrl}/api/og/give-a-talk`, width: 1200, height: 630, alt: "Give a talk in San Antonio, DEVSA" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | DEVSA`,
    description: DESCRIPTION,
    images: [`${siteUrl}/api/og/give-a-talk`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

export default function GiveATalkPage() {
  return <GiveATalkClient />
}
