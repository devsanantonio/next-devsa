import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type Bounty } from '@/lib/firebase-admin';

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  const v = value as { toDate?: () => Date };
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return undefined;
}

// GET - Fetch a single bounty by slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.BOUNTIES)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as Omit<Bounty, 'id'>;

    const bounty = {
      ...data,
      id: doc.id,
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
      claimedAt: toIso(data.claimedAt),
      completedAt: toIso(data.completedAt),
      deadlineAt: toIso(data.deadlineAt),
      expiresAt: toIso(data.expiresAt),
    };

    return NextResponse.json({ bounty });
  } catch (error) {
    console.error('Get bounty by slug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
