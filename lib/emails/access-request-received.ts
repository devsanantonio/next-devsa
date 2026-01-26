interface AccessRequestReceivedEmailProps {
  name: string;
  communityOrg: string;
}

export function AccessRequestReceivedEmail({ name, communityOrg }: AccessRequestReceivedEmailProps) {
  const firstName = name.split(' ')[0];
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Request Received - DEVSA</title>
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
                Your Direct Connection to the Tech Community
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a; padding: 40px;">
              
              <!-- Greeting -->
              <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Hey ${firstName}! 👋
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #d1d5db; line-height: 1.6;">
                Thank you for requesting organizer access to the <strong style="color: #ef426f;">DEVSA Community Calendar</strong>!
              </p>

              <!-- Request Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(239, 66, 111, 0.1); border-radius: 12px; border: 1px solid rgba(239, 66, 111, 0.2); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                      Your Request Details
                    </p>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                          <span style="color: #9ca3af; font-size: 14px;">Name</span>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">
                          <span style="color: #ffffff; font-size: 14px; font-weight: 600;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #9ca3af; font-size: 14px;">Community / Org</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <span style="color: #ef426f; font-size: 14px; font-weight: 600;">${communityOrg}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next Section -->
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                What happens next?
              </h2>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #ef426f 0%, #b03454 100%); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; color: white;">1</div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">
                            <strong style="color: #ffffff;">Review</strong> - Our admin team will review your request
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #ef426f 0%, #b03454 100%); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; color: white;">2</div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">
                            <strong style="color: #ffffff;">Notification</strong> - You'll receive an email when you're approved
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #ef426f 0%, #b03454 100%); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; color: white;">3</div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">
                            <strong style="color: #ffffff;">Access</strong> - Start adding events to the DEVSA calendar
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height: 1px; background: linear-gradient(to right, transparent, #2a2a2a, transparent); margin: 24px 0;"></div>

              <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                In the meantime, check out our <a href="https://devsa.community/events" style="color: #ef426f; text-decoration: none;">upcoming events</a> or connect with us on social media.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">
                Building San Antonio's tech community together 🤝
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                DEVSA • San Antonio, TX
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
