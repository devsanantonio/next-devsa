import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { checkBotId } from 'botid/server';
import { getDb, COLLECTIONS, type AccessRequest } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from '@/lib/resend';
import {
  AccessRequestReceivedEmail,
  getAccessRequestReceivedSubject,
} from '@/lib/emails/access-request-received';
import {
  AccessRequestAlertEmail,
  AccessRequestDeclinedEmail,
  getAccessRequestAlertSubject,
  getAccessRequestDeclinedSubject,
} from '@/lib/emails/access-request-decision';
import { ALERT_EMAIL } from '@/lib/contact';

interface AccessRequestBody {
  name: string;
  email: string;
  communityOrg: string;
}

export async function POST(request: NextRequest) {
  try {
    const { isBot } = await checkBotId();
    if (isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body: AccessRequestBody = await request.json();
    const { name, email, communityOrg } = body;

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
      status: 'pending',
    };

    await db.collection(COLLECTIONS.ACCESS_REQUESTS).add(accessRequest);

    // Send confirmation email
    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalizedEmail,
          replyTo: EMAIL_REPLY_TO,
          subject: getAccessRequestReceivedSubject(communityOrg),
          html: AccessRequestReceivedEmail({ name, communityOrg }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }

      // And tell DEVSA, so it's approved while the person still cares. Get Involved
      // inquiries already alert ALERT_EMAIL; access requests used to wait until
      // someone happened to open the admin.
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: ALERT_EMAIL,
          replyTo: normalizedEmail,
          subject: getAccessRequestAlertSubject(name, communityOrg),
          html: AccessRequestAlertEmail({ name, email: normalizedEmail, communityOrg }),
        });
      } catch (alertError) {
        console.error('Failed to send access request alert:', alertError);
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

// Delete (reject) an access request - admin only. With `notify: true` the requester
// gets a short "not right now" email first: the "request received" email promises
// an answer either way, and a silent delete broke that promise.
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId } = body;
    const notify = body.notify === true;
    const adminEmail = await verifiedEmail(request);

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

    if (notify && isResendConfigured() && resend) {
      const req = requestDoc.data() as AccessRequest;
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: req.email,
          replyTo: EMAIL_REPLY_TO,
          subject: getAccessRequestDeclinedSubject(),
          html: AccessRequestDeclinedEmail({ name: req.name, communityOrg: req.communityOrg }),
        });
      } catch (emailError) {
        console.error('Failed to send decline email:', emailError);
      }
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
