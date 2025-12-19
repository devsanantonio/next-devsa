const MAGEN_BASE_URL = 'https://axdupochainmbxtfyflq.supabase.co/functions/v1';

export interface MagenSession {
  sessionId: string;
  status?: string;
  humanScore?: number;
  classification?: 'human' | 'bot' | 'unknown';
}

export interface MagenVerificationResult {
  valid: boolean;
  humanScore?: number;
  classification?: 'human' | 'bot' | 'unknown';
  sessionId?: string;
  error?: string;
}

// Start a new verification session
export async function startVerificationSession(options: {
  action: string;
  userId?: string;
  context?: string;
}): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  const apiKey = process.env.MAGEN_API_KEY;
  
  if (!apiKey || apiKey.includes('your_')) {
    console.log('MAGEN: API key not configured, skipping verification');
    return { success: false, error: 'MAGEN API key not configured' };
  }

  try {
    const response = await fetch(`${MAGEN_BASE_URL}/magen-verify-start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        action: options.action,
        userId: options.userId,
        context: options.context,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MAGEN start session error:', response.status, errorText);
      return { success: false, error: `Failed to start session: ${response.status}` };
    }

    const result = await response.json();
    return { success: true, sessionId: result.data?.sessionId || result.sessionId };
  } catch (error) {
    console.error('MAGEN start session error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Check verification status for a session
export async function checkVerification(sessionId: string): Promise<MagenVerificationResult> {
  const apiKey = process.env.MAGEN_API_KEY;
  
  if (!apiKey || apiKey.includes('your_')) {
    return { valid: false, error: 'MAGEN API key not configured' };
  }

  try {
    const response = await fetch(`${MAGEN_BASE_URL}/magen-verify-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MAGEN check verification error:', response.status, errorText);
      return { valid: false, error: `Verification check failed: ${response.status}` };
    }

    const result = await response.json();
    const data = result.data || result;
    
    return {
      valid: true,
      sessionId: data.sessionId,
      humanScore: data.humanScore,
      classification: data.classification,
    };
  } catch (error) {
    console.error('MAGEN check verification error:', error);
    return { valid: false, error: 'Network error' };
  }
}

// Get session details
export async function getSession(sessionId: string): Promise<MagenSession | null> {
  const apiKey = process.env.MAGEN_API_KEY;
  
  if (!apiKey || apiKey.includes('your_')) {
    return null;
  }

  try {
    const response = await fetch(`${MAGEN_BASE_URL}/magen-verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      return null;
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('MAGEN get session error:', error);
    return null;
  }
}

// Threshold configuration for different use cases
export const MAGEN_THRESHOLDS = {
  signup: 0.6,         // Allow most signups, flag suspicious
  formSubmission: 0.7, // Standard protection for forms
  login: 0.7,          // Standard protection
  payment: 0.85,       // High confidence required
  passwordReset: 0.9,  // Maximum protection
} as const;

// Legacy function for backwards compatibility
export function verifyMagenToken(token: string): MagenVerificationResult {
  // This is now handled by checkVerification with sessionId
  return { valid: false, error: 'Use checkVerification with sessionId instead' };
}
