interface ApplicationStatusEmailProps {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: 'shortlisted' | 'rejected';
  dashboardUrl: string;
}

export function ApplicationStatusEmail({
  applicantName,
  jobTitle,
  companyName,
  status,
  dashboardUrl,
}: ApplicationStatusEmailProps) {
  const displayName = applicantName ? applicantName.split(' ')[0] : 'there';

  const isShortlisted = status === 'shortlisted';

  const heading = isShortlisted
    ? `Great news, ${displayName}! You've been shortlisted`
    : `Update on your application, ${displayName}`;

  const body = isShortlisted
    ? `The hiring team at <strong>${companyName}</strong> has shortlisted your application for <strong>${jobTitle}</strong>. This means they're interested — keep an eye on your dashboard for next steps.`
    : `After careful review, the hiring team at <strong>${companyName}</strong> has decided to move forward with other candidates for <strong>${jobTitle}</strong>. We encourage you to keep applying — your next opportunity could be right around the corner.`;

  const emoji = isShortlisted ? '⭐' : '📄';
  const statusLabel = isShortlisted ? 'Shortlisted' : 'Not Selected';
  const statusColor = isShortlisted ? '#22c55e' : '#ef4444';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update - DEVSA Job Board</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: -1px;">
                <span style="color: #ef426f;">DEV</span><span style="color: #ffffff;">SA</span>
              </div>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px;">
                Job Board
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a; padding: 40px;">
              
              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #ef426f 0%, #b03454 100%); border-radius: 50%; line-height: 64px; font-size: 28px;">
                  ${emoji}
                </div>
              </div>

              <!-- Heading -->
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3; text-align: center;">
                ${heading}
              </h1>
              
              <p style="margin: 0 0 28px 0; font-size: 16px; color: #d1d5db; line-height: 1.6; text-align: center;">
                ${body}
              </p>

              <!-- Status Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(239, 66, 111, 0.08); border-radius: 12px; border: 1px solid rgba(239, 66, 111, 0.2); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <p style="margin: 0 0 4px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                            Position
                          </p>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                            ${jobTitle}
                          </p>
                          <p style="margin: 4px 0 0 0; font-size: 14px; color: #9ca3af;">
                            ${companyName}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid rgba(239, 66, 111, 0.15); padding-top: 16px;">
                          <p style="margin: 0 0 4px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                            Status
                          </p>
                          <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${statusColor};">
                            ${statusLabel}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 28px;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef426f 0%, #d63760 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
                  View Your Applications →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                This is an automated notification from the DEVSA Job Board.
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">
                San Antonio's Developer Community
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
