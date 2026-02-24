import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';

// Helper to verify admin access
async function verifyAdmin(db: FirebaseFirestore.Firestore, email: string) {
  const adminQuery = await db
    .collection(COLLECTIONS.APPROVED_ADMINS)
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (adminQuery.empty) return null;

  const adminData = adminQuery.docs[0].data();
  if (adminData.role !== 'admin' && adminData.role !== 'superadmin') return null;

  return adminData;
}

// GET - Fetch all DevSA subscribers
export async function GET(request: NextRequest) {
  try {
    const adminEmail = request.nextUrl.searchParams.get('adminEmail');

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email is required' }, { status: 400 });
    }

    const db = getDb();
    const admin = await verifyAdmin(db, adminEmail);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    }

    const snapshot = await db.collection(COLLECTIONS.DEVSA_SUBSCRIBERS).get();
    const subscribers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('DevSA subscribers fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a subscriber
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, subscriberId, name, email } = body;

    if (!adminEmail || !subscriberId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const admin = await verifyAdmin(db, adminEmail);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof name === 'string') updateData.name = name;
    if (typeof email === 'string') updateData.email = email;

    await db.collection(COLLECTIONS.DEVSA_SUBSCRIBERS).doc(subscriberId).update(updateData);

    return NextResponse.json({ success: true, message: 'Subscriber updated' });
  } catch (error) {
    console.error('DevSA subscriber update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a subscriber
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, subscriberId } = body;

    if (!adminEmail || !subscriberId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const admin = await verifyAdmin(db, adminEmail);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    }

    await db.collection(COLLECTIONS.DEVSA_SUBSCRIBERS).doc(subscriberId).delete();

    return NextResponse.json({ success: true, message: 'Subscriber deleted' });
  } catch (error) {
    console.error('DevSA subscriber delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
