import { NextRequest, NextResponse } from 'next/server';
import { isMagenConfigured, verifySession, shouldBlock } from '@/lib/magen';
import { getDb, COLLECTIONS, type AccessRequest } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { AccessRequestReceivedEmail } from '@/lib/emails/access-request-received';

interface AccessRequestBody {
  name: string;
  email: string;
  communityOrg: string;
  magenSessionId?: string;
  magenVerdict?: string;
  magenScore?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AccessRequestBody = await request.json();
    const { name, email, communityOrg, magenSessionId, magenVerdict, magenScore } = body;

    // Validate required fields
    if (!name || !email || !communityOrg) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and community organization are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Server-side MAGEN re-verification
    if (isMagenConfigured() && magenSessionId) {
      const result = await verifySession(magenSessionId);
      if (result.success && shouldBlock(result)) {
        return NextResponse.json(
          { error: 'Verification failed', reason: 'Unverified traffic' },
          { status: 403 }
        );
      }
    }

    const normalizedEmail = email.toLowerCase();
    const db = getDb();

    // Check if already requested
    const existingQuery = await db
      .collection(COLLECTIONS.ACCESS_REQUESTS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      const existingRequest = existingQuery.docs[0].data() as AccessRequest;
      if (existingRequest.status === 'pending') {
        return NextResponse.json({
          success: true,
          message: 'Access request already pending',
        });
      }
      if (existingRequest.status === 'approved') {
        return NextResponse.json({
          success: true,
          message: 'You already have access',
        });
      }
    }

    // Check if already approved as admin
    const approvedQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (!approvedQuery.empty) {
      return NextResponse.json({
        success: true,
        message: 'You already have admin access',
      });
    }

    // Create access request (filter out undefined values for Firestore)
    const accessRequest: AccessRequest = {
      name,
      email: normalizedEmail,
      communityOrg,
      submittedAt: new Date(),
      magenSessionId: magenSessionId ?? null,
      magenVerdict: magenVerdict ?? null,
      magenScore: magenScore ?? null,
      status: 'pending',
    };

    await db.collection(COLLECTIONS.ACCESS_REQUESTS).add(accessRequest);

    // Send confirmation email
    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalizedEmail,
          subject: 'Access Request Received - DEVSA',
          html: AccessRequestReceivedEmail({ name, communityOrg }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Access request submitted successfully. You will be notified when approved.',
    });
  } catch (error) {
    console.error('Access request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete (reject) an access request - admin only
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, adminEmail } = body;

    if (!requestId || !adminEmail) {
      return NextResponse.json(
        { error: 'Request ID and admin email are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify admin has proper permissions
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data();
    if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can reject access requests' },
        { status: 403 }
      );
    }

    // Delete the access request
    const requestRef = db.collection(COLLECTIONS.ACCESS_REQUESTS).doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return NextResponse.json(
        { error: 'Access request not found' },
        { status: 404 }
      );
    }

    await requestRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Access request rejected and removed',
    });
  } catch (error) {
    console.error('Delete access request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
