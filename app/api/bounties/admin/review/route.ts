import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb, COLLECTIONS, type Bounty } from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';
import { shareJobToDiscord } from '@/lib/discord';
import { shareJobToLinkedIn } from '@/lib/linkedin';

// POST - Approve or reject a pending bounty (super admin only).
//
// Slice 3a.2 migration: operates on BOUNTIES (was JOB_LISTINGS), status flow
// is pending_review → open (approve) | rejected (reject).
//
// Request body: { bountyId, action: 'approve'|'reject', reason? }
// Backward compat: also accepts { jobId } so the existing admin UI doesn't
// need to ship a coordinated change. Either field name works.
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
    const { bountyId, jobId, action, reason } = body as {
      bountyId?: string;
      jobId?: string;
      action?: 'approve' | 'reject';
      reason?: string;
    };

    const docId = bountyId || jobId;

    if (!docId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'bountyId and action (approve|reject) are required' },
        { status: 400 }
      );
    }

    const rejectionReason = typeof reason === 'string' ? reason.trim().slice(0, 500) : '';

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.BOUNTIES).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    const bounty = doc.data() as Bounty;

    if (bounty.status !== 'pending_review') {
      return NextResponse.json(
        { error: `Bounty is not pending review (current status: ${bounty.status})` },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve: move to open. expiresAt was set at post-time (30 days);
      // no need to refresh here unless the bounty has already expired.
      const updates: Partial<Bounty> = {
        status: 'open',
        updatedAt: new Date(),
      };
      if (bounty.expiresAt && new Date(bounty.expiresAt as unknown as string) < new Date()) {
        // Stale expiry — push forward 30 days from approval.
        updates.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      await docRef.update(updates);

      // Share to Discord and LinkedIn (fire-and-forget).
      // We adapt Bounty fields into the existing share-helper shape rather than
      // refactor the helpers; clearer at the call site and keeps blast radius small.
      const amountLabel = `$${(bounty.amountCents / 100).toLocaleString()} bounty`;
      const payoutLabel = `Builder receives $${(bounty.payoutCents / 100).toLocaleString()}`;
      const compensationLine = `${amountLabel} · ${payoutLabel}`;

      shareJobToDiscord({
        title: bounty.title,
        companyName: bounty.orgName,
        slug: bounty.slug,
        type: bounty.category,
        locationType: 'remote',
        location: undefined,
        salaryRange: compensationLine,
        equityRange: undefined,
        startupStage: undefined,
        tags: bounty.tags || [],
        description: bounty.summary || bounty.description || undefined,
      }).catch((err) => console.error('Discord share failed:', err));

      shareJobToLinkedIn({
        title: bounty.title,
        companyName: bounty.orgName,
        slug: bounty.slug,
        type: bounty.category,
        locationType: 'remote',
        location: undefined,
        salaryRange: compensationLine,
        description: bounty.summary || bounty.description || undefined,
        tags: bounty.tags || [],
      }).catch((err) => console.error('LinkedIn share failed:', err));

      // Notify the poster.
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        recipientUid: bounty.posterUid,
        type: 'status-update',
        title: 'Bounty Approved',
        body: `Your bounty "${bounty.title}" is now live on DEVSA Bounties.`,
        link: `/bounties/${bounty.slug}`,
        read: false,
        sourceUid: result.uid,
        sourceName: `${result.profile!.firstName} ${result.profile!.lastName}`,
        referenceId: docId,
        createdAt: new Date(),
      });
    } else {
      // Reject: set rejected + store reviewer note.
      // rejectionReason isn't on the Bounty schema yet — admin-only annotation.
      // Cast through unknown so TS allows the extra field without bloating the
      // type definition for a moderation concern.
      await docRef.update({
        status: 'rejected',
        rejectionReason: rejectionReason || null,
        updatedAt: new Date(),
      } as unknown as Partial<Bounty>);

      const notificationBody = rejectionReason
        ? `Your bounty "${bounty.title}" was not approved. Reviewer note: ${rejectionReason}`
        : `Your bounty "${bounty.title}" was not approved. Please review the posting guidelines and resubmit.`;

      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        recipientUid: bounty.posterUid,
        type: 'status-update',
        title: 'Bounty Not Approved',
        body: notificationBody,
        link: '/bounties/dashboard',
        read: false,
        sourceUid: result.uid,
        sourceName: `${result.profile!.firstName} ${result.profile!.lastName}`,
        referenceId: docId,
        createdAt: new Date(),
      });
    }

    revalidatePath('/bounties');

    return NextResponse.json({
      success: true,
      action,
      message:
        action === 'approve'
          ? 'Bounty approved and shared to Discord & LinkedIn'
          : 'Bounty rejected and poster notified',
    });
  } catch (error) {
    console.error('Admin review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
