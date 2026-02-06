import { NextResponse } from 'next/server';
import { isMagenConfigured, startVerificationSession } from '@/lib/magen';

export async function GET() {
  try {
    const isConfigured = isMagenConfigured();
    
    if (!isConfigured) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'MAGEN API key or secret key not configured',
        configured: false,
      });
    }

    // Test the connection by starting a test session
    const testResult = await startVerificationSession({
      action: 'health-check',
      context: 'api-health-check',
    });

    if (testResult.success && testResult.sessionId) {
      return NextResponse.json({
        status: 'connected',
        message: 'MAGEN is properly configured and connected',
        configured: true,
        testSessionId: testResult.sessionId,
      });
    }

    return NextResponse.json({
      status: 'error',
      message: testResult.error || 'Failed to connect to MAGEN',
      configured: true,
      error: testResult.error,
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
