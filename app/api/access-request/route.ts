import { NextRequest, NextResponse } from 'next/server';
import { MAGEN_THRESHOLDS } from '@/lib/magen';
import { getDb, COLLECTIONS, type AccessRequest } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { AccessRequestReceivedEmail } from '@/lib/emails/access-request-received';

interface AccessRequestBody {
  name: string;
  email: string;
  communityOrg: string;
  magenSessionId?: string;
  magenHumanScore?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AccessRequestBody = await request.json();
    const { name, email, communityOrg, magenSessionId, magenHumanScore } = body;

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

    // Check MAGEN human score (passed from frontend verification)
    // Frontend has already verified and rejected low scores, but double-check here
    const MAGEN_API_KEY = process.env.MAGEN_API_KEY;
    let humanScore: number | undefined = magenHumanScore;

    if (MAGEN_API_KEY && !MAGEN_API_KEY.includes('your_')) {
      // If we have a score from frontend, use it; otherwise it's undefined
      if (humanScore !== undefined && humanScore < MAGEN_THRESHOLDS.formSubmission) {
        return NextResponse.json(
          { error: 'Verification failed', reason: 'Low confidence score' },
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
      magenSessionId,
      magenHumanScore: humanScore ?? null,
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
