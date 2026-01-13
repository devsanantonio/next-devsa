import { Metadata } from "next"
import { techCommunities } from "@/data/communities"
import { partners } from "@/data/partners"
import { GroupPageClient } from "./group-page-client"
import { PartnerPageClient } from "./partner-page-client"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const communityParams = techCommunities.map((community) => ({
    slug: community.id,
  }))
  const partnerParams = partners.map((partner) => ({
    slug: partner.id,
  }))
  return [...communityParams, ...partnerParams]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"
  
  // Check if it's a community
  const community = techCommunities.find((c) => c.id === slug)
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
  const partner = partners.find((p) => p.id === slug)
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
  
  return {
    title: "Not Found | DEVSA",
    description: "The page you're looking for doesn't exist.",
  }
}

export default async function PartnerOrGroupPage({ params }: PageProps) {
  const { slug } = await params
  
  // Check if it's a community
  const community = techCommunities.find((c) => c.id === slug)
  if (community) {
    return <GroupPageClient slug={slug} />
  }
  
  // Check if it's a partner
  const partner = partners.find((p) => p.id === slug)
  if (partner) {
    return <PartnerPageClient slug={slug} />
  }
  
  notFound()
}
