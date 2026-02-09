import { NextRequest, NextResponse } from 'next/server';
import { verifySession, isVerified, shouldBlock } from '@/lib/magen';

export async function POST(request: NextRequest) {
  console.log('[MAGEN API] /verify called');

  try {
    const body = await request.json();
    // Accept both session_id (from hook) and sessionId (camelCase)
    const sessionId = body.session_id || body.sessionId;
    console.log(`[MAGEN API]    sessionId: ${sessionId}`);

    if (!sessionId) {
      console.warn('[MAGEN API] ⚠️ No session_id provided');
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const result = await verifySession(sessionId);

    if (!result.success) {
      console.warn(`[MAGEN API] ⚠️ Verification failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    const response = {
      session_id: result.session_id,
      verdict: result.verdict,
      score: result.score,
      is_human: result.is_human,
      verified: isVerified(result),
      blocked: shouldBlock(result),
    };

    console.log('[MAGEN API] ✅ Verification response:', JSON.stringify(response));
    return NextResponse.json(response);
  } catch (error) {
    console.error('[MAGEN API] ❌ Verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
