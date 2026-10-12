import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getDb, COLLECTIONS, type DemoDayInquiry } from '@/lib/firebase-admin';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { FUNDER_CONTACT } from '@/lib/contact';
import { DEMO_DAY_INDUSTRIES, DEMO_DAY_INTEREST_VALUES } from '@/lib/demo-day';
import { DemoDayInquiryEmail, getDemoDayInquirySubject } from '@/lib/emails/demo-day-inquiry';

const INDUSTRY_NAMES: readonly string[] = [...DEMO_DAY_INDUSTRIES.map((i) => i.name), 'Other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? sanitizeInput(value.slice(0, max)) : '';

/**
 * Public: a partner or sponsor answering the Demo Day ask.
 *
 * Replaces the mailto links the page used to have, which did nothing for
 * anyone without a mail client set up — common on a work laptop, which is
 * exactly where a lead partner reads this. Gated like every public form here:
 * rate limit, then BotID (listed in instrumentation-client.ts), then
 * validation, then the write, then the notification — which is swallowed on
 * failure so a mail outage never costs someone their inquiry.
 *
 * Readable only by admins and super admins, through
 * /api/admin/demo-day-inquiries.
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
    const name = clean(body.name, 100);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
    const organization = clean(body.organization, 150);
    const title = clean(body.title, 120);
    const interest = typeof body.interest === 'string' ? body.interest : '';
    const industry = typeof body.industry === 'string' ? body.industry : '';
    const message = clean(body.message, 3000);

    if (!name || !email || !organization || !message) {
      return NextResponse.json({ error: 'Please fill in every required field.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 });
    }
    if (!DEMO_DAY_INTEREST_VALUES.includes(interest)) {
      return NextResponse.json({ error: 'Choose how you would like to be involved.' }, { status: 400 });
    }
    if (industry && !INDUSTRY_NAMES.includes(industry)) {
      return NextResponse.json({ error: 'Choose an industry from the list.' }, { status: 400 });
    }

    const inquiry: DemoDayInquiry = {
      name,
      email,
      organization,
      title: title || null,
      interest,
      industry: industry || null,
      message,
      submittedAt: new Date(),
      status: 'new',
    };

    const docRef = await getDb().collection(COLLECTIONS.DEMO_DAY_INQUIRIES).add(inquiry);

    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: FUNDER_CONTACT,
          replyTo: email,
          subject: getDemoDayInquirySubject({ interest, organization }),
          html: DemoDayInquiryEmail(inquiry),
        });
      } catch (notifyError) {
        console.error('Failed to send Demo Day inquiry notification:', notifyError);
      }
    }

    return NextResponse.json({ success: true, recordId: docRef.id });
  } catch (error) {
    console.error('Demo Day inquiry error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
