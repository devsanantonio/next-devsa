import { Metadata } from "next"
import { getPartner } from "@/lib/partners"
import { GroupPageClient } from "./group-page-client"
import { PartnerPageClient } from "./partner-page-client"
import { notFound } from "next/navigation"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"

interface PageProps {
  params: Promise<{ slug: string }>
}

// Helper to check if a slug belongs to a community (Firestore)
async function findCommunity(slug: string) {
  try {
    const db = getDb()
    const doc = await db.collection(COLLECTIONS.COMMUNITIES).doc(slug).get()
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as { id: string; name: string; logo: string; description: string }
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"
  
  // Check if it's a community (static or Firestore)
  const community = await findCommunity(slug)
  if (community) {
    const title = `${community.name} | DEVSA Tech Groups`
    const description = community.description.slice(0, 155) + (community.description.length > 155 ? "..." : "")
    
    return {
      title,
      description,
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
    const title = `${partner.name} | DEVSA Partners`
    const description = partner.description.slice(0, 155) + (partner.description.length > 155 ? "..." : "")
    
    return {
      title,
      description,
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
    title: "Not Found | DEVSA",
    description: "The page you're looking for doesn't exist.",
    robots: { index: false, follow: false },
  }
}

export default async function PartnerOrGroupPage({ params }: PageProps) {
  const { slug } = await params
  
  // Check if it's a community (static or Firestore)
  const community = await findCommunity(slug)
  if (community) {
    return <GroupPageClient slug={slug} />
  }
  
  // Check if it's a partner. The record is passed down rather than looked up
  // again in the client — it has already been fetched here.
  const partner = await getPartner(slug)
  if (partner) {
    return <PartnerPageClient partner={partner} />
  }
  
  notFound()
}
