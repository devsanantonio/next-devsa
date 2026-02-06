import { NextResponse } from 'next/server';

const MAGEN_BASE_URL = process.env.MAGEN_API_URL || 'https://api.magenminer.io/v1';

export async function POST() {
  try {
    const apiKey = process.env.MAGEN_API_KEY;
    const secretKey = process.env.MAGEN_SECRET_KEY;
    
    // If MAGEN isn't configured, return gracefully
    if (!apiKey || apiKey.includes('your_')) {
      console.log('MAGEN: API key not configured');
      return NextResponse.json({ sessionId: null, configured: false });
    }

    const response = await fetch(`${MAGEN_BASE_URL}/magen-verify-start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(secretKey && { 'X-Magen-Secret': secretKey }),
      },
      body: JSON.stringify({
        action: 'speaker-submission',
        context: 'call-for-speakers',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MAGEN API error:', response.status, errorText);
      return NextResponse.json({ sessionId: null, configured: false });
    }

    const result = await response.json();
    const sessionId = result.data?.sessionId || result.sessionId;
    
    return NextResponse.json({ sessionId, configured: true });
  } catch (error) {
    console.error('MAGEN start-session error:', error);
    return NextResponse.json({ sessionId: null, configured: false });
  }
}
