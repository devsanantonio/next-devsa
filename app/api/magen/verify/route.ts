import { NextRequest, NextResponse } from 'next/server';
import { checkVerification } from '@/lib/magen';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const result = await checkVerification(sessionId);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      humanScore: result.humanScore,
      classification: result.classification,
    });
  } catch (error) {
    console.error('Magen verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
