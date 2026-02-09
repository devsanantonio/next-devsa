// MAGEN Trust API - https://api.magentrust.ai
// Official API docs: https://magentrust.ai
const MAGEN_BASE_URL = 'https://api.magentrust.ai';

// Get configured credentials
function getMagenCredentials() {
  const apiKey = process.env.MAGEN_API_KEY;
  const siteId = process.env.MAGEN_SITE_ID;
  return { apiKey, siteId };
}

// Standard headers for all MAGEN API requests
function getMagenHeaders() {
  const { apiKey, siteId } = getMagenCredentials();
  return {
    'x-magen-key': apiKey || '',
    'x-magen-site': siteId || '',
    'Content-Type': 'application/json',
  };
}

// Check if Magen is properly configured
export function isMagenConfigured(): boolean {
  const { apiKey, siteId } = getMagenCredentials();
  return !!(apiKey && !apiKey.includes('your_') && siteId && siteId.length > 0);
}

// Official MAGEN Trust API response shape
export interface MagenVerifyResponse {
  session_id: string;
  verdict: 'verified' | 'unverified' | 'review';
  score: number;
  risk_band: 'low' | 'medium' | 'high';
  is_human: boolean;
  sdk_version: string;
}

// Challenge response shape
export interface MagenChallengeResponse {
  challenge_id: string;
  type: string;
  expires_at: string;
}

// Result type for internal use
export interface MagenVerificationResult {
  success: boolean;
  session_id?: string;
  verdict?: 'verified' | 'unverified' | 'review';
  score?: number;
  risk_band?: 'low' | 'medium' | 'high';
  is_human?: boolean;
  error?: string;
}

// Verify a session via the official MAGEN Trust API
// POST /v1/verify
export async function verifySession(sessionId: string): Promise<MagenVerificationResult> {
  const { apiKey, siteId } = getMagenCredentials();

  if (!apiKey || apiKey.includes('your_') || !siteId) {
    console.log('MAGEN: Not configured, skipping verification');
    return { success: false, error: 'MAGEN not configured' };
  }

  try {
    const response = await fetch(`${MAGEN_BASE_URL}/v1/verify`, {
      method: 'POST',
      headers: getMagenHeaders(),
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MAGEN verify error:', response.status, errorText);
      return { success: false, error: `Verification failed: ${response.status}` };
    }

    const result: MagenVerifyResponse = await response.json();

    return {
      success: true,
      session_id: result.session_id,
      verdict: result.verdict,
      score: result.score,
      risk_band: result.risk_band,
      is_human: result.is_human,
    };
  } catch (error) {
    console.error('MAGEN verify error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Request an optional challenge for additional verification
// GET /v1/challenge
export async function requestChallenge(): Promise<MagenChallengeResponse | null> {
  const { apiKey, siteId } = getMagenCredentials();

  if (!apiKey || apiKey.includes('your_') || !siteId) {
    return null;
  }

  try {
    const response = await fetch(`${MAGEN_BASE_URL}/v1/challenge`, {
      method: 'GET',
      headers: getMagenHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('MAGEN challenge error:', error);
    return null;
  }
}

// Verdict-based decision helpers
export function isVerified(result: MagenVerificationResult): boolean {
  return result.success && result.verdict === 'verified' && result.is_human === true;
}

export function shouldBlock(result: MagenVerificationResult): boolean {
  return result.success && (result.verdict === 'unverified' || result.is_human === false);
}

export function needsReview(result: MagenVerificationResult): boolean {
  return result.success && result.verdict === 'review';
}
