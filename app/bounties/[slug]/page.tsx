import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getDb, COLLECTIONS, type Bounty } from "@/lib/firebase-admin"
import { sanitizeHtml } from "@/lib/sanitize"
import { BountyDetailClient, type BountyDetail } from "@/components/bounties/bounty-detail-client"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

interface Props {
  params: Promise<{ slug: string }>
}

function toIso(value: unknown): string | undefined {
  if (!value) return undefined
  const v = value as { toDate?: () => Date }
  if (typeof v.toDate === "function") return v.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string") return value
  return undefined
}

async function getBounty(slug: string): Promise<BountyDetail | null> {
  const db = getDb()
  const snapshot = await db
    .collection(COLLECTIONS.BOUNTIES)
    .where("slug", "==", slug)
    .limit(1)
    .get()

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  const data = doc.data() as Omit<Bounty, "id">

  const createdAt = toIso(data.createdAt) ?? new Date().toISOString()

  return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    description: sanitizeHtml(data.description || ""),
    deliverables: data.deliverables || [],
    category: data.category,
    tags: data.tags || [],
    orgName: data.orgName,
    orgLogo: data.orgLogo,
    orgVerifiedNonprofit: data.orgVerifiedNonprofit,
    posterUid: data.posterUid,
    posterName: data.posterName,
    amountCents: data.amountCents,
    payoutCents: data.payoutCents,
    platformFeeCents: data.platformFeeCents,
    status: data.status,
    applicantCount: data.applicantCount ?? 0,
    estimatedHours: data.estimatedHours,
    deadlineAt: toIso(data.deadlineAt),
    createdAt,
    escrowStatus: data.escrowStatus,
    claimantUid: data.claimantUid,
    claimantName: data.claimantName,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const bounty = await getBounty(slug)

  if (!bounty) {
    return { title: "Bounty Not Found · DEVSA" }
  }

  const title = `${bounty.title} · ${bounty.orgName} · DEVSA Bounties`
  const description = bounty.summary

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/bounties/${slug}`,
      siteName: "DEVSA",
      type: "article",
      images: [
        {
          url: `${siteUrl}/api/og/bounties`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/api/og/bounties`],
    },
  }
}

export default async function BountyDetailPage({ params }: Props) {
  const { slug } = await params
  const bounty = await getBounty(slug)

  // Show open, claimed, completed, in_review. Hide drafts/pending from public.
  if (
    !bounty ||
    bounty.status === "draft" ||
    bounty.status === "pending_review" ||
    bounty.status === "cancelled" ||
    bounty.status === "expired"
  ) {
    notFound()
  }

  return <BountyDetailClient bounty={bounty} />
}
