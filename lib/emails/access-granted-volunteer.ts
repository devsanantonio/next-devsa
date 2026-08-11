interface AccessGrantedVolunteerEmailProps {
  name: string;
  /**
   * Optional. Access Granted has no role picker — a signup there means "I'm
   * in" and organisers assign work by reaching out — so this is usually null,
   * and the block that showed it is skipped entirely rather than printing an
   * empty card.
   */
  role?: string | null;
  org?: string | null;
}

/**
 * Confirmation for someone who signed up to help run Access Granted.
 *
 * Shorter than the speaker template on purpose. A speaker is waiting on a
 * yes-or-no and needs the review timeline spelled out; a volunteer has already
 * been accepted in every sense that matters, so this just says who will be in
 * touch. Padding it out with a selection process would imply a bar they still
 * have to clear.
 */
export function AccessGrantedVolunteerEmail({
  name,
  role,
  org,
}: AccessGrantedVolunteerEmailProps) {
  const firstName = name.split(' ')[0];

  const orgLine = org
    ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #a3a3a3;">With: <strong style="color: #e5e5e5;">${org}</strong></p>`
    : '';

  // Skipped whole when neither is set, so the email does not carry a labelled
  // card with nothing in it.
  const detailBlock = role || org
    ? `<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a; border-radius: 12px; border: 1px solid #262626; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 22px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 1px;">
                      You put your hand up for
                    </p>
                    <h2 style="margin: 0; font-size: 19px; font-weight: 700; color: #ffffff;">
                      ${role || 'Wherever you are needed'}
                    </h2>
                    ${orgLine}
                  </td>
                </tr>
              </table>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the crew — Access Granted</title>
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
                Thanks ${firstName} &mdash; you&rsquo;re on the crew.
              </h1>

              <p style="margin: 0 0 24px 0; font-size: 16px; color: #a3a3a3; line-height: 1.6;">
                Five hours of drop-in tables only works because people turn up early and stay late to run them. One of the organisers will be in touch with times, what to bring, and where to find us on the day.
              </p>

              <!-- What they picked, when the event asked -->
              ${detailBlock}

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
              <!-- The same three links the speaker confirmation carries, so
                   DEVSA is named in the footer here too and can come out of the
                   header above. Three rather than all six: these are the ones
                   with a URL worth sending someone to from an email. -->
              <table role="presentation" style="border-collapse: collapse; margin: 0 auto;">
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

export function getAccessGrantedVolunteerSubject() {
  return `You're on the crew — Access Granted, Sept 30`;
}
