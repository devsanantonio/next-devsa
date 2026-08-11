import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { PYSA_EVENT_ID, PYSA_HOST_COMMUNITY } from '@/data/pysa/2026';
import {
  AG_EVENT_ID,
  AG_HOST_COMMUNITY,
  AG_HOST_COMMUNITY_ID,
} from '@/data/access-granted/2026';

/**
 * The events whose submissions a host community's organizers may see.
 *
 * Each entry names the community that owns an event and the eventId to filter
 * by. Adding an event to this list is the whole job — the branch below is
 * generic over it, so a new open call no longer means new scoping logic.
 *
 * PySanAntonio matches on the community NAME only, which is how it has always
 * worked. Access Granted also accepts the community's document id, because a
 * name is editable in the admin UI and a rename would otherwise silently cut
 * organizers off from their own submissions.
 */
const HOSTED_EVENTS: {
  eventId: string;
  communityName: string;
  communityId?: string;
}[] = [
  { eventId: PYSA_EVENT_ID, communityName: PYSA_HOST_COMMUNITY },
  {
    eventId: AG_EVENT_ID,
    communityName: AG_HOST_COMMUNITY,
    communityId: AG_HOST_COMMUNITY_ID,
  },
];

/** Firestore timestamps come back as Timestamp; the client wants ISO strings. */
const withIsoDate = (doc: FirebaseFirestore.QueryDocumentSnapshot, field: string) => ({
  id: doc.id,
  ...doc.data(),
  [field]: doc.data()[field]?.toDate?.()?.toISOString() || doc.data()[field],
});

/** Newest first. Sorted here so the queries need no composite index. */
const byNewest = (field: string) => (a: Record<string, unknown>, b: Record<string, unknown>) =>
  String(b[field] ?? '').localeCompare(String(a[field] ?? ''));

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
    // exception: a community that hosts an event in HOSTED_EVENTS gets that
    // event's speaker submissions AND volunteer signups, because its organizers
    // are the ones building the lineup and the crew. Every other event's
    // submissions stay admin-only, and this is enforced here rather than in the
    // client so the scoping is not bypassable.
    if (!isAdmin) {
      let speakers: Record<string, unknown>[] = [];
      let volunteers: Record<string, unknown>[] = [];

      if (adminData.communityId) {
        const communityDoc = await db
          .collection(COLLECTIONS.COMMUNITIES)
          .doc(adminData.communityId)
          .get();
        const communityName = communityDoc.exists
          ? (communityDoc.data()?.name as string | undefined)
          : undefined;

        // Every event this organizer's community hosts. Matched on the
        // community's name, or on its document id where the event supplies one.
        const hosted = HOSTED_EVENTS.filter(
          (ev) =>
            communityName?.trim().toLowerCase() === ev.communityName.toLowerCase() ||
            (ev.communityId !== undefined && adminData.communityId === ev.communityId)
        );

        if (hosted.length > 0) {
          const eventIds = hosted.map((ev) => ev.eventId);

          // `in` takes up to 30 values, far more than the handful of hosted
          // events here, so one query covers every event a community owns.
          const [speakerSnap, volunteerSnap] = await Promise.all([
            db.collection(COLLECTIONS.SPEAKERS).where('eventId', 'in', eventIds).get(),
            db
              .collection(COLLECTIONS.VOLUNTEER_SIGNUPS)
              .where('eventId', 'in', eventIds)
              .get(),
          ]);

          // orderBy is omitted so these need no composite index; sort here.
          speakers = speakerSnap.docs
            .map((doc) => withIsoDate(doc, 'submittedAt'))
            .sort(byNewest('submittedAt'));
          volunteers = volunteerSnap.docs
            .map((doc) => withIsoDate(doc, 'submittedAt'))
            .sort(byNewest('submittedAt'));
        }
      }

      return NextResponse.json({
        newsletter: [],
        speakers,
        volunteers,
        accessRequests: [],
        admins: [],
        role: adminData.role,
        communityId: adminData.communityId,
      });
    }

    // For admins, fetch all data
    const [
      newsletterSnapshot,
      speakersSnapshot,
      volunteersSnapshot,
      accessRequestsSnapshot,
      adminsSnapshot,
    ] = await Promise.all([
      db.collection(COLLECTIONS.NEWSLETTER).orderBy('subscribedAt', 'desc').get(),
      db.collection(COLLECTIONS.SPEAKERS).orderBy('submittedAt', 'desc').get(),
      db.collection(COLLECTIONS.VOLUNTEER_SIGNUPS).orderBy('submittedAt', 'desc').get(),
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

    const volunteers = volunteersSnapshot.docs.map(doc => ({
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
      volunteers,
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
