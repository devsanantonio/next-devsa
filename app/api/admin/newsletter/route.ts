import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from '@/lib/resend';
import { newsletterConfig, unsubscribeApiUrl, unsubscribePageUrl } from '@/lib/newsletter';
import { NewsletterEmail } from '@/lib/emails/newsletter';
import { logActivity } from '@/lib/activity-log';

/**
 * The Newsletter tab's composer. Admins and super admins only.
 *
 *   GET   → whether sending is set up, how many are active, and past sends
 *   POST  { subject, body, test: true }               → to the sender alone, marked [Test]
 *   POST  { subject, body, test: false, expected: n }  → to every active subscriber
 *
 * `expected` must equal the active count right now: the composer shows the
 * number on the button, so a list that changed under the sender, or a
 * double-click, doesn't send something other than what they agreed to. A send
 * also refuses while another is in progress.
 */
async function requireAdmin(request: NextRequest) {
  const email = await verifiedEmail(request);
  if (!email) return { error: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) };
  const q = await getDb().collection(COLLECTIONS.APPROVED_ADMINS).where('email', '==', email).limit(1).get();
  const role = q.empty ? null : q.docs[0].data().role;
  if (role !== 'admin' && role !== 'superadmin') {
    return { error: NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 }) };
  }
  return { email };
}

async function activeSubscribers(): Promise<string[]> {
  const snap = await getDb().collection(COLLECTIONS.NEWSLETTER).where('status', '==', 'active').get();
  return [...new Set(snap.docs.map((d) => String(d.data().email || '').trim().toLowerCase()).filter(Boolean))];
}

const iso = (v: unknown) => (v as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? null;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const config = newsletterConfig();
  const [active, sends] = await Promise.all([
    activeSubscribers(),
    getDb().collection(COLLECTIONS.NEWSLETTER_SENDS).orderBy('at', 'desc').limit(10).get(),
  ]);
  return NextResponse.json({
    ready: config.ready && isResendConfigured(),
    missing: [...config.missing, ...(isResendConfigured() ? [] : ['RESEND_API_KEY'])],
    postalAddress: config.postalAddress,
    active: active.length,
    sends: sends.docs.map((d) => ({ id: d.id, ...d.data(), at: iso(d.data().at) })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    const config = newsletterConfig();
    if (!config.ready || !isResendConfigured() || !resend) {
      return NextResponse.json({ error: `Sending is locked until these are set in Vercel: ${config.missing.join(', ') || 'RESEND_API_KEY'}` }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const subject = typeof body.subject === 'string' ? body.subject.replace(/\s+/g, ' ').trim().slice(0, 150) : '';
    const text = typeof body.body === 'string' ? body.body.trim().slice(0, 20000) : '';
    if (!subject || !text) return NextResponse.json({ error: 'A subject and a message are both needed' }, { status: 400 });

    const build = (to: string, test = false) => ({
      from: EMAIL_FROM,
      to,
      replyTo: EMAIL_REPLY_TO,
      subject: test ? `[Test] ${subject}` : subject,
      html: NewsletterEmail({ subject, body: text, unsubscribeUrl: unsubscribePageUrl(to), postalAddress: config.postalAddress! }),
      headers: {
        'List-Unsubscribe': `<${unsubscribeApiUrl(to)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    if (body.test === true) {
      const { error } = await resend.emails.send(build(auth.email!, true));
      if (error) throw error;
      return NextResponse.json({ success: true, test: true, to: auth.email });
    }

    const recipients = await activeSubscribers();
    if (body.expected !== recipients.length) {
      return NextResponse.json(
        { error: `The list now has ${recipients.length} active subscribers, not ${body.expected}. Check the number and send again.`, active: recipients.length },
        { status: 409 }
      );
    }

    // One send at a time, claimed in a transaction so two admins (or two clicks) can't both start one.
    const db = getDb();
    const sendRef = db.collection(COLLECTIONS.NEWSLETTER_SENDS).doc();
    const claimed = await db.runTransaction(async (tx) => {
      const busy = await tx.get(db.collection(COLLECTIONS.NEWSLETTER_SENDS).where('status', '==', 'sending').limit(1));
      const stale = busy.docs.every((d) => Date.now() - (d.data().at?.toDate?.()?.getTime() ?? 0) > 10 * 60 * 1000);
      if (!busy.empty && !stale) return false;
      tx.create(sendRef, { at: new Date(), by: auth.email, subject, total: recipients.length, sent: 0, failed: 0, status: 'sending' });
      return true;
    });
    if (!claimed) return NextResponse.json({ error: 'Another newsletter is sending right now' }, { status: 409 });

    let sent = 0;
    let failed = 0;
    for (let i = 0; i < recipients.length; i += 100) {
      const chunk = recipients.slice(i, i + 100);
      try {
        const { error } = await resend.batch.send(chunk.map((to) => build(to)));
        if (error) throw error;
        sent += chunk.length;
      } catch (err) {
        failed += chunk.length;
        console.error('Newsletter batch failed:', err);
      }
    }
    await sendRef.update({ sent, failed, status: 'sent', finishedAt: new Date() });
    await logActivity({ actor: auth.email!, action: 'sent', kind: 'newsletter', targetId: sendRef.id, label: subject, detail: `sent to ${sent} of ${recipients.length}${failed ? `, ${failed} failed` : ''}` });

    return NextResponse.json({ success: true, sent, failed, total: recipients.length });
  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
