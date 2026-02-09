import { NextResponse } from 'next/server';
import { isMagenConfigured, verifySession } from '@/lib/magen';

export async function GET() {
  try {
    const configured = isMagenConfigured();

    if (!configured) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'MAGEN API key or site ID not configured',
        configured: false,
      });
    }

    // Test connection with a dummy verify call
    const testResult = await verifySession('health-check-test');

    // Even if the session doesn't exist, a non-network-error
    // response means the API is reachable
    if (testResult.error === 'Network error') {
      return NextResponse.json({
        status: 'error',
        message: 'Cannot reach MAGEN Trust API',
        configured: true,
        error: testResult.error,
      });
    }

    return NextResponse.json({
      status: 'connected',
      message: 'MAGEN Trust is properly configured and reachable',
      configured: true,
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
