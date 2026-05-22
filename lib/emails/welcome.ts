interface WelcomeEmailProps {
  firstName: string;
  role: 'hiring' | 'open-to-work';
  bountiesUrl: string;
  postUrl: string;
}

export function WelcomeEmail({ firstName, role, bountiesUrl, postUrl }: WelcomeEmailProps) {
  const name = firstName || 'there';
  const isHiring = role === 'hiring';
  const primaryCta = isHiring ? 'Post your first bounty' : 'Browse open bounties';
  const primaryUrl = isHiring ? postUrl : bountiesUrl;
  const intro = isHiring
    ? "Welcome aboard. You're set up to post bounties — bite-sized dev projects that local builders can claim, deliver, and get paid for. Every completed bounty funds DEVSA's workshops, conferences, and the downtown coworking space."
    : "Welcome aboard. You're set up to claim bounties — bite-sized paid dev projects from community groups and partners across the DEVSA network. Every completed bounty also funds DEVSA programming.";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DEVSA Bounties</title>
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
                Bounty Board · Building Together
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a; padding: 40px;">

              <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; color: #ffffff; line-height: 1.2; letter-spacing: -0.5px;">
                Welcome, ${name}.
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #d1d5db; line-height: 1.6;">
                ${intro}
              </p>

              <!-- Primary CTA -->
              <table role="presentation" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center" style="background-color: #ef426f; border-radius: 12px;">
                    <a href="${primaryUrl}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.2px;">
                      ${primaryCta}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Three-pillar overview -->
              <div style="border-top: 1px solid #2a2a2a; padding-top: 24px; margin-top: 8px;">
                <p style="margin: 0 0 16px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                  How it works
                </p>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #d1d5db;">
                      <strong style="color: #ffffff;">1. Post + fund</strong> — Scope the work, pick an amount. DEVSA holds it in escrow.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #d1d5db;">
                      <strong style="color: #ffffff;">2. Match a builder</strong> — Local devs pitch on your bounty. Pick one.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #d1d5db;">
                      <strong style="color: #ffffff;">3. Approve work</strong> — Builder ships, you review, payment releases.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #d1d5db;">
                      <strong style="color: #ffffff;">4. Fund the ecosystem</strong> — DEVSA takes 8% to fund workshops, conferences, and the coworking space.
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 20px 0 20px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #9ca3af; letter-spacing: 0.3px;">
                DEVSA · A 501(c)(3) tech community in San Antonio
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                Bridging 20+ community groups, partners, and builders.
              </p>
              <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                You're receiving this because you just created a DEVSA Bounties account.
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
