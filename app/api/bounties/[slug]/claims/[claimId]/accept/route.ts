import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getDb,
  COLLECTIONS,
  type Bounty,
  type BountyClaim,
  type Notification,
} from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

async function findBountyBySlug(slug: string) {
  const db = getDb();
  const snap = await db
    .collection(COLLECTIONS.BOUNTIES)
    .where('slug', '==', slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ref: doc.ref, data: doc.data() as Bounty };
}

// POST - Poster accepts a pitch.
//
// Effects (one transactional sweep, no real Firestore transaction since the
// writes are independent — order matters but they don't need atomicity in v1):
//   1. The chosen claim → 'accepted'
//   2. The bounty → status='claimed', claimantUid/Name set, claimedAt stamped
//   3. All other pending claims for this bounty → 'declined'
//   4. Notifications: accepted claimant, each declined claimant
//
// Only the bounty's poster (or a super admin) can accept.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; claimId: string }> }
) {
  const auth = await verifyJobBoardUser(request, { requireProfile: true });
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug, claimId } = await params;

    const bounty = await findBountyBySlug(slug);
    if (!bounty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    if (bounty.data.posterUid !== auth.uid && !auth.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only the poster can accept a pitch on this bounty.' },
        { status: 403 }
      );
    }

    if (bounty.data.status !== 'open') {
      return NextResponse.json(
        { error: `Bounty is not open (status: ${bounty.data.status})` },
        { status: 400 }
      );
    }

    const db = getDb();
    const claimRef = db.collection(COLLECTIONS.BOUNTY_CLAIMS).doc(claimId);
    const claimSnap = await claimRef.get();

    if (!claimSnap.exists) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    const claim = claimSnap.data() as BountyClaim;
    if (claim.bountyId !== bounty.id) {
      return NextResponse.json(
        { error: "Pitch doesn't belong to this bounty" },
        { status: 400 }
      );
    }
    if (claim.status !== 'pending') {
      return NextResponse.json(
        { error: `Pitch is not pending (status: ${claim.status})` },
        { status: 400 }
      );
    }

    const now = new Date();

    // 1. Accept the chosen claim
    await claimRef.update({
      status: 'accepted',
      decidedAt: now,
    } as Partial<BountyClaim>);

    // 2. Transition the bounty
    await bounty.ref.update({
      status: 'claimed',
      claimantUid: claim.claimantUid,
      claimantName: claim.claimantName,
      claimedAt: now,
      updatedAt: now,
    } as Partial<Bounty>);

    // 3. Decline siblings — same bounty, status='pending', different doc.
    // Fetch then update in a small batch (BOUNTY_CLAIMS is small in v1; no
    // composite index needed because we filter in memory by status).
    const siblingsSnap = await db
      .collection(COLLECTIONS.BOUNTY_CLAIMS)
      .where('bountyId', '==', bounty.id)
      .get();
    const declinedClaimants: { uid: string; name: string }[] = [];
    const batch = db.batch();
    siblingsSnap.docs.forEach((doc) => {
      if (doc.id === claimId) return;
      const sib = doc.data() as BountyClaim;
      if (sib.status !== 'pending') return;
      batch.update(doc.ref, {
        status: 'declined',
        decidedAt: now,
      } as Partial<BountyClaim>);
      declinedClaimants.push({ uid: sib.claimantUid, name: sib.claimantName });
    });
    if (declinedClaimants.length > 0) {
      await batch.commit();
    }

    // 4. Notifications
    const notifications: Promise<unknown>[] = [];

    const acceptedNotif: Omit<Notification, 'id'> = {
      recipientUid: claim.claimantUid,
      type: 'status-update',
      title: 'Your pitch was accepted',
      body: `You've been picked for "${bounty.data.title}". Coordinate with the poster and submit your deliverable when ready.`,
      link: `/bounties/${bounty.data.slug}`,
      sourceUid: auth.uid,
      sourceName: bounty.data.posterName,
      referenceId: claimId,
      read: false,
      createdAt: now,
    };
    notifications.push(db.collection(COLLECTIONS.NOTIFICATIONS).add(acceptedNotif));

    for (const declined of declinedClaimants) {
      const notif: Omit<Notification, 'id'> = {
        recipientUid: declined.uid,
        type: 'status-update',
        title: 'Bounty went to another builder',
        body: `Another builder was picked for "${bounty.data.title}". Browse open bounties to find your next match.`,
        link: '/bounties',
        sourceUid: auth.uid,
        sourceName: bounty.data.posterName,
        referenceId: bounty.id,
        read: false,
        createdAt: now,
      };
      notifications.push(db.collection(COLLECTIONS.NOTIFICATIONS).add(notif));
    }

    await Promise.all(notifications);

    revalidatePath(`/bounties/${slug}`);
    revalidatePath('/bounties');

    return NextResponse.json({
      success: true,
      claimantName: claim.claimantName,
      declinedCount: declinedClaimants.length,
    });
  } catch (error) {
    console.error('Accept claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
