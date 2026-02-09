import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type JobApplication, type Notification } from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

// GET - Get applications (for job author: all apps on their job, for applicant: their own apps)
export async function GET(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const db = getDb();
    const jobId = request.nextUrl.searchParams.get('jobId');

    let snapshot;

    if (result.isSuperAdmin && !jobId) {
      // Super admin can view ALL applications
      snapshot = await db.collection(COLLECTIONS.JOB_APPLICATIONS)
        .orderBy('createdAt', 'desc')
        .get();
    } else if (jobId && (result.profile?.role === 'hiring' || result.isSuperAdmin)) {
      // Hiring manager viewing applicants for their job (or super admin)
      const jobDoc = await db.collection(COLLECTIONS.JOB_LISTINGS).doc(jobId).get();
      if (!jobDoc.exists || (jobDoc.data()?.authorUid !== result.uid && !result.isSuperAdmin)) {
        return NextResponse.json(
          { error: 'Job not found or unauthorized' },
          { status: 403 }
        );
      }
      snapshot = await db.collection(COLLECTIONS.JOB_APPLICATIONS)
        .where('jobId', '==', jobId)
        .orderBy('createdAt', 'desc')
        .get();
    } else {
      // Open-to-work user viewing their own applications
      snapshot = await db.collection(COLLECTIONS.JOB_APPLICATIONS)
        .where('applicantUid', '==', result.uid)
        .orderBy('createdAt', 'desc')
        .get();
    }

    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Apply to a job (open-to-work role only)
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true, requireRole: 'open-to-work' });
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const { jobId, coverNote } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if job exists and is published
    const jobDoc = await db.collection(COLLECTIONS.JOB_LISTINGS).doc(jobId).get();
    if (!jobDoc.exists) {
      return NextResponse.json(
        { error: 'Job listing not found' },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data()!;
    if (jobData.status !== 'published') {
      return NextResponse.json(
        { error: 'This job listing is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check for duplicate application
    const existingApp = await db.collection(COLLECTIONS.JOB_APPLICATIONS)
      .where('jobId', '==', jobId)
      .where('applicantUid', '==', result.uid)
      .limit(1)
      .get();

    if (!existingApp.empty) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 409 }
      );
    }

    const now = new Date();

    const application: Omit<JobApplication, 'id'> = {
      jobId,
      jobTitle: jobData.title,
      applicantUid: result.uid,
      applicantName: `${result.profile!.firstName} ${result.profile!.lastName}`,
      applicantEmail: result.email,
      coverNote: coverNote || '',
      status: 'submitted',
      createdAt: now,
    };

    await db.collection(COLLECTIONS.JOB_APPLICATIONS).add(application);

    // Increment applicant count on the job listing
    await jobDoc.ref.update({
      applicantCount: (jobData.applicantCount || 0) + 1,
    });

    // Notify the hiring manager
    const notification: Omit<Notification, 'id'> = {
      recipientUid: jobData.authorUid,
      type: 'application',
      title: 'New application received',
      body: `${application.applicantName} applied to "${jobData.title}"`,
      link: `/jobs/dashboard?tab=applications&jobId=${jobId}`,
      sourceUid: result.uid,
      sourceName: application.applicantName,
      referenceId: jobId,
      read: false,
      createdAt: now,
    };
    await db.collection(COLLECTIONS.NOTIFICATIONS).add(notification);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Apply error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update application status (hiring role / job owner only)
export async function PUT(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true, requireRole: 'hiring' });
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    if (!['viewed', 'shortlisted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = getDb();
    const appDoc = await db.collection(COLLECTIONS.JOB_APPLICATIONS).doc(applicationId).get();

    if (!appDoc.exists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const appData = appDoc.data() as JobApplication;

    // Verify the hiring manager owns the job (or is super admin)
    const jobDoc = await db.collection(COLLECTIONS.JOB_LISTINGS).doc(appData.jobId).get();
    if (!jobDoc.exists || (jobDoc.data()?.authorUid !== result.uid && !result.isSuperAdmin)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await appDoc.ref.update({ status });

    // Notify the applicant of status change
    const notification: Omit<Notification, 'id'> = {
      recipientUid: appData.applicantUid,
      type: 'status-update',
      title: 'Application status updated',
      body: `Your application for "${appData.jobTitle}" has been ${status}`,
      link: `/jobs/dashboard?tab=applications`,
      sourceUid: result.uid,
      sourceName: `${result.profile!.firstName} ${result.profile!.lastName}`,
      referenceId: appData.jobId,
      read: false,
      createdAt: new Date(),
    };
    await db.collection(COLLECTIONS.NOTIFICATIONS).add(notification);

    return NextResponse.json({
      success: true,
      message: 'Application status updated',
    });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
