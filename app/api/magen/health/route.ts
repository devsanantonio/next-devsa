import { NextResponse } from 'next/server';
import { isMagenConfigured, startSession } from '@/lib/magen';

export async function GET() {
  try {
    const configured = isMagenConfigured();

    if (!configured) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'MAGEN API key, secret key, or site ID not configured',
        configured: false,
      });
    }

    // Test connection by creating a real session
    const session = await startSession();

    if (!session) {
      return NextResponse.json({
        status: 'error',
        message: 'Cannot reach MAGEN backend',
        configured: true,
      });
    }

    return NextResponse.json({
      status: 'connected',
      message: 'MAGEN Trust is properly configured and reachable',
      configured: true,
      testSessionId: session.sessionId,
    });
  } catch (error) {
    console.error('MAGEN health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      configured: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
