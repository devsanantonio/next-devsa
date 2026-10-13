import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';

/**
 * /get-involved inquiries for the admin portal. Admin and super admin only.
 *
 * Organizers are refused outright, not scoped: an inquiry belongs to no
 * community, and it carries a prospective partner's contact details. Every
 * method checks the role server-side; hiding the tab in the dashboard is the
 * convenience, this is the control.
 */
async function verifyAdmin(db: FirebaseFirestore.Firestore, email: string | null) {
  if (!email) return null;
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

const forbidden = () =>
  NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });

const STATUSES = ['new', 'contacted', 'closed'] as const;

// GET ?adminEmail= — every inquiry, newest first
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    if (!(await verifyAdmin(db, await verifiedEmail(request)))) return forbidden();

    const snapshot = await db
      .collection(COLLECTIONS.GET_INVOLVED_INQUIRIES)
      .orderBy('submittedAt', 'desc')
      .get();
    const inquiries = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() ?? null,
      };
    });
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Get Involved inquiries fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH { adminEmail, inquiryId, status } — move an inquiry along
export async function PATCH(request: NextRequest) {
  try {
    const { inquiryId, status } = await request.json();
    const adminEmail = await verifiedEmail(request);
    const db = getDb();
    if (!(await verifyAdmin(db, adminEmail))) return forbidden();
    if (!inquiryId || !STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    const ref = db.collection(COLLECTIONS.GET_INVOLVED_INQUIRIES).doc(inquiryId);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    await ref.update({ status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Get Involved inquiry update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE { adminEmail, inquiryId }
export async function DELETE(request: NextRequest) {
  try {
    const { inquiryId } = await request.json();
    const adminEmail = await verifiedEmail(request);
    const db = getDb();
    if (!(await verifyAdmin(db, adminEmail))) return forbidden();
    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const ref = db.collection(COLLECTIONS.GET_INVOLVED_INQUIRIES).doc(inquiryId);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Get Involved inquiry delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
