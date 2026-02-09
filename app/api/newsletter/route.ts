import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type NewsletterSubscription } from '@/lib/firebase-admin';
import { isMagenConfigured, verifySession, shouldBlock } from '@/lib/magen';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, magenSessionId, magenVerdict, magenScore } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

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
          { error: 'Verification failed' },
          { status: 403 }
        );
      }
    }

    const normalizedEmail = email.toLowerCase();

    // Check if already subscribed
    const db = getDb();
    const existingQuery = await db
      .collection(COLLECTIONS.NEWSLETTER)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      const doc = existingQuery.docs[0];
      const data = doc.data() as NewsletterSubscription;

      if (data.status === 'unsubscribed') {
        // Resubscribe (use null for undefined values for Firestore compatibility)
        await doc.ref.update({
          status: 'active',
          subscribedAt: new Date(),
          source: source ?? null,
          magenSessionId: magenSessionId ?? null,
          magenVerdict: magenVerdict ?? null,
          magenScore: magenScore ?? null,
        });
        return NextResponse.json({
          success: true,
          message: 'Resubscribed successfully',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Already subscribed',
      });
    }

    // Create new subscription (use null for undefined values for Firestore compatibility)
    const subscription: NewsletterSubscription = {
      email: normalizedEmail,
      subscribedAt: new Date(),
      source: source ?? null,
      magenSessionId: magenSessionId ?? null,
      magenVerdict: magenVerdict ?? null,
      magenScore: magenScore ?? null,
      status: 'active',
    };

    await db.collection(COLLECTIONS.NEWSLETTER).add(subscription);

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
