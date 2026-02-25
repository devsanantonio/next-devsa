import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getDb, COLLECTIONS, type JobListing } from "@/lib/firebase-admin"
import { sanitizeHtml } from "@/lib/sanitize"
import { JobDetailClient } from "@/components/jobs/job-detail-client"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

interface Props {
  params: Promise<{ slug: string }>
}

async function getJob(slug: string) {
  const db = getDb()
  const snapshot = await db
    .collection(COLLECTIONS.JOB_LISTINGS)
    .where("slug", "==", slug)
    .limit(1)
    .get()

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  const data = doc.data() as Omit<JobListing, "id">

  return {
    ...data,
    id: doc.id,
    description: sanitizeHtml(data.description || ""),
    requirements: data.requirements ? sanitizeHtml(data.requirements) : undefined,
    createdAt:
      (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
      String(data.createdAt),
    updatedAt:
      (data.updatedAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
      undefined,
    expiresAt:
      (data as Record<string, unknown>).expiresAt
        ? ((data as Record<string, unknown>).expiresAt as unknown as { toDate?: () => Date })
            ?.toDate?.()
            ?.toISOString()
        : undefined,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const job = await getJob(slug)

  if (!job) {
    return { title: "Job Not Found - DEVSA Jobs" }
  }

  const title = `${job.title} at ${job.companyName} - DEVSA Jobs`
  const description = `${job.title} · ${job.companyName} · ${
    job.locationType === "remote" ? "Remote" : job.location || "San Antonio"
  }${job.salaryRange ? ` · ${job.salaryRange}` : ""}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/jobs/${slug}`,
      siteName: "DEVSA",
      type: "article",
      images: [
        {
          url: `${siteUrl}/api/og/jobs`,
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
      images: [`${siteUrl}/api/og/jobs`],
    },
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params
  const job = await getJob(slug)

  if (!job || (job.status !== "published" && job.status !== "closed")) {
    notFound()
  }

  return <JobDetailClient job={job as Parameters<typeof JobDetailClient>[0]["job"]} />
}
