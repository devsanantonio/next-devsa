import { demoDayInterestLabel } from '@/lib/demo-day';

interface DemoDayInquiryEmailProps {
  name: string;
  email: string;
  organization: string;
  title?: string | null;
  interest: string;
  industry?: string | null;
  message: string;
}

const row = (label: string, value?: string | null) =>
  value
    ? `<tr>
        <td style="padding: 6px 16px 6px 0; font-size: 12px; color: #737373; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; white-space: nowrap;">${label}</td>
        <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; vertical-align: top;">${value}</td>
      </tr>`
    : '';

export function getDemoDayInquirySubject({
  interest,
  organization,
}: Pick<DemoDayInquiryEmailProps, 'interest' | 'organization'>): string {
  return `Confluencia: ${demoDayInterestLabel(interest)} inquiry from ${organization}`;
}

/**
 * The internal notification for a Demo Day inquiry, sent to the funder
 * mailbox. Written for whoever has to answer it: the interest and the
 * organization lead, the message is in full, and reply-to is the person who
 * wrote, so answering is one click.
 *
 * Every value arrives already through sanitizeInput (tags stripped, entities
 * escaped), so it is safe to interpolate here as-is.
 */
export function DemoDayInquiryEmail({
  name,
  email,
  organization,
  title,
  interest,
  industry,
  message,
}: DemoDayInquiryEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Confluencia inquiry</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 32px 20px;">
        <table role="presentation" style="max-width: 640px; width: 100%; border-collapse: collapse; background-color: #141414; border: 1px solid #262626; border-radius: 12px;">
          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 4px 0; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; letter-spacing: 2px; color: #ffb81c;">
                CONFLUENCIA · A DEVSA DEMO DAY
              </p>
              <h1 style="margin: 0 0 18px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                ${demoDayInterestLabel(interest)} inquiry
              </h1>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                ${row('Name', name)}
                ${row('Email', `<a href="mailto:${email}" style="color: #ffb81c; text-decoration: none;">${email}</a>`)}
                ${row('Organization', organization)}
                ${row('Title', title)}
                ${row('Industry', industry)}
              </table>
              <div style="margin-top: 20px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #737373; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                <div style="padding: 14px; background-color: #0a0a0a; border: 1px solid #262626; border-radius: 8px; font-size: 14px; color: #d4d4d4; line-height: 1.6; white-space: pre-wrap;">${message}</div>
              </div>
              <p style="margin: 24px 0 0 0; font-size: 12px; color: #525252;">
                Sent automatically by devsa.community. Every inquiry is also in the
                <a href="https://www.devsa.community/admin?tab=demoday" style="color: #ffb81c; text-decoration: none;">admin portal</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
