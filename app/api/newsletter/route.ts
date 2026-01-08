import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type NewsletterSubscription } from '@/lib/firebase-admin';
import { checkVerification, MAGEN_THRESHOLDS } from '@/lib/magen';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, magenSessionId } = body;

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

    // Verify MAGEN session if provided
    const MAGEN_API_KEY = process.env.MAGEN_API_KEY;
    let humanScore: number | undefined;

    if (magenSessionId && MAGEN_API_KEY && !MAGEN_API_KEY.includes('your_')) {
      const verification = await checkVerification(magenSessionId);

      if (verification.valid && verification.humanScore !== undefined) {
        if (verification.humanScore < MAGEN_THRESHOLDS.formSubmission) {
          return NextResponse.json(
            { error: 'Verification failed' },
            { status: 403 }
          );
        }
        humanScore = verification.humanScore;
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
        // Resubscribe
        await doc.ref.update({
          status: 'active',
          subscribedAt: new Date(),
          source,
          magenSessionId,
          magenHumanScore: humanScore,
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

    // Create new subscription
    const subscription: NewsletterSubscription = {
      email: normalizedEmail,
      subscribedAt: new Date(),
      source,
      magenSessionId,
      magenHumanScore: humanScore,
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
