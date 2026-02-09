// MAGEN Trust API — Supabase Edge Functions backend
// https://magentrust.ai
//
// The SDK's `apiBaseUrl` config lets us point at whatever backend is live.
// Right now the working backend is the Supabase Edge Functions deployment.
// When the public api.magentrust.ai goes live, just change MAGEN_API_URL.

const DEFAULT_BASE_URL = 'https://nffcwzpxkdrvxopjiuvc.supabase.co/functions/v1';

function getBaseUrl(): string {
  return process.env.MAGEN_API_URL || DEFAULT_BASE_URL;
}

function getMagenCredentials() {
  const apiKey = process.env.MAGEN_API_KEY;
  const secretKey = process.env.MAGEN_SECRET_KEY;
  const siteId = process.env.MAGEN_SITE_ID;
  return { apiKey, secretKey, siteId };
}

// Auth headers for the Supabase MAGEN backend
function getMagenHeaders() {
  const { apiKey, secretKey } = getMagenCredentials();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey || ''}`,
    'X-Magen-Secret': secretKey || '',
  };
}

// Check if Magen is properly configured
export function isMagenConfigured(): boolean {
  const { apiKey, secretKey, siteId } = getMagenCredentials();
  return !!(
    apiKey && !apiKey.includes('your_') &&
    secretKey && secretKey.length > 0 &&
    siteId && siteId.length > 0
  );
}

// Supabase backend response shapes
export interface MagenStartSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    sessionToken: string;
    status: string;
    expiresAt: string;
  };
}

export interface MagenCheckResponse {
  success: boolean;
  data: {
    sessionId: string;
    status: string;
    verified: boolean;
    trustScore: number;
    isHuman: boolean;
    classification: string;         // "HUMAN" | "BOT" | "SUSPICIOUS"
    tieredClassification: string;
    classificationAction: string;
    humanSignals: string[];
    botSignals: string[];
  };
}

// Internal result type used throughout the app
export interface MagenVerificationResult {
  success: boolean;
  session_id?: string;
  verdict?: 'verified' | 'unverified' | 'review';
  score?: number;
  is_human?: boolean;
  error?: string;
}

// Map Supabase classification → internal verdict
function classificationToVerdict(classification: string): 'verified' | 'unverified' | 'review' {
  switch (classification.toUpperCase()) {
    case 'HUMAN': return 'verified';
    case 'BOT': return 'unverified';
    case 'SUSPICIOUS': return 'review';
    default: return 'review';
  }
}

// Start a new verification session
// POST /magen-verify-start
export async function startSession(): Promise<{ sessionId: string } | null> {
  const { siteId } = getMagenCredentials();
  if (!isMagenConfigured()) {
    console.log('[MAGEN] ❌ Not configured — missing API key, secret, or site ID');
    return null;
  }

  const url = `${getBaseUrl()}/magen-verify-start`;
  console.log(`[MAGEN] 🚀 Starting session → POST ${url}`);
  console.log(`[MAGEN]    siteId: ${siteId}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getMagenHeaders(),
      body: JSON.stringify({ action: 'start', siteId }),
    });

    console.log(`[MAGEN]    Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MAGEN] ❌ start-session error:', response.status, errorText);
      return null;
    }

    const result: MagenStartSessionResponse = await response.json();
    console.log('[MAGEN] ✅ Session created:', JSON.stringify(result.data, null, 2));

    if (result.success && result.data?.sessionId) {
      return { sessionId: result.data.sessionId };
    }
    console.warn('[MAGEN] ⚠️ Unexpected response shape:', JSON.stringify(result));
    return null;
  } catch (error) {
    console.error('[MAGEN] ❌ start-session network error:', error);
    return null;
  }
}

// Verify (check) an existing session
// POST /magen-verify-check
export async function verifySession(sessionId: string): Promise<MagenVerificationResult> {
  if (!isMagenConfigured()) {
    console.log('[MAGEN] ❌ Not configured — skipping verification');
    return { success: false, error: 'MAGEN not configured' };
  }

  const url = `${getBaseUrl()}/magen-verify-check`;
  console.log(`[MAGEN] 🔍 Verifying session → POST ${url}`);
  console.log(`[MAGEN]    sessionId: ${sessionId}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getMagenHeaders(),
      body: JSON.stringify({ sessionId }),
    });

    console.log(`[MAGEN]    Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MAGEN] ❌ verify error:', response.status, errorText);
      return { success: false, error: `Verification failed: ${response.status}` };
    }

    const result: MagenCheckResponse = await response.json();

    if (!result.success) {
      console.warn('[MAGEN] ⚠️ Verification unsuccessful:', JSON.stringify(result));
      return { success: false, error: 'Verification returned unsuccessful' };
    }

    const { data } = result;
    const mapped = {
      success: true,
      session_id: data.sessionId,
      verdict: classificationToVerdict(data.classification),
      score: data.trustScore,
      is_human: data.isHuman,
    };

    console.log('[MAGEN] ✅ Verification result:', JSON.stringify({
      sessionId: data.sessionId,
      classification: data.classification,
      trustScore: data.trustScore,
      isHuman: data.isHuman,
      verdict: mapped.verdict,
      humanSignals: data.humanSignals,
      botSignals: data.botSignals,
    }, null, 2));

    return mapped;
  } catch (error) {
    console.error('[MAGEN] ❌ verify network error:', error);
    return { success: false, error: 'Network error' };
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
