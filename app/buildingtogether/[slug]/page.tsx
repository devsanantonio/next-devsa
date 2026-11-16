import { Metadata } from "next"
import { getPartner } from "@/lib/partners"
import { GroupPageClient } from "./group-page-client"
import { PartnerPageClient } from "./partner-page-client"
import { notFound } from "next/navigation"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { jsonLdScript } from "@/lib/json-ld"
import type { TechCommunity } from "@/data/communities"
import { listPublishedEvents, hostedBy } from "@/lib/group-events"
import { topicFilters } from "@/lib/community-topics"

interface PageProps {
  params: Promise<{ slug: string }>
}

// Helper to check if a slug belongs to a community (Firestore)
/** The group's fields the page shows, as a plain object: the Firestore document also carries Timestamps
 * (createdAt, updatedAt), which can't cross to a client component. */
function plainCommunity(c: TechCommunity): TechCommunity {
  const keys: (keyof TechCommunity)[] = ["id", "name", "logo", "description", "website", "discord", "meetup", "luma", "instagram",
    "twitter", "linkedin", "youtube", "twitch", "facebook", "github", "speakersOpen", "speakersNote", "speakersQuestion"]
  const out: Record<string, unknown> = {}
  for (const k of keys) if (c[k] !== undefined) out[k] = c[k]
  return out as unknown as TechCommunity
}

async function findCommunity(slug: string) {
  try {
    const db = getDb()
    const doc = await db.collection(COLLECTIONS.COMMUNITIES).doc(slug).get()
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as TechCommunity
    }
  } catch {
    // Firestore unavailable - fall through
  }
  return null
}

/**
 * Rendered per request, deliberately.
 *
 * This route was prerendered from Firestore with `dynamicParams = false`,
 * which bought a correct 404 status for unknown slugs — the router rejects
 * anything outside the build-time list before rendering starts. The cost was
 * that a community or partner added in the admin had no page until the next
 * deploy, because `generateStaticParams` only runs at build time.
 *
 * Immediate is worth more than the status code here. Every other surface —
 * the homepage wall, /buildingtogether, the calendar — already reads its data
 * client-side and is live, so this was the one page where an admin change sat
 * invisible, and "add a partner, then wait for a deploy" is the sort of thing
 * that gets worked around rather than lived with.
 *
 * What the status costs, and how it is paid: an unknown slug now renders the
 * not-found page with a 200 rather than a 404, because `notFound()` fires
 * after the response has begun streaming and nothing short of taking the
 * decision out of rendering changes that — a `not-found.tsx` boundary was
 * tried and does not. The real exposure was search engines indexing soft 404s,
 * so `generateMetadata` returns `robots: noindex` for slugs that resolve to
 * nothing. Crawlers drop the page; the status stays imperfect.
 */

/**
 * What search sees for a group or partner. The title names the group and the city, so "linux san antonio"
 * or "python san antonio" finds the group's own page; the root layout adds " | DEVSA". (It said
 * "<name> | DEVSA Tech Groups", which the template made "... | DEVSA Tech Groups | DEVSA".)
 */
const SA = /san antonio/i // only the city written out: "Alamo Python" or "DEF CON Group SATX" still gets "San Antonio"
const groupTitle = (name: string) => (SA.test(name) ? `${name}: Tech Group` : `${name}: San Antonio Tech Group`)
const partnerTitle = (name: string) => `${name}: DEVSA Partner`

/** A description cut on a word, not mid-word, at about the length search results show. */
function snippet(text: string, max = 155) {
  const t = (text ?? "").replace(/\s+/g, " ").trim()
  if (t.length <= max) return t
  return t.slice(0, t.lastIndexOf(" ", max - 1)).replace(/[,;:.]$/, "") + "…"
}

/**
 * The group or partner as an Organization in San Antonio, with its own links and its tie to DEVSA, so search
 * and assistants can connect "Linux San Antonio" to Linux, San Antonio and the directory it's listed in.
 */
function orgJsonLd(o: { name: string; description: string; logo?: string; links: (string | undefined | null)[]; slug: string }, kind: "group" | "partner") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: o.name,
    description: o.description,
    url: `${siteUrl}/buildingtogether/${o.slug}`,
    ...(o.logo && /^https?:/.test(o.logo) ? { logo: o.logo } : {}),
    areaServed: { "@type": "City", name: "San Antonio", addressRegion: "TX", addressCountry: "US" },
    ...(() => {
      const sameAs = o.links.filter((l): l is string => !!l && /^https?:/.test(l))
      return sameAs.length ? { sameAs } : {}
    })(),
    ...(kind === "group"
      ? { memberOf: { "@type": "Organization", name: "DEVSA", url: siteUrl } }
      : {}),
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"
  
  // Check if it's a community (static or Firestore)
  const community = await findCommunity(slug)
  if (community) {
    const title = groupTitle(community.name)
    const description = snippet(community.description)
    
    return {
      title,
      description,
      alternates: { canonical: `/buildingtogether/${slug}` },
      openGraph: {
        title: community.name,
        description,
        url: `${siteUrl}/buildingtogether/${slug}`,
        siteName: "DEVSA",
        images: [
          {
            url: `${siteUrl}/api/og/buildingtogether/${slug}`,
            width: 1200,
            height: 630,
            alt: `${community.name} - DEVSA Tech Group`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${siteUrl}/api/og/buildingtogether/${slug}`],
      },
    }
  }
  
  // Check if it's a partner
  const partner = await getPartner(slug)
  if (partner) {
    const title = partnerTitle(partner.name)
    const description = snippet(partner.description)
    
    return {
      title,
      description,
      alternates: { canonical: `/buildingtogether/${slug}` },
      openGraph: {
        title: partner.name,
        description,
        url: `${siteUrl}/buildingtogether/${slug}`,
        siteName: "DEVSA",
        images: [
          {
            url: `${siteUrl}/api/og/buildingtogether/${slug}`,
            width: 1200,
            height: 630,
            alt: `${partner.name} - DEVSA Partner`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${siteUrl}/api/og/buildingtogether/${slug}`],
      },
    }
  }
  
  // noindex, because this resolves to nothing and still answers 200 — see the
  // note above generateMetadata. Without it, every mistyped or retired slug is
  // a soft 404 a crawler is entitled to index.
  return {
    title: "Not Found",
    description: "The page you're looking for doesn't exist.",
    robots: { index: false, follow: false },
  }
}

export default async function PartnerOrGroupPage({ params }: PageProps) {
  const { slug } = await params
  
  // Check if it's a community (static or Firestore)
  const community = await findCommunity(slug)
  if (community) {
    const c = community
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(orgJsonLd({
              name: c.name, description: c.description, logo: c.logo, slug,
              links: [c.website, c.meetup, c.luma, c.discord, c.github, c.linkedin, c.instagram, c.twitter, c.youtube, c.twitch, c.facebook],
            }, "group")),
          }}
        />
        <GroupPageClient
          slug={slug}
          community={plainCommunity(c)}
          events={(await listPublishedEvents()).filter((e) => hostedBy(e, slug))}
          topics={topicFilters([{ id: slug, name: c.name, description: c.description ?? "" }]).map(({ label, slug: t }) => ({ label, slug: t }))}
        />
      </>
    )
  }
  
  // Check if it's a partner. The record is passed down rather than looked up
  // again in the client — it has already been fetched here.
  const partner = await getPartner(slug)
  if (partner) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(orgJsonLd({ name: partner.name, description: partner.description, logo: partner.logo, slug, links: [partner.website] }, "partner")),
          }}
        />
        <PartnerPageClient partner={partner} />
      </>
    )
  }
  
  notFound()
}
