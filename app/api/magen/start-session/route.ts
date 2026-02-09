import { NextResponse } from 'next/server';
import { isMagenConfigured, startSession } from '@/lib/magen';

// Create a new MAGEN verification session.
// Called by the useMagen() hook on component mount.
export async function POST() {
  console.log('[MAGEN API] /start-session called');

  if (!isMagenConfigured()) {
    console.log('[MAGEN API] ❌ Not configured');
    return NextResponse.json({ configured: false, sessionId: null });
  }

  const session = await startSession();

  if (!session) {
    console.error('[MAGEN API] ❌ Failed to create session');
    return NextResponse.json(
      { configured: true, sessionId: null, error: 'Failed to create session' },
      { status: 500 }
    );
  }

  console.log(`[MAGEN API] ✅ Session created: ${session.sessionId}`);
  return NextResponse.json({
    configured: true,
    sessionId: session.sessionId,
  });
}
