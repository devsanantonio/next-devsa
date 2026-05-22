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

// Resolve a Bounty by slug. Returned with the doc id since downstream writes
// (claims, status transitions) use the id, not the slug.
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

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  const v = value as { toDate?: () => Date };
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return undefined;
}

function serializeClaim(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot) {
  const data = doc.data() as Omit<BountyClaim, 'id'>;
  return {
    ...data,
    id: doc.id,
    createdAt: toIso(data.createdAt),
    decidedAt: toIso(data.decidedAt),
  };
}

// GET - List claims for a bounty.
//
// Visibility rules:
//   - Poster (or super admin): full list with all pitch details
//   - Anyone else (signed in): only their own claim if one exists, plus a
//     total count so the UI can show "N others have pitched"
//   - Signed-out: 401 (no claim visibility)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await verifyJobBoardUser(request, { requireProfile: true });
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const bounty = await findBountyBySlug(slug);
    if (!bounty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    const db = getDb();
    const snap = await db
      .collection(COLLECTIONS.BOUNTY_CLAIMS)
      .where('bountyId', '==', bounty.id)
      .get();

    const allClaims = snap.docs
      .map(serializeClaim)
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

    const isPoster = auth.uid === bounty.data.posterUid;
    const myClaim = allClaims.find((c) => c.claimantUid === auth.uid) || null;

    if (isPoster || auth.isSuperAdmin) {
      return NextResponse.json({
        claims: allClaims,
        myClaim,
        totalCount: allClaims.length,
        viewer: 'poster' as const,
      });
    }

    return NextResponse.json({
      claims: myClaim ? [myClaim] : [],
      myClaim,
      totalCount: allClaims.length,
      viewer: 'claimant' as const,
    });
  } catch (error) {
    console.error('List claims error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit a pitch (claim) for a bounty.
//
// Rules:
//   - Bounty must be 'open' (no pitches on draft/pending/claimed/closed)
//   - Caller cannot be the poster
//   - One active pitch per claimant per bounty (no dup if pending/accepted)
//   - pitchNote required, min length 10 chars
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await verifyJobBoardUser(request, { requireProfile: true });
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const body = await request.json();
    const { pitchNote, proposedTimelineDays, portfolioLinks } = body as {
      pitchNote?: string;
      proposedTimelineDays?: number;
      portfolioLinks?: string[];
    };

    if (!pitchNote || pitchNote.trim().length < 10) {
      return NextResponse.json(
        { error: 'Pitch note is required (10+ characters)' },
        { status: 400 }
      );
    }

    const bounty = await findBountyBySlug(slug);
    if (!bounty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    if (bounty.data.status !== 'open') {
      return NextResponse.json(
        { error: `This bounty isn't accepting pitches (status: ${bounty.data.status})` },
        { status: 400 }
      );
    }

    if (bounty.data.posterUid === auth.uid) {
      return NextResponse.json(
        { error: "You can't pitch on your own bounty" },
        { status: 403 }
      );
    }

    const db = getDb();

    // Reject duplicate active pitches. A previously declined/withdrawn claim
    // doesn't block re-pitching; we'll surface withdraw in a later sub-slice.
    const existing = await db
      .collection(COLLECTIONS.BOUNTY_CLAIMS)
      .where('bountyId', '==', bounty.id)
      .where('claimantUid', '==', auth.uid)
      .get();
    const hasActive = existing.docs.some((doc) => {
      const s = (doc.data() as BountyClaim).status;
      return s === 'pending' || s === 'accepted';
    });
    if (hasActive) {
      return NextResponse.json(
        { error: 'You already have an active pitch on this bounty.' },
        { status: 409 }
      );
    }

    const profile = auth.profile!;
    const now = new Date();

    const newClaim: Omit<BountyClaim, 'id'> = {
      bountyId: bounty.id,
      bountyTitle: bounty.data.title,
      claimantUid: auth.uid,
      claimantName: `${profile.firstName} ${profile.lastName}`.trim() || profile.displayName || 'Builder',
      claimantEmail: profile.email,
      claimantImage: profile.profileImage,
      pitchNote: pitchNote.trim().slice(0, 2000),
      proposedTimelineDays:
        typeof proposedTimelineDays === 'number' && proposedTimelineDays > 0
          ? Math.min(proposedTimelineDays, 365)
          : undefined,
      portfolioLinks: Array.isArray(portfolioLinks)
        ? portfolioLinks.map((s) => s.trim()).filter(Boolean).slice(0, 5)
        : [],
      status: 'pending',
      createdAt: now,
    };

    // Strip undefined so Firestore doesn't write empty fields
    const clean = Object.fromEntries(
      Object.entries(newClaim).filter(([, v]) => v !== undefined)
    ) as Omit<BountyClaim, 'id'>;

    const claimRef = await db.collection(COLLECTIONS.BOUNTY_CLAIMS).add(clean);

    // Bump the bounty's interest count so the public-facing "X interested"
    // pill stays accurate. applicantCount is the field on Bounty.
    await bounty.ref.update({
      applicantCount: (bounty.data.applicantCount || 0) + 1,
      updatedAt: now,
    } as Partial<Bounty>);

    // In-app notification to the poster. Email comes in 3f polish.
    const notification: Omit<Notification, 'id'> = {
      recipientUid: bounty.data.posterUid,
      type: 'application',
      title: 'New pitch on your bounty',
      body: `${newClaim.claimantName} pitched on "${bounty.data.title}".`,
      link: `/bounties/${bounty.data.slug}`,
      sourceUid: auth.uid,
      sourceName: newClaim.claimantName,
      referenceId: claimRef.id,
      read: false,
      createdAt: now,
    };
    await db.collection(COLLECTIONS.NOTIFICATIONS).add(notification);

    revalidatePath(`/bounties/${slug}`);

    return NextResponse.json({
      success: true,
      claim: { ...clean, id: claimRef.id, createdAt: now.toISOString() },
    });
  } catch (error) {
    console.error('Create claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
