interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
  jobTitle?: string;
}

export function NewMessageEmail({
  recipientName,
  senderName,
  messagePreview,
  conversationUrl,
  jobTitle,
}: NewMessageEmailProps) {
  const firstName = recipientName ? recipientName.split(' ')[0] : 'there';
  // Trim preview to a reasonable length so the email body doesn't render an
  // unwieldy excerpt. The full message is one click away.
  const trimmedPreview =
    messagePreview.length > 280
      ? messagePreview.slice(0, 280).trimEnd() + '…'
      : messagePreview;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New message — DEVSA Bounties</title>
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
                Bounty Board
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a; padding: 40px;">

              <!-- Heading -->
              <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1.2; letter-spacing: -0.5px;">
                Hi ${firstName},
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #d1d5db; line-height: 1.6;">
                You have a new message from <strong style="color: #ffffff;">${senderName}</strong>${jobTitle ? ` about <strong style=\"color: #ffffff;\">${jobTitle}</strong>` : ''}.
              </p>

              <!-- Message preview -->
              <div style="background-color: #0a0a0a; border-left: 3px solid #ef426f; padding: 20px 24px; border-radius: 8px; margin-bottom: 28px;">
                <p style="margin: 0; font-size: 14px; color: #e5e7eb; line-height: 1.6; white-space: pre-wrap;">${trimmedPreview}</p>
              </div>

              <!-- CTA -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #ef426f; border-radius: 12px;">
                    <a href="${conversationUrl}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.2px;">
                      Read & Reply
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #6b7280; line-height: 1.5; text-align: center;">
                Or visit <a href="${conversationUrl}" style="color: #9ca3af; text-decoration: underline;">DEVSA Bounties</a> to view your inbox.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 20px 0 20px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #9ca3af; letter-spacing: 0.3px;">
                DEVSA Bounties · Building Together
              </p>
              <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                You're getting this email because someone messaged you on DEVSA Bounties.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
