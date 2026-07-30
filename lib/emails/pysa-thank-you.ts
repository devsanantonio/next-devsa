interface PysaThankYouEmailProps {
  name: string;
  sessionTitle: string;
  sessionFormat?: string;
  audienceLevel?: string;
  considerFor?: string;
}

/**
 * Confirmation email for PySanAntonio II speaker submissions.
 *
 * Dark surface with the PyTexas blue/yellow accents that lead the event page,
 * so it reads as PySanAntonio rather than the Startup Week (light, magenta) or
 * AI Conference templates.
 */
export function PysaThankYouEmail({
  name,
  sessionTitle,
  sessionFormat,
  audienceLevel,
  considerFor,
}: PysaThankYouEmailProps) {
  const firstName = name.split(' ')[0];

  const chips = [sessionFormat, audienceLevel]
    .filter(Boolean)
    .map(
      (label) =>
        `<span style="display: inline-block; margin: 0 6px 6px 0; padding: 4px 12px; background-color: rgba(74, 144, 217, 0.15); border-radius: 999px; font-size: 13px; color: #8fc0ea; font-weight: 600;">${label}</span>`
    )
    .join('');

  const considerLine = considerFor
    ? `<p style="margin: 14px 0 0 0; font-size: 13px; color: #a3a3a3;">Considered for: <strong style="color: #e5e5e5;">${considerFor}</strong></p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your talk is in — PySanAntonio II</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 2px;">
                Alamo Python &middot; PyTexas Foundation &middot; DEVSA
              </p>
              <!-- Raster, not SVG: most email clients will not render an SVG.
                   Absolute URL on the canonical host so it resolves in a mail
                   client with no page context. -->
              <img
                src="https://www.devsa.community/pysa/wordmark-dark.png"
                alt="PySanAntonio II"
                width="280"
                style="display: block; width: 280px; max-width: 80%; height: auto; border: 0;"
              />
              <p style="margin: 12px 0 0 0; font-size: 15px; color: #4a90d9; font-style: italic;">
                returns October 2026
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background-color: #141414; border-radius: 16px; border: 1px solid #262626; padding: 40px;">

              <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3; letter-spacing: -0.5px;">
                Hey ${firstName} &mdash; your talk is in.
              </h1>

              <p style="margin: 0 0 24px 0; font-size: 16px; color: #a3a3a3; line-height: 1.6;">
                Thanks for answering the call for speakers. San Antonio&rsquo;s Python conference is back for a second year &mdash; an afternoon of <strong style="color: #e5e5e5;">learning, networking, and community building</strong> &mdash; and the schedule comes together from whoever raises a hand.
              </p>

              <!-- Submission Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a; border-radius: 12px; border: 1px solid #262626; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 22px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 1px;">
                      Your talk
                    </p>
                    <h2 style="margin: 0 0 12px 0; font-size: 19px; font-weight: 700; color: #ffffff;">
                      ${sessionTitle}
                    </h2>
                    ${chips}
                    ${considerLine}
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; background-color: #141414; border-radius: 12px; border: 1px solid #262626;">
                    <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #ffffff;">
                      What happens next
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #a3a3a3; font-size: 14px; line-height: 1.8;">
                      <li style="margin-bottom: 6px;">The call closes <strong style="color: #ffdd00;">August 15</strong> &mdash; we review everything after that</li>
                      <li style="margin-bottom: 6px;">You&rsquo;ll hear back by email either way</li>
                      <li style="margin-bottom: 6px;">Selected speakers get the run of show and A/V details</li>
                      <li style="margin-bottom: 6px;">If it doesn&rsquo;t land a conference slot, it gets first look for Alamo Python&rsquo;s regular meetups &mdash; the work still finds a room</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Event Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #0a0a0a; border-radius: 12px; border: 1px solid #262626;">
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;">
                      Friday, October 2, 2026 &middot; 1:00 &ndash; 6:00 PM
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #a3a3a3;">
                      Geekdom, 3rd Floor &middot; San Antonio, TX
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #737373;">
                      Part of SA Startup + Tech Week, Sept 28 &ndash; Oct 2
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="https://www.devsa.community/events/pysanantonio" style="display: inline-block; background-color: #ffdd00; color: #0a0a0a; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 8px;">
                      See the conference page
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
                    <a href="https://www.meetup.com/alamo-python/" style="color: #4a90d9; text-decoration: none; font-size: 14px;">Alamo Python</a>
                  </td>
                  <td style="color: #404040;">&middot;</td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.pytexas.org/" style="color: #4a90d9; text-decoration: none; font-size: 14px;">PyTexas</a>
                  </td>
                  <td style="color: #404040;">&middot;</td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.devsa.community" style="color: #4a90d9; text-decoration: none; font-size: 14px;">DEVSA</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 22px 0 0 0; font-size: 12px; color: #525252;">
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

export function getPysaThankYouSubject(sessionTitle: string): string {
  return `Your talk is in: "${sessionTitle}" | PySanAntonio II`;
}
