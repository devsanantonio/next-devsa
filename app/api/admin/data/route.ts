import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { PYSA_EVENT_ID, PYSA_HOST_COMMUNITY } from '@/data/pysa/2026';

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

    const adminData = adminQuery.docs[0].data();
    const isAdmin = adminData.role === 'admin' || adminData.role === 'superadmin';

    // Organizers see none of the sensitive collections, with one deliberate
    // exception: the community that hosts PySanAntonio gets that conference's
    // speaker submissions, because its organizers are the ones building the
    // lineup. Every other event's submissions stay admin-only, and this is
    // enforced here rather than in the client so the scoping is not bypassable.
    if (!isAdmin) {
      let speakers: Record<string, unknown>[] = [];

      if (adminData.communityId) {
        const communityDoc = await db
          .collection(COLLECTIONS.COMMUNITIES)
          .doc(adminData.communityId)
          .get();
        const communityName = communityDoc.exists
          ? (communityDoc.data()?.name as string | undefined)
          : undefined;

        const hostsPysa =
          communityName?.trim().toLowerCase() ===
          PYSA_HOST_COMMUNITY.toLowerCase();

        if (hostsPysa) {
          const snapshot = await db
            .collection(COLLECTIONS.SPEAKERS)
            .where('eventId', '==', PYSA_EVENT_ID)
            .get();
          speakers = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              submittedAt:
                doc.data().submittedAt?.toDate?.()?.toISOString() ||
                doc.data().submittedAt,
            }))
            // orderBy is omitted so this needs no composite index; sort here.
            .sort((a, b) =>
              String(b.submittedAt ?? '').localeCompare(String(a.submittedAt ?? ''))
            );
        }
      }

      return NextResponse.json({
        newsletter: [],
        speakers,
        accessRequests: [],
        admins: [],
        role: adminData.role,
        communityId: adminData.communityId,
      });
    }

    // For admins, fetch all data
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
      role: adminData.role,
      communityId: adminData.communityId,
    });
  } catch (error) {
    console.error('Admin data fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
