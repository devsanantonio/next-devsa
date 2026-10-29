import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { verifyUnsubscribe } from '@/lib/newsletter';

/**
 * POST — unsubscribe the address a signed link names (lib/newsletter.ts).
 *
 * Two callers: the button on /newsletter/unsubscribe (a form post, answered
 * with a redirect back to that page), and mail apps' one-click unsubscribe
 * (RFC 8058: a POST to the List-Unsubscribe URL with the token in the query).
 *
 * No BotID: mail providers send the one-click POST from their own servers,
 * which would never pass it. The signature is the permission, and the worst a
 * replayed link can do is unsubscribe the person it was sent to.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const e = request.nextUrl.searchParams.get('e') ?? (form?.get('e') as string | null);
  const t = request.nextUrl.searchParams.get('t') ?? (form?.get('t') as string | null);
  const fromPage = form?.get('from') === 'page';

  const email = verifyUnsubscribe(e, t);
  if (!email) {
    return fromPage
      ? NextResponse.redirect(new URL('/newsletter/unsubscribe?invalid=1', request.url), 303)
      : NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 });
  }

  try {
    const snap = await getDb().collection(COLLECTIONS.NEWSLETTER).where('email', '==', email).get();
    await Promise.all(snap.docs.map((d) => d.ref.update({ status: 'unsubscribed', unsubscribedAt: new Date() })));
  } catch (error) {
    console.error('Unsubscribe failed:', error);
    return fromPage
      ? NextResponse.redirect(new URL('/newsletter/unsubscribe?failed=1', request.url), 303)
      : NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return fromPage
    ? NextResponse.redirect(new URL('/newsletter/unsubscribe?done=1', request.url), 303)
    : NextResponse.json({ success: true });
}
