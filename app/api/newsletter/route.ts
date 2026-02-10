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

    // Server-side MAGEN verification (log-only mode until client SDK collects behavioral signals)
    if (isMagenConfigured() && magenSessionId) {
      const result = await verifySession(magenSessionId);
      console.log('[MAGEN] Newsletter verification:', { session_id: magenSessionId, verdict: result.verdict, score: result.score, is_human: result.is_human });
      // TODO: Enable blocking once MAGEN client SDK sends behavioral events
      // if (result.success && shouldBlock(result)) {
      //   return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
      // }
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

// Delete a newsletter subscription (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, adminEmail } = body;

    if (!subscriptionId || !adminEmail) {
      return NextResponse.json(
        { error: 'Subscription ID and admin email are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify admin permissions
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
    if (adminData.role !== 'superadmin' && adminData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - admin or superadmin role required' },
        { status: 403 }
      );
    }

    // Delete the subscription
    await db.collection(COLLECTIONS.NEWSLETTER).doc(subscriptionId).delete();

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error) {
    console.error('Newsletter deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
