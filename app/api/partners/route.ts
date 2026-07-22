import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type Partner, type ApprovedAdmin } from '@/lib/firebase-admin';

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

    const partnersSnapshot = await db
      .collection(COLLECTIONS.PARTNERS)
      .orderBy('name')
      .get();

    const partners = partnersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

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
