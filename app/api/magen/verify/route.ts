import { NextRequest, NextResponse } from 'next/server';
import { verifySession, isVerified, shouldBlock } from '@/lib/magen';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Accept both session_id (from hook) and sessionId (camelCase)
    const sessionId = body.session_id || body.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const result = await verifySession(sessionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      session_id: result.session_id,
      verdict: result.verdict,
      score: result.score,
      is_human: result.is_human,
      verified: isVerified(result),
      blocked: shouldBlock(result),
    });
  } catch (error) {
    console.error('Magen verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
