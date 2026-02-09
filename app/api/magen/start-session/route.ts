import { NextResponse } from 'next/server';
import { isMagenConfigured, startSession } from '@/lib/magen';

// Create a new MAGEN verification session.
// Called by the useMagen() hook on component mount.
export async function POST() {
  if (!isMagenConfigured()) {
    return NextResponse.json({ configured: false, sessionId: null });
  }

  const session = await startSession();

  if (!session) {
    return NextResponse.json(
      { configured: true, sessionId: null, error: 'Failed to create session' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    configured: true,
    sessionId: session.sessionId,
  });
}
