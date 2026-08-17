import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, byDisplayOrder, type Orderable, type Partner, type ApprovedAdmin } from '@/lib/firebase-admin';

// Only admins/superadmins may create, edit, or delete partners.
async function requireAdmin(db: FirebaseFirestore.Firestore, adminEmail: string) {
  const adminQuery = await db
    .collection(COLLECTIONS.APPROVED_ADMINS)
    .where('email', '==', adminEmail.toLowerCase())
    .limit(1)
    .get();

  if (adminQuery.empty) return { ok: false as const, status: 403, error: 'Unauthorized - admin access required' };

  const adminData = adminQuery.docs[0].data() as ApprovedAdmin;
  if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
    return { ok: false as const, status: 403, error: 'Unauthorized - only admins can manage partners' };
  }
  return { ok: true as const };
}

// GET - Fetch all partners (public)
export async function GET() {
  try {
    const db = getDb();

    // No Firestore orderBy — see byDisplayOrder.
    const partnersSnapshot = await db
      .collection(COLLECTIONS.PARTNERS)
      .get();

    const partners: Orderable[] = partnersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    partners.sort(byDisplayOrder);

    return NextResponse.json({ partners, source: 'firestore' });
  } catch (error) {
    console.error('Partners fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

// POST - Create a new partner (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, logo, description, website, video, isEasterEgg, adminEmail } = body;

    if (!id || !name || !logo || !description || !adminEmail) {
      return NextResponse.json(
        { error: 'ID, name, logo, description, and adminEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const auth = await requireAdmin(db, adminEmail);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const existingDoc = await db.collection(COLLECTIONS.PARTNERS).doc(id).get();
    if (existingDoc.exists) {
      return NextResponse.json({ error: 'Partner with this ID already exists' }, { status: 409 });
    }

    const partner: Partner = {
      id,
      name,
      logo,
      description,
      ...(website && { website }),
      ...(video && { video }),
      ...(typeof isEasterEgg === 'boolean' && { isEasterEgg }),
      createdAt: new Date(),
    };

    await db.collection(COLLECTIONS.PARTNERS).doc(id).set(partner);

    return NextResponse.json({ success: true, message: 'Partner created successfully', partner });
  } catch (error) {
    console.error('Create partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a partner (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, logo, description, website, video, isEasterEgg, adminEmail } = body;

    if (!id || !adminEmail) {
      return NextResponse.json({ error: 'Partner ID and adminEmail are required' }, { status: 400 });
    }

    const db = getDb();
    const auth = await requireAdmin(db, adminEmail);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const partnerRef = db.collection(COLLECTIONS.PARTNERS).doc(id);
    const partnerDoc = await partnerRef.get();
    if (!partnerDoc.exists) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const updates: Partial<Partner> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (logo !== undefined) updates.logo = logo;
    if (description !== undefined) updates.description = description;
    if (website !== undefined) updates.website = website || undefined;
    if (video !== undefined) updates.video = video || undefined;
    if (typeof isEasterEgg === 'boolean') updates.isEasterEgg = isEasterEgg;

    await partnerRef.update(updates);

    return NextResponse.json({ success: true, message: 'Partner updated successfully' });
  } catch (error) {
    console.error('Update partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a partner (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, adminEmail } = body;

    if (!id || !adminEmail) {
      return NextResponse.json({ error: 'Partner ID and adminEmail are required' }, { status: 400 });
    }

    const db = getDb();
    const auth = await requireAdmin(db, adminEmail);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const partnerRef = db.collection(COLLECTIONS.PARTNERS).doc(id);
    const partnerDoc = await partnerRef.get();
    if (!partnerDoc.exists) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    await partnerRef.delete();

    return NextResponse.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Delete partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH — persist a new display order (admin only).
 *
 * Takes the full list of ids in their intended order and writes `order: index`
 * across them in one batch. The whole list rather than a moved id and a target
 * index, because a partial update leaves the rest of the collection holding
 * stale indices and two admins reordering at once would interleave into
 * nonsense. One write, one complete picture.
 *
 * Admin-only even where the resource has an organizer branch elsewhere:
 * ordering is a site-wide presentation decision, not something scoped to the
 * community whose row is being dragged.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderedIds, adminEmail } = body as { orderedIds?: unknown; adminEmail?: string };

    if (!Array.isArray(orderedIds) || !orderedIds.every((id) => typeof id === 'string')) {
      return NextResponse.json({ error: 'orderedIds must be an array of ids' }, { status: 400 });
    }
    if (!adminEmail) {
      return NextResponse.json({ error: 'adminEmail is required' }, { status: 400 });
    }

    const db = getDb();

    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;
    if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can reorder' },
        { status: 403 }
      );
    }

    const batch = db.batch();
    orderedIds.forEach((id, index) => {
      batch.update(db.collection(COLLECTIONS.PARTNERS).doc(id), { order: index, updatedAt: new Date() });
    });
    await batch.commit();

    return NextResponse.json({ success: true, count: orderedIds.length });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}
