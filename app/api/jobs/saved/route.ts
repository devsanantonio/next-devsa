import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

// GET - Get user's saved jobs
export async function GET(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.SAVED_JOBS)
      .where('userUid', '==', result.uid)
      .orderBy('savedAt', 'desc')
      .get();

    const savedJobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      savedAt: doc.data().savedAt?.toDate?.()?.toISOString() || doc.data().savedAt,
    }));

    return NextResponse.json({ savedJobs });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save/bookmark a job
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check for duplicate
    const existing = await db
      .collection(COLLECTIONS.SAVED_JOBS)
      .where('userUid', '==', result.uid)
      .where('jobId', '==', jobId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: 'Job already saved' },
        { status: 409 }
      );
    }

    await db.collection(COLLECTIONS.SAVED_JOBS).add({
      userUid: result.uid,
      jobId,
      savedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Job saved' });
  } catch (error) {
    console.error('Save job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Unsave/unbookmark a job
export async function DELETE(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.SAVED_JOBS)
      .where('userUid', '==', result.uid)
      .where('jobId', '==', jobId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Saved job not found' },
        { status: 404 }
      );
    }

    await snapshot.docs[0].ref.delete();

    return NextResponse.json({ success: true, message: 'Job unsaved' });
  } catch (error) {
    console.error('Unsave job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
