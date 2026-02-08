interface RsvpThankYouEmailProps {
  firstName: string;
  lastName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  communityName: string;
  eventUrl?: string;
}

export function RsvpThankYouEmail({ 
  firstName, 
  lastName, 
  eventTitle, 
  eventDate, 
  eventLocation, 
  communityName,
  eventUrl 
}: RsvpThankYouEmailProps) {
  const eventLink = eventUrl || 'https://devsa.community/events';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Registered! - DEVSA</title>
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
                Building Together
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a; padding: 40px;">
              
              <!-- Greeting -->
              <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                You're in, ${firstName}! 🎉
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #d1d5db; line-height: 1.6;">
                Thanks for registering! We can't wait to see you at the event.
              </p>

              <!-- Event Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(239, 66, 111, 0.1); border-radius: 12px; border: 1px solid rgba(239, 66, 111, 0.2); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                      Event
                    </p>
                    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                      ${eventTitle}
                    </h2>
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="font-size: 14px; color: #9ca3af;">📅</span>
                          <span style="font-size: 14px; color: #d1d5db; margin-left: 8px;">${eventDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="font-size: 14px; color: #9ca3af;">📍</span>
                          <span style="font-size: 14px; color: #d1d5db; margin-left: 8px;">${eventLocation}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="font-size: 14px; color: #9ca3af;">🏢</span>
                          <span style="font-size: 14px; color: #ef426f; margin-left: 8px;">${communityName}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${eventLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ef426f 0%, #d63760 100%); border-radius: 12px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      View Event Details
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What to Expect Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; background-color: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid #2a2a2a;">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                      What to expect
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                      <li style="margin-bottom: 8px;">Mark your calendar for the event date</li>
                      <li style="margin-bottom: 8px;">Arrive a few minutes early to settle in</li>
                      <li style="margin-bottom: 8px;">Connect with fellow developers</li>
                      <li>Have fun and learn something new!</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                Need to cancel or have questions? Reply to this email and we'll help you out.
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
                    <a href="https://devsa.community/events" style="color: #ef426f; text-decoration: none; font-size: 14px;">Events</a>
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

export function getRsvpThankYouSubject(eventTitle: string): string {
  return `🎟️ You're registered for "${eventTitle}" | DEVSA`;
}
