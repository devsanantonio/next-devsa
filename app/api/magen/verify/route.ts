import { NextRequest, NextResponse } from 'next/server';
import { verifySession, isVerified, shouldBlock } from '@/lib/magen';

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const result = await verifySession(session_id);

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
      risk_band: result.risk_band,
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
