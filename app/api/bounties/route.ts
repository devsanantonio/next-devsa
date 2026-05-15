import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getDb,
  COLLECTIONS,
  type Bounty,
  type BountyCategory,
} from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

// Platform take rate: 8% of the bounty amount funds DEVSA programming.
const PLATFORM_FEE_BPS = 800; // 8.00%
const MIN_AMOUNT_CENTS = 5000; // $50 floor
const MAX_AMOUNT_CENTS = 1_000_000; // $10,000 ceiling for v1

function computeFeeSplit(amountCents: number) {
  const platformFeeCents = Math.floor((amountCents * PLATFORM_FEE_BPS) / 10_000);
  const payoutCents = amountCents - platformFeeCents;
  return { platformFeeCents, payoutCents };
}

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  const v = value as { toDate?: () => Date };
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return undefined;
}

function serializeBounty(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data() as Omit<Bounty, 'id'>;
  return {
    ...data,
    id: doc.id,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    claimedAt: toIso(data.claimedAt),
    completedAt: toIso(data.completedAt),
    deadlineAt: toIso(data.deadlineAt),
    expiresAt: toIso(data.expiresAt),
  };
}

// GET - List bounties (public)
// Supports filters: status, category, posterUid, claimantUid, limit
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'open';
    const category = searchParams.get('category');
    const posterUid = searchParams.get('posterUid');
    const claimantUid = searchParams.get('claimantUid');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    // Fetch all and filter in memory (avoids composite index requirements;
    // small collection in v1 so this is fine).
    const snapshot = await db.collection(COLLECTIONS.BOUNTIES).get();
    let bounties = snapshot.docs.map(serializeBounty);

    // Filter by author/claimant if requested
    if (posterUid) {
      bounties = bounties.filter((b) => b.posterUid === posterUid);
    } else if (claimantUid) {
      bounties = bounties.filter((b) => b.claimantUid === claimantUid);
    } else if (status !== 'all') {
      bounties = bounties.filter((b) => b.status === status);
    }

    if (category) {
      bounties = bounties.filter((b) => b.category === category);
    }

    // Public list hides non-public bounties unless the requester owns them
    if (!posterUid && !claimantUid) {
      bounties = bounties.filter((b) => b.isPublic !== false);
    }

    // Sort newest first
    bounties.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({ bounties: bounties.slice(0, limit) });
  } catch (error) {
    console.error('List bounties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new bounty (hiring role only — this is the "poster" side)
//
// NOTE: This slice does NOT enforce escrow funding. Bounties land in
// `pending_review` with `escrowStatus: 'unfunded'`. Slice 3 will add the
// Stripe Connect payment flow that moves the bounty to `open` only after
// funds are escrowed.
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, {
    requireProfile: true,
    requireRole: 'hiring',
  });
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const {
      title,
      summary,
      description,
      deliverables,
      category,
      tags,
      amountCents,
      estimatedHours,
      deadlineAt,
      orgName,
      orgLogo,
      status: requestedStatus,
    } = body as {
      title?: string;
      summary?: string;
      description?: string;
      deliverables?: string[];
      category?: BountyCategory;
      tags?: string[];
      amountCents?: number;
      estimatedHours?: number;
      deadlineAt?: string;
      orgName?: string;
      orgLogo?: string;
      status?: 'draft' | 'published';
    };

    // Required fields
    if (!title?.trim() || !summary?.trim() || !description?.trim() || !category || !orgName?.trim()) {
      return NextResponse.json(
        { error: 'Title, summary, description, category, and org name are required' },
        { status: 400 }
      );
    }

    const amount = Number(amountCents);
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT_CENTS || amount > MAX_AMOUNT_CENTS) {
      return NextResponse.json(
        { error: `Bounty amount must be between $${MIN_AMOUNT_CENTS / 100} and $${MAX_AMOUNT_CENTS / 100}` },
        { status: 400 }
      );
    }

    const { platformFeeCents, payoutCents } = computeFeeSplit(amount);

    const now = new Date();
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) +
      '-' +
      Date.now().toString(36);

    // 30-day expiry by default; only applies if the bounty remains "open"
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const bounty: Omit<Bounty, 'id'> = {
      posterUid: result.uid,
      posterName: `${result.profile!.firstName} ${result.profile!.lastName}`.trim(),
      posterImage: result.profile!.profileImage,
      orgName: orgName.trim(),
      orgLogo: orgLogo || result.profile!.companyLogo,
      orgVerifiedNonprofit: false, // admin sets this after 501(c)(3) verification
      title: title.trim(),
      slug,
      summary: summary.trim(),
      description,
      deliverables: Array.isArray(deliverables) ? deliverables.filter((d) => d?.trim()) : [],
      category,
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      amountCents: amount,
      platformFeeCents,
      payoutCents,
      currency: 'usd',
      escrowStatus: 'unfunded',
      estimatedHours: estimatedHours && Number.isFinite(estimatedHours) ? estimatedHours : undefined,
      deadlineAt: deadlineAt ? new Date(deadlineAt) : undefined,
      status: requestedStatus === 'draft' ? 'draft' : 'pending_review',
      isPublic: true,
      applicantCount: 0,
      createdAt: now,
      expiresAt,
    };

    // Strip undefined so we don't write empty fields
    const clean = Object.fromEntries(
      Object.entries(bounty).filter(([, v]) => v !== undefined)
    ) as Omit<Bounty, 'id'>;

    const docRef = await getDb().collection(COLLECTIONS.BOUNTIES).add(clean);

    revalidatePath('/bounties');

    return NextResponse.json({
      success: true,
      id: docRef.id,
      slug,
      status: clean.status,
    });
  } catch (error) {
    console.error('Create bounty error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
