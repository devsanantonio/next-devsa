import { getDb, COLLECTIONS, type JobListing } from "@/lib/firebase-admin"
import { JobListingsClient } from "@/components/jobs/job-listings-client"

async function getPublishedListings() {
  const db = getDb()
  const snapshot = await db.collection(COLLECTIONS.JOB_LISTINGS).get()
  const now = new Date()

  const listings = snapshot.docs
    .map((doc) => {
      const data = doc.data() as Omit<JobListing, "id">
      const createdAt =
        (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
        String(data.createdAt)
      const expiresAt =
        (data.expiresAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
        (data.expiresAt ? String(data.expiresAt) : undefined)

      // Auto-expire
      const isExpired = expiresAt ? new Date(expiresAt) < now : false
      const status = data.status === "published" && isExpired ? "expired" : data.status

      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        companyName: data.companyName,
        companyLogo: data.companyLogo || undefined,
        type: data.type,
        locationType: data.locationType,
        location: data.location || undefined,
        salaryRange: data.salaryRange || undefined,
        tags: data.tags || [],
        applicantCount: data.applicantCount ?? 0,
        createdAt,
        status,
      }
    })
    .filter((l) => l.status === "published")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50)
    // Strip status before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ status, ...rest }) => rest)

  return listings
}

export default async function JobsPage() {
  const listings = await getPublishedListings()

  return (
    <div className="w-full min-h-dvh bg-white">
      <main className="relative w-full">
        <JobListingsClient initialListings={listings} />
      </main>
    </div>
  )
}
