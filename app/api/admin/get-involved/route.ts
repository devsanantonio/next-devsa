import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { isAdminRole } from '@/lib/admin-roles';
import { FieldValue } from 'firebase-admin/firestore';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { logActivity } from '@/lib/activity-log';
import { plainText } from '@/lib/speaker-calls';
import { GetInvolvedReplyEmail } from '@/lib/emails/get-involved-reply';
import { httpUrl } from '@/lib/safe-url';

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
  if (!isAdminRole(adminData.role)) return null;
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
        replies: (data.replies ?? []).map((r: { at?: FirebaseFirestore.Timestamp }) => ({
          ...r,
          at: r.at?.toDate?.()?.toISOString() ?? null,
        })),
      };
    });
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Get Involved inquiries fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const REPLY_LIMITS = { subject: 160, message: 5000, ctaLabel: 60 } as const;

// The form stores text through sanitizeInput, which encodes entities ("R&amp;D").
// The email escapes what it shows, so decode first or the quote reads "&amp;".
const decodeEntities = (text: string) =>
  text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&');

/*
 * POST { inquiryId, subject, message, ctaLabel?, ctaUrl?, test? } — reply to an
 * inquiry by email. The message is markdown from the admin's RichTextEditor; the
 * optional button needs both a label and an http(s) link.
 *
 * Sent from DEVSA's address in the branded shell (lib/emails/get-involved-reply.ts),
 * with reply-to set to the admin who wrote it, so the person's answer reaches a
 * person. `test: true` sends the same email to that admin instead and saves
 * nothing. A real reply is kept on the inquiry (`replies`), moves a new inquiry
 * to contacted, and is logged in Activity.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminEmail = await verifiedEmail(request);
    const db = getDb();
    if (!adminEmail || !(await verifyAdmin(db, adminEmail))) return forbidden();

    const inquiryId = typeof body.inquiryId === 'string' ? body.inquiryId : '';
    const subject = plainText(body.subject, REPLY_LIMITS.subject);
    const message = plainText(body.message, REPLY_LIMITS.message);
    if (!inquiryId || !subject || !message) {
      return NextResponse.json({ error: 'Add a subject and a message' }, { status: 400 });
    }
    const ctaLabel = plainText(body.ctaLabel, REPLY_LIMITS.ctaLabel);
    const ctaUrl = httpUrl(body.ctaUrl);
    if (ctaUrl === undefined) {
      return NextResponse.json({ error: 'The button link must start with http:// or https://' }, { status: 400 });
    }
    if (!!ctaLabel !== !!ctaUrl) {
      return NextResponse.json({ error: 'A button needs both its text and a link' }, { status: 400 });
    }
    const cta = ctaLabel && ctaUrl ? { label: ctaLabel, url: ctaUrl } : null;
    if (!isResendConfigured() || !resend) {
      return NextResponse.json({ error: 'Email is not configured' }, { status: 503 });
    }

    const ref = db.collection(COLLECTIONS.GET_INVOLVED_INQUIRIES).doc(inquiryId);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    const inquiry = doc.data() as { email: string; name?: string; organization?: string | null; message?: string; status?: string; submittedAt?: FirebaseFirestore.Timestamp };
    const test = body.test === true;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: test ? adminEmail : inquiry.email,
      replyTo: adminEmail,
      subject: test ? `[Test] ${subject}` : subject,
      html: GetInvolvedReplyEmail({ message, cta, original: decodeEntities(inquiry.message ?? ''), sentAt: inquiry.submittedAt?.toDate?.() ?? null }),
    });
    if (error) {
      console.error('Get Involved reply send error:', error);
      return NextResponse.json({ error: 'The email could not be sent' }, { status: 502 });
    }
    if (test) return NextResponse.json({ success: true, test: true, to: adminEmail });

    const reply = { at: new Date(), by: adminEmail, subject, message, cta };
    await ref.update({
      replies: FieldValue.arrayUnion(reply),
      ...(inquiry.status === 'new' ? { status: 'contacted' } : {}),
    });
    await logActivity({
      actor: adminEmail,
      action: 'sent',
      kind: 'inquiry',
      targetId: inquiryId,
      label: inquiry.organization || inquiry.name || inquiry.email,
      detail: subject,
    });
    return NextResponse.json({
      success: true,
      reply: { ...reply, at: reply.at.toISOString() },
      status: inquiry.status === 'new' ? 'contacted' : inquiry.status,
    });
  } catch (error) {
    console.error('Get Involved reply error:', error);
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
