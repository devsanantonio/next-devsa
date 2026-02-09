import { NextResponse } from 'next/server';
import { isMagenConfigured, startSession } from '@/lib/magen';

// Create a new MAGEN verification session.
// Called by the useMagen() hook on component mount.
export async function POST() {
  console.log('[MAGEN API] /start-session called');

  if (!isMagenConfigured()) {
    console.log('[MAGEN API] ❌ Not configured — missing env vars:', {
      MAGEN_API_KEY: !!process.env.MAGEN_API_KEY,
      MAGEN_SECRET_KEY: !!process.env.MAGEN_SECRET_KEY,
      MAGEN_SITE_ID: !!process.env.MAGEN_SITE_ID,
      MAGEN_API_URL: process.env.MAGEN_API_URL || '(not set, using default)',
    });
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
