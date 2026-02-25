import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type JobListing } from '@/lib/firebase-admin';

// GET - Fetch a single job listing by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.JOB_LISTINGS)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Job listing not found' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as Omit<JobListing, 'id'>;

    const listing = {
      ...data,
      id: doc.id,
      createdAt: (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: (data.updatedAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
      expiresAt: (data as Record<string, unknown>).expiresAt
        ? ((data as Record<string, unknown>).expiresAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString()
        : undefined,
    };

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Get listing by slug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
