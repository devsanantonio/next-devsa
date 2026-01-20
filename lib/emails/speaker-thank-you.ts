interface SpeakerThankYouEmailProps {
  name: string;
  sessionTitle: string;
  sessionFormat: string;
}

export function SpeakerThankYouEmail({ name, sessionTitle, sessionFormat }: SpeakerThankYouEmailProps) {
  const firstName = name.split(' ')[0];
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Submission - DEVSA</title>
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
                More Human Than Human
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a; padding: 40px;">
              
              <!-- Greeting -->
              <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Hey ${firstName}! 🎉
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #d1d5db; line-height: 1.6;">
                Thank you for submitting your speaker proposal for <strong style="color: #ef426f;">More Human Than Human</strong> - the DEVSA AI Conference 2026!
              </p>

              <!-- Submission Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(239, 66, 111, 0.1); border-radius: 12px; border: 1px solid rgba(239, 66, 111, 0.2); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                      Your Session
                    </p>
                    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                      ${sessionTitle}
                    </h2>
                    <p style="margin: 0; font-size: 14px; color: #ef426f; font-weight: 500;">
                      ${sessionFormat}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 16px; color: #d1d5db; line-height: 1.6;">
                We're excited to review your proposal! Our team will carefully evaluate all submissions and get back to you soon.
              </p>

              <!-- What's Next Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; background-color: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid #2a2a2a;">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                      What happens next?
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                      <li style="margin-bottom: 8px;">Our team reviews all submissions</li>
                      <li style="margin-bottom: 8px;">We'll notify you of our decision via email</li>
                      <li style="margin-bottom: 8px;">Selected speakers will receive additional details about the event</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Event Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td align="center" style="padding: 24px; background: linear-gradient(135deg, rgba(239, 66, 111, 0.15) 0%, rgba(239, 66, 111, 0.05) 100%); border-radius: 12px; border: 1px solid rgba(239, 66, 111, 0.3);">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">
                      📅 February 28th, 2026
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">
                      📍 Geekdom, San Antonio, TX
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">
                      Where AI meets human creativity
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                Have questions? Reply to this email or reach out to us on social media.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                Building Together in San Antonio 🤝
              </p>
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://devsa.community" style="color: #ef426f; text-decoration: none; font-size: 14px;">Website</a>
                  </td>
                  <td style="color: #4b5563;">•</td>
                  <td style="padding: 0 8px;">
                    <a href="https://devsa.community/events/morehumanthanhuman" style="color: #ef426f; text-decoration: none; font-size: 14px;">Event Page</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; font-size: 12px; color: #4b5563;">
                © 2026 DEVSA Community. All rights reserved.
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

export function getSpeakerThankYouSubject(sessionTitle: string): string {
  return `🎤 We received your proposal: "${sessionTitle}" | DEVSA AI Conference`;
}
