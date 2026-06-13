interface StartupWeekThankYouEmailProps {
  name: string;
  sessionTitle: string;
  track: string;
}

/**
 * Confirmation email for San Antonio Startup Week speaker submissions.
 * Mirrors the /startup-week-2026 page: light/white surface, neutral text,
 * #ec228d pink accent, and a black CTA — distinct from the dark AI Conference
 * template so the two events stay visually separate.
 */
export function StartupWeekThankYouEmail({ name, sessionTitle, track }: StartupWeekThankYouEmailProps) {
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your talk is in — San Antonio Startup Week</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 2px;">
                An open call from DEVSA &times; Geekdom
              </p>
              <div style="font-size: 26px; font-weight: 800; color: #171717; letter-spacing: -0.5px;">
                San Antonio <span style="color: #ec228d;">Startup Week</span>
              </div>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e5e5; padding: 40px;">

              <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 800; color: #171717; line-height: 1.3; letter-spacing: -0.5px;">
                Hey ${firstName} — your talk is in.
              </h1>

              <p style="margin: 0 0 24px 0; font-size: 16px; color: #525252; line-height: 1.6;">
                Thanks for answering the open call for <strong style="color: #171717;">San Antonio Startup Week</strong>. DEVSA and Geekdom are coming together to put builders on stage, and we&rsquo;re glad you&rsquo;re one of them.
              </p>

              <!-- Submission Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 12px; border: 1px solid #ededed; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 22px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 1px;">
                      Your talk
                    </p>
                    <h2 style="margin: 0 0 12px 0; font-size: 19px; font-weight: 700; color: #171717;">
                      ${sessionTitle}
                    </h2>
                    <span style="display: inline-block; padding: 4px 12px; background-color: rgba(236, 34, 141, 0.1); border-radius: 999px; font-size: 13px; color: #ec228d; font-weight: 600;">
                      ${track}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5;">
                    <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #171717;">
                      What happens next
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #525252; font-size: 14px; line-height: 1.8;">
                      <li style="margin-bottom: 6px;">We review every submission across all six tracks</li>
                      <li style="margin-bottom: 6px;">You&rsquo;ll hear our decision by email</li>
                      <li style="margin-bottom: 6px;">Selected speakers get the schedule and logistics</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Event Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #fafafa; border-radius: 12px; border: 1px solid #ededed;">
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #171717; font-weight: 600;">
                      Sept 28 &ndash; Oct 2, 2026
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #737373;">
                      Geekdom &middot; San Antonio, TX
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="https://devsa.community/events" style="display: inline-block; background-color: #171717; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 28px; border-radius: 10px;">
                      Explore the Community Calendar
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 28px;">
              <p style="margin: 0 0 14px 0; font-size: 14px; color: #737373;">
                Building Together in San Antonio
              </p>
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://devsa.community" style="color: #ec228d; text-decoration: none; font-size: 14px;">DEVSA</a>
                  </td>
                  <td style="color: #d4d4d4;">&middot;</td>
                  <td style="padding: 0 8px;">
                    <a href="https://geekdom.com/" style="color: #ec228d; text-decoration: none; font-size: 14px;">Geekdom</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 22px 0 0 0; font-size: 12px; color: #a3a3a3;">
                &copy; 2026 DEVSA Community. All rights reserved.
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

export function getStartupWeekThankYouSubject(sessionTitle: string): string {
  return `Your talk is in: "${sessionTitle}" | SA Startup Week`;
}
