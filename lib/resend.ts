import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email sender configuration
export const EMAIL_FROM = 'DEVSA <hello@send.devsa.community>';

// Helper to check if Resend is configured
export const isResendConfigured = (): boolean => {
  return !!resendApiKey && !resendApiKey.includes('your_');
};
