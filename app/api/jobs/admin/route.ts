import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type JobBoardUser, type JobListing, type JobApplication } from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

// GET - Admin overview: all users, jobs, and applications (super admin only)
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

    // Fetch all job listings
    const jobsSnap = await db
      .collection(COLLECTIONS.JOB_LISTINGS)
      .orderBy('createdAt', 'desc')
      .get();
    const jobs = jobsSnap.docs.map((doc) => {
      const data = doc.data() as JobListing;
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        companyName: data.companyName,
        authorUid: data.authorUid,
        authorName: data.authorName,
        type: data.type,
        locationType: data.locationType,
        location: data.location,
        status: data.status,
        applicantCount: data.applicantCount,
        createdAt: data.createdAt,
      };
    });

    // Fetch all applications
    const appsSnap = await db
      .collection(COLLECTIONS.JOB_APPLICATIONS)
      .orderBy('createdAt', 'desc')
      .get();
    const applications = appsSnap.docs.map((doc) => {
      const data = doc.data() as JobApplication;
      return {
        id: doc.id,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        applicantUid: data.applicantUid,
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        status: data.status,
        createdAt: data.createdAt,
      };
    });

    return NextResponse.json({
      users,
      jobs,
      applications,
      stats: {
        totalUsers: users.length,
        hiringUsers: users.filter((u) => u.role === 'hiring').length,
        openToWorkUsers: users.filter((u) => u.role === 'open-to-work').length,
        totalJobs: jobs.length,
        publishedJobs: jobs.filter((j) => j.status === 'published').length,
        draftJobs: jobs.filter((j) => j.status === 'draft').length,
        closedJobs: jobs.filter((j) => j.status === 'closed').length,
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
