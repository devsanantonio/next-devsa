import { getDb, COLLECTIONS, type Bounty } from "@/lib/firebase-admin"
import { BountyListingsClient, type BountyListItem } from "@/components/bounties/bounty-listings-client"

async function getOpenBounties(): Promise<BountyListItem[]> {
  const db = getDb()
  const snapshot = await db.collection(COLLECTIONS.BOUNTIES).get()
  const now = new Date()

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Omit<Bounty, "id">
      const createdAt =
        (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
        String(data.createdAt)
      const deadlineAt =
        (data.deadlineAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
        (data.deadlineAt ? String(data.deadlineAt) : undefined)
      const expiresAt =
        (data.expiresAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
        (data.expiresAt ? String(data.expiresAt) : undefined)

      // Auto-expire open bounties past their expiresAt date
      const isExpired = expiresAt ? new Date(expiresAt) < now : false
      const effectiveStatus = data.status === "open" && isExpired ? "expired" : data.status

      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        orgName: data.orgName,
        orgLogo: data.orgLogo,
        orgVerifiedNonprofit: data.orgVerifiedNonprofit,
        category: data.category,
        tags: data.tags || [],
        amountCents: data.amountCents,
        payoutCents: data.payoutCents,
        status: effectiveStatus,
        applicantCount: data.applicantCount ?? 0,
        estimatedHours: data.estimatedHours,
        deadlineAt,
        createdAt,
        isPublic: data.isPublic !== false,
      }
    })
    .filter((b) => b.status === "open" && b.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 100)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ isPublic, ...rest }) => rest)
}

export default async function BountiesPage() {
  const bounties = await getOpenBounties()

  return (
    <div className="w-full min-h-dvh bg-white">
      <main className="relative w-full">
        <BountyListingsClient initialBounties={bounties} />
      </main>
    </div>
  )
}
