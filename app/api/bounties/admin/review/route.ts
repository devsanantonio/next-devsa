import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb, COLLECTIONS, type JobListing } from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';
import { shareJobToDiscord } from '@/lib/discord';
import { shareJobToLinkedIn } from '@/lib/linkedin';

// POST - Approve or reject a pending job listing (super admin only)
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  if (!result.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Super admin access required.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { jobId, action } = body;

    if (!jobId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'jobId and action (approve|reject) are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.JOB_LISTINGS).doc(jobId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listing = doc.data() as JobListing;

    if (listing.status !== 'pending') {
      return NextResponse.json(
        { error: `Listing is not pending review (current status: ${listing.status})` },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve: set to published, refresh expiration, share to Discord/LinkedIn
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      await docRef.update({
        status: 'published',
        expiresAt,
        updatedAt: new Date(),
      });

      // Share to Discord and LinkedIn (fire-and-forget)
      shareJobToDiscord({
        title: listing.title,
        companyName: listing.companyName,
        slug: listing.slug,
        type: listing.type,
        locationType: listing.locationType,
        location: listing.location || undefined,
        salaryRange: listing.salaryRange || undefined,
        equityRange: listing.equityRange || undefined,
        startupStage: listing.startupStage || undefined,
        tags: listing.tags || [],
        description: listing.description || undefined,
      }).catch((err) => console.error('Discord share failed:', err));

      shareJobToLinkedIn({
        title: listing.title,
        companyName: listing.companyName,
        slug: listing.slug,
        type: listing.type,
        locationType: listing.locationType,
        location: listing.location || undefined,
        salaryRange: listing.salaryRange || undefined,
        description: listing.description || undefined,
        tags: listing.tags || [],
      }).catch((err) => console.error('LinkedIn share failed:', err));

      // Notify the job poster
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        recipientUid: listing.authorUid,
        type: 'status-update',
        title: 'Job Approved',
        body: `Your listing "${listing.title}" has been approved and is now live on DEVSA Bounties.`,
        link: `/bounties/${listing.slug}`,
        read: false,
        sourceUid: result.uid,
        sourceName: `${result.profile!.firstName} ${result.profile!.lastName}`,
        referenceId: jobId,
        createdAt: new Date(),
      });
    } else {
      // Reject: set to rejected
      await docRef.update({
        status: 'rejected',
        updatedAt: new Date(),
      });

      // Notify the job poster
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        recipientUid: listing.authorUid,
        type: 'status-update',
        title: 'Job Not Approved',
        body: `Your job listing "${listing.title}" was not approved. Please review our posting guidelines and resubmit.`,
        link: '/bounties/dashboard',
        read: false,
        sourceUid: result.uid,
        sourceName: `${result.profile!.firstName} ${result.profile!.lastName}`,
        referenceId: jobId,
        createdAt: new Date(),
      });
    }

    revalidatePath('/bounties');

    return NextResponse.json({
      success: true,
      action,
      message: action === 'approve'
        ? 'Job approved and shared to Discord & LinkedIn'
        : 'Job rejected and poster notified',
    });
  } catch (error) {
    console.error('Admin review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
