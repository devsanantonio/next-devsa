import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type ApprovedAdmin } from '@/lib/firebase-admin';

// This endpoint is used to seed the first admin user
// It should only work when there are no admins in the system
// After the first admin is created, this endpoint will be disabled
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secret } = body;

    // Require a secret key to prevent unauthorized access
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (!setupSecret || secret !== setupSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if any admins already exist
    const existingAdmins = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .limit(1)
      .get();

    if (!existingAdmins.empty) {
      return NextResponse.json(
        { error: 'Setup already completed. Admin already exists.' },
        { status: 400 }
      );
    }

    // Create the first admin
    const firstAdmin: ApprovedAdmin = {
      email: email.toLowerCase(),
      approvedAt: new Date(),
      approvedBy: 'system',
      role: 'admin',
    };

    await db.collection(COLLECTIONS.APPROVED_ADMINS).add(firstAdmin);

    return NextResponse.json({
      success: true,
      message: `First admin created: ${email}`,
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
