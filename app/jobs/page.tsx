import Link from "next/link"
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
        {/* Hero Section */}
        <section className="w-full min-h-dvh flex flex-col justify-center px-5 sm:px-6 py-24 sm:py-16 relative overflow-hidden bg-white">
          {/* Gradient from top-right corner */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,66,111,0.15)_0%,rgba(239,66,111,0.05)_40%,transparent_70%)]" />

          {/* Content — left-aligned */}
          <div className="relative z-10 w-full max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em] mb-4">
                Find your next build
              </p>

              <h1 className="font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em] mb-8">
                Where San Antonio{" "}
                <span className="text-gray-600 font-light italic">Tech Talent</span>{" "}
                Connects.
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light max-w-2xl mb-10 sm:mb-12">
                No middleman and no noise. DEVSA is the direct bridge between passionate builders and the local companies shaping our tech ecosystem.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <Link
                  href="/jobs/signin?role=hiring"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gray-900 px-7 py-4 text-sm font-bold text-white hover:bg-gray-800 transition-colors duration-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  I&apos;m Hiring
                </Link>
                <Link
                  href="/jobs/signin?role=open-to-work"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#ef426f] px-7 py-4 text-sm font-bold text-white hover:bg-[#d93a60] transition-colors duration-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  Open to Work
                </Link>
                <a
                  href="#open-positions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-7 py-4 text-sm font-bold text-gray-900 hover:border-gray-900 hover:bg-gray-50 transition-colors duration-200"
                >
                  View Opportunities
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Job Listings — interactive client component */}
        <JobListingsClient initialListings={listings} />
      </main>
    </div>
  )
}
