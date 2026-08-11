interface AccessGrantedThankYouEmailProps {
  name: string;
  sessionTitle: string;
  sessionFormat?: string;
  audienceLevel?: string;
  firstTimeSpeaker?: boolean;
  /**
   * True when the same person also signed up to help run the room. They get
   * ONE email, not two — this line is what acknowledges the second half.
   */
  alsoVolunteering?: boolean;
}

/**
 * Confirmation email for Access Granted speaker submissions.
 *
 * Same dark surface as the PySanAntonio template, with terminal green in place
 * of the PyTexas blue and a mono lockup instead of a wordmark image — Access
 * Granted has no raster wordmark on this host, and an <img> pointing at art
 * that does not exist is worse than type.
 *
 * The first-timer line is conditional and says something concrete, because the
 * call promises a practice run with an experienced speaker. Someone who ticked
 * that box should see it acknowledged rather than wonder if it registered.
 */
export function AccessGrantedThankYouEmail({
  name,
  sessionTitle,
  sessionFormat,
  audienceLevel,
  firstTimeSpeaker,
  alsoVolunteering,
}: AccessGrantedThankYouEmailProps) {
  const firstName = name.split(' ')[0];

  const chips = [sessionFormat, audienceLevel]
    .filter(Boolean)
    .map(
      (label) =>
        `<span style="display: inline-block; margin: 0 6px 6px 0; padding: 4px 12px; background-color: rgba(0, 255, 102, 0.12); border-radius: 999px; font-size: 13px; color: #6bffa6; font-weight: 600;">${label}</span>`
    )
    .join('');

  const volunteerLine = alsoVolunteering
    ? `<p style="margin: 14px 0 0 0; font-size: 13px; color: #a3a3a3; line-height: 1.6;">You also put your hand up to help run the room &mdash; noted, and thank you. One of the organisers will be in touch about that separately, whatever happens with the talk.</p>`
    : '';

  const firstTimerLine = firstTimeSpeaker
    ? `<p style="margin: 14px 0 0 0; font-size: 13px; color: #a3a3a3; line-height: 1.6;">You told us this would be your first conference talk &mdash; noted, and welcome. One slot is held for exactly that, and we&rsquo;ll offer to pair you with an experienced speaker for a practice run before the day.</p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your talk is in — Access Granted</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <!-- No DEVSA in this line. It appears in the footer's org links
                   instead, so naming it here too made the same host read twice
                   in one email. The other five are the security groups whose
                   room this is. -->
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 2px;">
                BSides SATX &middot; DCG-SATX &middot; SAHA &middot; UTSA CyberJedis &middot; Alamo City Locksport
              </p>
              <p style="margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 30px; font-weight: 700; letter-spacing: 3px; color: #00ff66;">
                ACCESS GRANTED
              </p>
              <p style="margin: 10px 0 0 0; font-size: 15px; color: #a3a3a3; font-style: italic;">
                September 30, 2026
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
                Every other room that week is people talking about technology. <strong style="color: #e5e5e5;">This one is people taking it apart</strong> &mdash; and you just offered to be one of them.
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
                    ${firstTimerLine}
                    ${volunteerLine}
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
                      <li style="margin-bottom: 6px;">The call closes <strong style="color: #ffb800;">August 28</strong> &mdash; we review everything after that</li>
                      <li style="margin-bottom: 6px;">There are three 40-minute slots. We accept three and one alternate</li>
                      <li style="margin-bottom: 6px;">You&rsquo;ll hear back by email either way</li>
                      <li style="margin-bottom: 6px;">Selected speakers get the run of show and A/V details</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Event Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #0a0a0a; border-radius: 12px; border: 1px solid #262626;">
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;">
                      Wednesday, September 30, 2026 &middot; 1:00 &ndash; 6:00 PM
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
                    <a href="https://www.devsa.community/events/access-granted" style="display: inline-block; background-color: #00ff66; color: #0a0a0a; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 8px;">
                      See the event page
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
                    <a href="https://www.bsidessatx.com/" style="color: #00ff66; text-decoration: none; font-size: 14px;">BSides SATX</a>
                  </td>
                  <td style="color: #404040;">&middot;</td>
                  <td style="padding: 0 8px;">
                    <a href="https://dcgsatx.com/" style="color: #00ff66; text-decoration: none; font-size: 14px;">DCG-SATX</a>
                  </td>
                  <td style="color: #404040;">&middot;</td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.devsa.community" style="color: #00ff66; text-decoration: none; font-size: 14px;">DEVSA</a>
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
  `.trim();
}

export function getAccessGrantedThankYouSubject(sessionTitle: string) {
  return `Your talk is in — "${sessionTitle}" for Access Granted`;
}
