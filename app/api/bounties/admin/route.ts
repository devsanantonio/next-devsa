import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  COLLECTIONS,
  type JobBoardUser,
  type Bounty,
  type JobApplication,
} from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

// GET - Admin overview: all users, bounties, and applications (super admin only).
// Migrated in Slice 3a.2 from JOB_LISTINGS → BOUNTIES collection.
// Applications are still backed by JOB_APPLICATIONS during the transition;
// they'll be replaced by BountyClaim records in Slice 3b.
export async function GET(request: NextRequest) {
  const result = await verifyJobBoardUser(request);
  if (result instanceof NextResponse) return result;

  if (!result.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Super admin access required.' },
      { status: 403 }
    );
  }

  try {
    const db = getDb();

    // Fetch all users
    const usersSnap = await db.collection(COLLECTIONS.JOB_BOARD_USERS).get();
    const users = usersSnap.docs.map((doc) => {
      const data = doc.data() as JobBoardUser;
      return {
        uid: data.uid,
        email: data.email,
        role: data.role,
        displayName: data.displayName || `${data.firstName} ${data.lastName}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        profileImage: data.profileImage,
        companyName: data.companyName,
        isActive: data.isActive,
        createdAt: data.createdAt,
      };
    });

    // Fetch all bounties (no .orderBy — BOUNTIES is small in v1 and an index
    // would be required for orderBy on a non-indexed field; sort in memory).
    const bountiesSnap = await db.collection(COLLECTIONS.BOUNTIES).get();
    const bounties = bountiesSnap.docs
      .map((doc) => {
        const data = doc.data() as Bounty;
        const createdAt =
          (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
          String(data.createdAt);
        return {
          id: doc.id,
          title: data.title,
          slug: data.slug,
          orgName: data.orgName,
          orgVerifiedNonprofit: data.orgVerifiedNonprofit ?? false,
          posterUid: data.posterUid,
          posterName: data.posterName,
          category: data.category,
          status: data.status,
          amountCents: data.amountCents,
          payoutCents: data.payoutCents,
          platformFeeCents: data.platformFeeCents,
          applicantCount: data.applicantCount ?? 0,
          createdAt,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    // Fetch all applications (legacy JOB_APPLICATIONS — replaced by bounty
    // claims in Slice 3b; kept here so existing rows still render).
    const appsSnap = await db.collection(COLLECTIONS.JOB_APPLICATIONS).get();
    const applications = appsSnap.docs
      .map((doc) => {
        const data = doc.data() as JobApplication;
        const createdAt =
          (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
          String(data.createdAt);
        return {
          id: doc.id,
          jobId: data.jobId,
          jobTitle: data.jobTitle,
          applicantUid: data.applicantUid,
          applicantName: data.applicantName,
          applicantEmail: data.applicantEmail,
          status: data.status,
          createdAt,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return NextResponse.json({
      users,
      bounties,
      applications,
      stats: {
        totalUsers: users.length,
        hiringUsers: users.filter((u) => u.role === 'hiring').length,
        openToWorkUsers: users.filter((u) => u.role === 'open-to-work').length,
        totalBounties: bounties.length,
        openBounties: bounties.filter((b) => b.status === 'open').length,
        pendingBounties: bounties.filter((b) => b.status === 'pending_review').length,
        claimedBounties: bounties.filter((b) => b.status === 'claimed').length,
        completedBounties: bounties.filter((b) => b.status === 'completed').length,
        draftBounties: bounties.filter((b) => b.status === 'draft').length,
        totalApplications: applications.length,
      },
    });
  } catch (error) {
    console.error('Admin data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
