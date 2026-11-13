import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { logActivity } from '@/lib/activity-log';
import { checkBotId } from 'botid/server';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
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
import { isAdminRole } from '@/lib/admin-roles';
import { sanitizeInput } from '@/lib/sanitize';

interface AccessRequestBody {
  name: string;
  email: string;
  communityOrg: string;
  groupLink?: string;
  groupAbout?: string;
}

// Caps on what the public types: all are stored, and the name and group go
// out in the confirmation email to whatever address was entered.
const MAX_LEN = { name: 100, email: 200, communityOrg: 120, groupLink: 300, groupAbout: 200 } as const;

/** An http(s) URL, with https:// added when it was typed bare; anything else is dropped. */
function cleanLink(raw: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/*
 * The one answer every submission gets, whatever the address's history. It used
 * to say "already pending", "you already have access" or "you already have admin
 * access", which let anyone check whether an address held portal access: the
 * shortlist for anyone trying to get into an organizer's account. The form shows
 * only success, so nothing a real person sees changes.
 */
const RECEIVED = () => NextResponse.json({ success: true, message: 'Access request received' });

export async function POST(request: NextRequest) {
  try {
    // Cheap local checks first, then the network calls. Each request sends an
    // email to the address entered and an alert to DEVSA, so it is rate limited
    // as well as bot-checked, like the other forms that send mail.
    const limit = rateLimit(`access-request:${getClientIp(request)}`, 5, 60_000);
    if (!limit.success) return rateLimitResponse(limit.resetMs);

    const { isBot } = await checkBotId();
    if (isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body: AccessRequestBody = await request.json();
    const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const name = text(body.name, MAX_LEN.name);
    const email = text(body.email, MAX_LEN.email);
    const communityOrg = text(body.communityOrg, MAX_LEN.communityOrg);
    // Only sent for a group that isn't listed yet. Plain text: the admin reads these
    // and may copy them into the group's directory entry.
    const groupLink = cleanLink(sanitizeInput(text(body.groupLink, MAX_LEN.groupLink)));
    const groupAbout = sanitizeInput(text(body.groupAbout, MAX_LEN.groupAbout)) || null;

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
      if (existingRequest.status === 'pending' || existingRequest.status === 'approved') {
        return RECEIVED();
      }
    }

    // Check if already approved as admin
    const approvedQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (!approvedQuery.empty) {
      return RECEIVED();
    }

    // Create access request (filter out undefined values for Firestore)
    const accessRequest: AccessRequest = {
      name,
      email: normalizedEmail,
      communityOrg,
      groupLink,
      groupAbout,
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
          html: AccessRequestAlertEmail({ name, email: normalizedEmail, communityOrg, groupLink, groupAbout }),
        });
      } catch (alertError) {
        console.error('Failed to send access request alert:', alertError);
      }
    }

    // The same answer as an address that already applied or already has access.
    return RECEIVED();
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
    if (!isAdminRole(adminData.role)) {
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
    await logActivity({
      actor: adminEmail.toLowerCase(),
      action: 'declined',
      kind: 'access',
      targetId: requestRef.id,
      label: (requestDoc.data() as AccessRequest).email,
      detail: notify ? 'told by email' : 'not emailed',
    });

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
