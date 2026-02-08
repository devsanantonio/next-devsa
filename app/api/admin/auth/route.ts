import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, SUPER_ADMIN_EMAIL, type ApprovedAdmin, type AccessRequest } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { AccessApprovedEmail } from '@/lib/emails/access-approved';

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
      firstName: adminData.firstName || null,
      lastName: adminData.lastName || null,
      profileImage: adminData.profileImage || null,
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

    // Check if approver is an admin or superadmin
    const approverQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', approverEmail.toLowerCase())
      .limit(1)
      .get();

    if (approverQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can add new admins' },
        { status: 403 }
      );
    }

    const approverData = approverQuery.docs[0].data() as ApprovedAdmin;
    if (approverData.role !== 'admin' && approverData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can add new admins' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Protect super admin from having their role changed
    if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot modify super admin account' },
        { status: 403 }
      );
    }

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

    // Create new approved admin (filter out undefined values for Firestore)
    const approvedAdmin: ApprovedAdmin = {
      email: normalizedEmail,
      approvedAt: new Date(),
      approvedBy: approverEmail,
      role,
      ...(communityId && { communityId }),
    };

    await db.collection(COLLECTIONS.APPROVED_ADMINS).add(approvedAdmin);

    // Update access request status if exists and get user info for email
    const accessRequestQuery = await db
      .collection(COLLECTIONS.ACCESS_REQUESTS)
      .where('email', '==', normalizedEmail)
      .get();

    let userName: string | undefined;
    let userCommunityOrg: string | undefined;

    for (const doc of accessRequestQuery.docs) {
      const requestData = doc.data() as AccessRequest;
      userName = requestData.name;
      userCommunityOrg = requestData.communityOrg;
      await doc.ref.update({ status: 'approved' });
    }

    // Send approval notification email
    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalizedEmail,
          subject: "You're Approved! Welcome to DEVSA 🎉",
          html: AccessApprovedEmail({
            name: userName,
            email: normalizedEmail,
            communityOrg: userCommunityOrg,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Don't fail the request if email fails
      }
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

    // Check if approver is an admin or superadmin
    const approverQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', approverEmail.toLowerCase())
      .limit(1)
      .get();

    if (approverQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can remove admins' },
        { status: 403 }
      );
    }

    const approverData = approverQuery.docs[0].data() as ApprovedAdmin;
    if (approverData.role !== 'admin' && approverData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can remove admins' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Protect super admin from being removed
    if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot remove super admin account' },
        { status: 403 }
      );
    }

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

// Update admin profile (firstName, lastName, profileImage)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, profileImage } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase();

    // Find the admin record
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

    // Update profile fields
    const updateData: Partial<ApprovedAdmin> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    await adminQuery.docs[0].ref.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      firstName: firstName || null,
      lastName: lastName || null,
      profileImage: profileImage || null,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
