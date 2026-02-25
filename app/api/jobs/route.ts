import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type JobListing } from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

// GET - List job listings (public, with optional filters)
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const locationType = searchParams.get('locationType');
    const tag = searchParams.get('tag');
    const status = searchParams.get('status') || 'published';
    const authorUid = searchParams.get('authorUid');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch all listings and filter in-memory to avoid Firestore composite index requirements
    const snapshot = await db.collection(COLLECTIONS.JOB_LISTINGS).get();

    let listings = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<JobListing, 'id'>;
      return {
        ...data,
        id: doc.id,
        createdAt: (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: (data.updatedAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
        expiresAt: (data.expiresAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.expiresAt,
      };
    });

    // Filter in-memory (avoids Firestore composite index requirements)
    if (authorUid) {
      listings = listings.filter(l => l.authorUid === authorUid);
    } else if (status !== 'all') {
      listings = listings.filter(l => l.status === status);
    }
    // status=all returns everything (for super admin overview)

    // Auto-expire published listings past their expiresAt date
    const now = new Date();
    listings = listings.map(l => {
      if (l.status === 'published' && l.expiresAt && new Date(l.expiresAt as unknown as string) < now) {
        return { ...l, status: 'expired' as const };
      }
      return l;
    });

    // For public view, exclude expired listings unless looking at own or all
    if (!authorUid && status === 'published') {
      listings = listings.filter(l => l.status === 'published');
    }
    if (type) {
      listings = listings.filter(l => l.type === type);
    }
    if (locationType) {
      listings = listings.filter(l => l.locationType === locationType);
    }
    if (tag) {
      listings = listings.filter(l => l.tags?.includes(tag));
    }

    // Sort by createdAt descending
    listings.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

    // Apply limit
    listings = listings.slice(0, limit);

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new job listing (hiring role only)
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true, requireRole: 'hiring' });
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const { title, type, locationType, location, salaryRange, description, requirements, tags, communityId, expiresInDays } = body;

    if (!title || !type || !locationType || !description) {
      return NextResponse.json(
        { error: 'Title, type, location type, and description are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date();

    // Default expiration: 60 days, or custom if provided (max 90 days)
    const daysUntilExpiry = Math.min(expiresInDays || 60, 90);
    const expiresAt = new Date(now.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36);

    const listing: Omit<JobListing, 'id'> = {
      authorUid: result.uid,
      authorName: `${result.profile!.firstName} ${result.profile!.lastName}`,
      companyName: result.profile!.companyName || '',
      companyLogo: result.profile!.companyLogo,
      title,
      slug,
      type,
      locationType,
      location: location || '',
      salaryRange: salaryRange || '',
      description,
      requirements: requirements || '',
      tags: tags || [],
      communityId: communityId || '',
      status: 'published',
      applicantCount: 0,
      expiresAt,
      createdAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.JOB_LISTINGS).add(listing);

    return NextResponse.json({
      success: true,
      message: 'Job listing created successfully',
      id: docRef.id,
      slug,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a job listing (owner only)
export async function PUT(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const { id, title, type, locationType, location, salaryRange, description, requirements, tags, status, expiresInDays } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.JOB_LISTINGS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listing = doc.data() as JobListing;
    if (listing.authorUid !== result.uid && !result.isSuperAdmin) {
      return NextResponse.json(
        { error: 'You can only edit your own listings' },
        { status: 403 }
      );
    }

    const updateData: Partial<JobListing> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (locationType !== undefined) updateData.locationType = locationType;
    if (location !== undefined) updateData.location = location;
    if (salaryRange !== undefined) updateData.salaryRange = salaryRange;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;
    // When re-publishing (e.g. from expired/closed), refresh the expiration
    if (expiresInDays !== undefined) {
      const days = Math.min(expiresInDays || 60, 90);
      updateData.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    } else if (status === 'published' && (listing.status === 'expired' || listing.status === 'closed' || listing.status === 'draft')) {
      // Auto-refresh expiration when re-publishing
      updateData.expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    }

    await docRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
    });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a job listing (owner or superadmin)
export async function DELETE(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.JOB_LISTINGS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listing = doc.data() as JobListing;

    if (listing.authorUid !== result.uid && !result.isSuperAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own listings' },
        { status: 403 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
