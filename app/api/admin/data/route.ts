import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';

// Get all data for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required for authentication' },
        { status: 401 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const db = getDb();

    // Check if user is approved admin
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    // Fetch all data
    const [newsletterSnapshot, speakersSnapshot, accessRequestsSnapshot, adminsSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.NEWSLETTER).orderBy('subscribedAt', 'desc').get(),
      db.collection(COLLECTIONS.SPEAKERS).orderBy('submittedAt', 'desc').get(),
      db.collection(COLLECTIONS.ACCESS_REQUESTS).orderBy('submittedAt', 'desc').get(),
      db.collection(COLLECTIONS.APPROVED_ADMINS).get(),
    ]);

    const newsletter = newsletterSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      subscribedAt: doc.data().subscribedAt?.toDate?.()?.toISOString() || doc.data().subscribedAt,
    }));

    const speakers = speakersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || doc.data().submittedAt,
    }));

    const accessRequests = accessRequestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || doc.data().submittedAt,
    }));

    const admins = adminsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      approvedAt: doc.data().approvedAt?.toDate?.()?.toISOString() || doc.data().approvedAt,
    }));

    return NextResponse.json({
      newsletter,
      speakers,
      accessRequests,
      admins,
    });
  } catch (error) {
    console.error('Admin data fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
