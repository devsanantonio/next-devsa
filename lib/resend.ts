import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email sender configuration
export const EMAIL_FROM = 'DEVSA <hello@send.devsa.community>';

// Where a reply to a public email goes. The From address cannot take one:
// send.devsa.community has no mailbox, and the domain's wildcard record routes
// its mail to Porkbun's parking server, so every "reply to this email" in the
// templates went nowhere until this was set. This is the contact address the
// site already publishes (lib/contact.ts), not a personal inbox.
export const EMAIL_REPLY_TO = 'jesse@devsanantonio.com';

// Helper to check if Resend is configured
export const isResendConfigured = (): boolean => {
  return !!resendApiKey && !resendApiKey.includes('your_');
};
