interface AccessRequestReceivedEmailProps {
  name: string;
  communityOrg: string;
}

/**
 * Confirmation email for an organizer access request from /signin.
 *
 * Brand notes:
 * - The primary DEVSA logo as a PNG. Most mail clients will not render an SVG,
 *   and the S3 bucket's devsa-logo.svg is the only vector copy. Its card body is
 *   black, which is why this template stays on the #0a0a0a substrate the site
 *   uses — the teal/pink/orange bars and off-white mark carry it there.
 * - The three-cell colour bar is a table rather than a CSS gradient: Outlook
 *   drops `linear-gradient`, and solid table cells render everywhere.
 * - The header tagline is the same line the signin page leads with, so the email
 *   and the page a request came from say the same thing.
 */
export function AccessRequestReceivedEmail({ name, communityOrg }: AccessRequestReceivedEmailProps) {
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your organizer access request &mdash; DEVSA</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <img
                src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.png"
                alt="DEVSA"
                width="120"
                style="display: block; width: 120px; max-width: 40%; height: auto; border: 0;"
              />
              <p style="margin: 18px 0 0 0; font-size: 15px; color: #e5e5e5; font-weight: 600; line-height: 1.4;">
                One platform for everyone building San&nbsp;Antonio.
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background-color: #141414; border-radius: 16px; border: 1px solid #262626; padding: 0; overflow: hidden;">

              <!-- Brand bar: teal / pink / orange, matching the logo -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td width="33.33%" height="4" style="background-color: #00b2a9; line-height: 4px; font-size: 0;">&nbsp;</td>
                  <td width="33.33%" height="4" style="background-color: #ef426f; line-height: 4px; font-size: 0;">&nbsp;</td>
                  <td width="33.34%" height="4" style="background-color: #ff8200; line-height: 4px; font-size: 0;">&nbsp;</td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 36px 40px 40px 40px;">

                    <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3; letter-spacing: -0.5px;">
                      Hey ${firstName} &mdash; we&rsquo;ve got your request.
                    </h1>

                    <p style="margin: 0 0 24px 0; font-size: 16px; color: #a3a3a3; line-height: 1.6;">
                      Thanks for asking for organizer access. DEVSA is the 501(c)(3) bridge across San Antonio&rsquo;s tech ecosystem &mdash; builders, organizers and partners all working off <strong style="color: #e5e5e5;">one calendar, one directory, one audience</strong>. Once you&rsquo;re approved, your group takes part in it directly.
                    </p>

                    <!-- Request Details -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a; border-radius: 12px; border: 1px solid #262626; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 22px;">
                          <p style="margin: 0 0 14px 0; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 1px;">
                            Your request
                          </p>
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #262626;">
                                <span style="color: #737373; font-size: 14px;">Name</span>
                              </td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #262626; text-align: right;">
                                <span style="color: #ffffff; font-size: 14px; font-weight: 600;">${name}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #737373; font-size: 14px;">Group</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="color: #ef426f; font-size: 14px; font-weight: 600;">${communityOrg}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- What you'll be able to do -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px; background-color: #141414; border-radius: 12px; border: 1px solid #262626;">
                          <h2 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #ffffff;">
                            What organizer access gets you
                          </h2>
                          <ul style="margin: 0; padding: 0 0 0 20px; color: #a3a3a3; font-size: 14px; line-height: 1.8;">
                            <li style="margin-bottom: 6px;">Publish your events to the <strong style="color: #e5e5e5;">DEVSA community calendar</strong> &mdash; the shared feed the whole city reads, embeds and subscribes to</li>
                            <li style="margin-bottom: 6px;">Run your own page on Building Together &mdash; logo, description and every link, current</li>
                            <li style="margin-bottom: 6px;">See RSVPs for your events as they come in, exportable to CSV</li>
                            <li style="margin-bottom: 6px;">Collect talk submissions when your group hosts a conference</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- What happens next -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 20px; background-color: #0a0a0a; border-radius: 12px; border: 1px solid #262626;">
                          <h2 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #ffffff;">
                            What happens next
                          </h2>
                          <ul style="margin: 0; padding: 0 0 0 20px; color: #a3a3a3; font-size: 14px; line-height: 1.8;">
                            <li style="margin-bottom: 6px;">A DEVSA admin reviews the request &mdash; usually within a couple of days</li>
                            <li style="margin-bottom: 6px;">You&rsquo;ll get an email at this address either way</li>
                            <li style="margin-bottom: 6px;">Once approved, sign in with this email and your dashboard is waiting</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center">
                          <a href="https://www.devsa.community/events" style="display: inline-block; background-color: #ef426f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 8px;">
                            See what&rsquo;s on the calendar
                          </a>
                        </td>
                      </tr>
                    </table>

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
                    <a href="https://www.devsa.community/events" style="color: #ef426f; text-decoration: none; font-size: 14px;">Community Calendar</a>
                  </td>
                  <td style="color: #404040;">&middot;</td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.devsa.community/buildingtogether" style="color: #ef426f; text-decoration: none; font-size: 14px;">Building Together</a>
                  </td>
                  <td style="color: #404040;">&middot;</td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.devsa.community/coworking-space" style="color: #ef426f; text-decoration: none; font-size: 14px;">Coworking</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 22px 0 0 0; font-size: 12px; color: #525252;">
                DEVSA &middot; San Antonio, TX &middot; a 501(c)(3) nonprofit
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

export function getAccessRequestReceivedSubject(communityOrg: string): string {
  return `Organizer access request received for ${communityOrg} | DEVSA`;
}
