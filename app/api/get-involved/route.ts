import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getDb, COLLECTIONS, type GetInvolvedInquiry } from '@/lib/firebase-admin';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { ALERT_EMAIL } from '@/lib/contact';
import { GET_INVOLVED_PATH_KEYS, PARTNER_WAY_KEYS } from '@/lib/get-involved';
import { GetInvolvedInquiryEmail, getGetInvolvedSubject } from '@/lib/emails/get-involved-inquiry';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? sanitizeInput(value.slice(0, max)) : '';

/**
 * Public: the Get Involved form on /buildingtogether — a partner or a question.
 *
 * Replaces the mailto button on /buildingtogether, which addressed a
 * forwarding inbox that has dropped mail and did nothing for anyone without a
 * mail client set up. Gated like every public form here: rate limit, BotID
 * (listed in instrumentation-client.ts), validation, the write, then the
 * alert — swallowed on failure so a mail outage never costs an inquiry.
 *
 * Readable only by admins and super admins, through /api/admin/get-involved.
 */
export async function POST(request: NextRequest) {
  const limit = rateLimit(getClientIp(request), 5, 60_000);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  try {
    const { isBot } = await checkBotId();
    if (isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const path = typeof body.path === 'string' ? body.path : '';
    const way = typeof body.way === 'string' ? body.way : '';
    const name = clean(body.name, 100);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
    const organization = clean(body.organization, 150);
    const title = clean(body.title, 120);
    // Kept for records sent before sponsoring moved to the donation form.
    const event = clean(body.event, 200);
    const subject = clean(body.subject, 150);
    const message = clean(body.message, 3000);

    if (!GET_INVOLVED_PATH_KEYS.includes(path)) {
      return NextResponse.json({ error: 'Choose what brings you here.' }, { status: 400 });
    }
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please fill in every required field.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 });
    }
    if (path === 'partner' && !organization) {
      return NextResponse.json({ error: 'Tell us which organization you are with.' }, { status: 400 });
    }
    if (path === 'partner' && !PARTNER_WAY_KEYS.includes(way)) {
      return NextResponse.json({ error: 'Choose the way you would like to work with DEVSA.' }, { status: 400 });
    }

    const inquiry: GetInvolvedInquiry = {
      path,
      way: path === 'partner' ? way : null,
      name,
      email,
      organization: organization || null,
      title: title || null,
      event: event || null,
      subject: path === 'general' && subject ? subject : null,
      message,
      submittedAt: new Date(),
      status: 'new',
    };

    const docRef = await getDb().collection(COLLECTIONS.GET_INVOLVED_INQUIRIES).add(inquiry);

    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: ALERT_EMAIL,
          replyTo: email,
          subject: getGetInvolvedSubject(inquiry),
          html: GetInvolvedInquiryEmail(inquiry),
        });
      } catch (notifyError) {
        console.error('Failed to send Get Involved notification:', notifyError);
      }
    }

    return NextResponse.json({ success: true, recordId: docRef.id });
  } catch (error) {
    console.error('Get Involved inquiry error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
