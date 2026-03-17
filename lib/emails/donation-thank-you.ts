interface DonationThankYouEmailProps {
  name: string;
  amount: string;
}

export function DonationThankYouEmail({
  name,
  amount,
}: DonationThankYouEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Donation - DEVSA</title>
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
                501(c)(3) Education Nonprofit
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a; padding: 40px;">
              
              <!-- Greeting -->
              <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Thank you, ${name}! 🙏
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #d1d5db; line-height: 1.6;">
                Your generous donation helps us keep building San Antonio's tech community — one workshop, meetup, and resource at a time.
              </p>

              <!-- Donation Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(239, 66, 111, 0.1); border-radius: 12px; border: 1px solid rgba(239, 66, 111, 0.2); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                      Your Donation
                    </p>
                    <h2 style="margin: 0 0 16px 0; font-size: 36px; font-weight: 700; color: #ef426f;">
                      $${amount}
                    </h2>
                    <p style="margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.6;">
                      DEVSA is a registered 501(c)(3) education nonprofit. Your donation may be tax-deductible.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What Your Donation Supports -->
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                  Your support powers
                </h3>
                <table role="presentation" style="border-collapse: collapse; width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #d1d5db; line-height: 1.6;">
                      <span style="color: #ef426f; font-weight: 600;">→</span> Free workshops and hands-on learning events
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #d1d5db; line-height: 1.6;">
                      <span style="color: #ef426f; font-weight: 600;">→</span> Community coworking space in downtown SA
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #d1d5db; line-height: 1.6;">
                      <span style="color: #ef426f; font-weight: 600;">→</span> Resources for local builders, organizers, and learners
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="border-radius: 12px; background-color: #ef426f;">
                    <a href="https://devsa.community/buildingtogether" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      See What We're Building →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                Find your people. Build your future.
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">
                © ${new Date().getFullYear()} DEVSA · <a href="https://devsa.community" style="color: #ef426f; text-decoration: none;">devsa.community</a>
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
