interface AccessApprovedEmailProps {
  name?: string;
  email: string;
  communityOrg?: string;
}

export function AccessApprovedEmail({ name, email, communityOrg }: AccessApprovedEmailProps) {
  const displayName = name ? name.split(' ')[0] : 'there';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Approved! - DEVSA</title>
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
                San Antonio Developer Community
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a; padding: 40px;">
              
              <!-- Success Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; line-height: 64px; font-size: 32px;">
                  ✓
                </div>
              </div>

              <!-- Greeting -->
              <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3; text-align: center;">
                Hey ${displayName}! You're Approved! 🎉
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #d1d5db; line-height: 1.6; text-align: center;">
                Great news! Your request for organizer access to the <strong style="color: #ef426f;">DEVSA Community Calendar</strong> has been approved.
              </p>

              ${communityOrg ? `
              <!-- Community Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(239, 66, 111, 0.1); border-radius: 12px; border: 1px solid rgba(239, 66, 111, 0.2); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                      Representing
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 600; color: #ef426f;">
                      ${communityOrg}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Divider -->
              <div style="height: 1px; background: linear-gradient(to right, transparent, #2a2a2a, transparent); margin: 24px 0;"></div>

              <!-- How to Get Started Section -->
              <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                How to Get Started
              </h2>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: top; padding-right: 16px;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #ef426f 0%, #b03454 100%); border-radius: 50%; text-align: center; line-height: 32px; font-size: 14px; font-weight: bold; color: white;">1</div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                            Go to the Admin Page
                          </p>
                          <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                            Visit <a href="https://devsa.community/admin" style="color: #ef426f; text-decoration: none;">devsa.community/admin</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: top; padding-right: 16px;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #ef426f 0%, #b03454 100%); border-radius: 50%; text-align: center; line-height: 32px; font-size: 14px; font-weight: bold; color: white;">2</div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                            Enter Your Email
                          </p>
                          <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                            Use this email address: <strong style="color: #ffffff;">${email}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: top; padding-right: 16px;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #ef426f 0%, #b03454 100%); border-radius: 50%; text-align: center; line-height: 32px; font-size: 14px; font-weight: bold; color: white;">3</div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                            Create Your Event
                          </p>
                          <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                            Click the "Events" tab, then "Create Event" to add your community event to the calendar
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="https://devsa.community/admin" style="display: inline-block; background: linear-gradient(135deg, #ef426f 0%, #b03454 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Go to Admin Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height: 1px; background: linear-gradient(to right, transparent, #2a2a2a, transparent); margin: 32px 0 24px 0;"></div>

              <!-- Tips Section -->
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                Quick Tips
              </h3>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;">
                    <span style="color: #ef426f; margin-right: 8px;">•</span>
                    <span style="color: #d1d5db; font-size: 14px;">Include a clear event title and description</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;">
                    <span style="color: #ef426f; margin-right: 8px;">•</span>
                    <span style="color: #d1d5db; font-size: 14px;">Add the venue address or virtual meeting link</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;">
                    <span style="color: #ef426f; margin-right: 8px;">•</span>
                    <span style="color: #d1d5db; font-size: 14px;">Link to your registration or RSVP page</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">
                Welcome to the DEVSA organizer team! 🙌
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
