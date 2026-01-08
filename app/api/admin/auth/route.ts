import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type ApprovedAdmin } from '@/lib/firebase-admin';

// Check if user is an approved admin
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const db = getDb();

    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json({
        isAdmin: false,
      });
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;

    return NextResponse.json({
      isAdmin: true,
      role: adminData.role,
      communityId: adminData.communityId,
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add a new approved admin (requires existing admin auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, communityId, approverEmail } = body;

    if (!email || !role || !approverEmail) {
      return NextResponse.json(
        { error: 'Email, role, and approverEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if approver is an admin
    const approverQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', approverEmail.toLowerCase())
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (approverQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can add new admins' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if already exists
    const existingQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      // Update existing
      await existingQuery.docs[0].ref.update({
        role,
        communityId,
        approvedAt: new Date(),
        approvedBy: approverEmail,
      });
      return NextResponse.json({
        success: true,
        message: 'Admin updated successfully',
      });
    }

    // Create new approved admin
    const approvedAdmin: ApprovedAdmin = {
      email: normalizedEmail,
      approvedAt: new Date(),
      approvedBy: approverEmail,
      role,
      communityId,
    };

    await db.collection(COLLECTIONS.APPROVED_ADMINS).add(approvedAdmin);

    // Update access request status if exists
    const accessRequestQuery = await db
      .collection(COLLECTIONS.ACCESS_REQUESTS)
      .where('email', '==', normalizedEmail)
      .get();

    for (const doc of accessRequestQuery.docs) {
      await doc.ref.update({ status: 'approved' });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin added successfully',
    });
  } catch (error) {
    console.error('Add admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove an admin
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, approverEmail } = body;

    if (!email || !approverEmail) {
      return NextResponse.json(
        { error: 'Email and approverEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if approver is an admin
    const approverQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', approverEmail.toLowerCase())
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (approverQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can remove admins' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Find and delete
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    await adminQuery.docs[0].ref.delete();

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully',
    });
  } catch (error) {
    console.error('Remove admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
