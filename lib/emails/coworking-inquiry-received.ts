interface CoworkingInquiryReceivedEmailProps {
  name: string;
  message: string;
  adminName: string | null;
}

export function CoworkingInquiryReceivedEmail({
  name,
  message,
  adminName,
}: CoworkingInquiryReceivedEmailProps) {
  const firstName = name.split(" ")[0];
  const recipientLine = adminName
    ? `We sent your question to <strong style="color:#ef426f;">${adminName}</strong> on Discord. They typically reply within a day.`
    : `An admin will get back to you.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We got your question — DEVSA Coworking Space</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="font-size:32px;font-weight:bold;color:#ffffff;letter-spacing:-1px;">
                <span style="color:#ef426f;">DEV</span><span style="color:#ffffff;">SA</span>
              </div>
              <p style="margin:8px 0 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">
                Coworking Space
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:linear-gradient(135deg,#1f1f1f 0%,#0f0f0f 100%);border-radius:16px;border:1px solid #2a2a2a;padding:40px;">
              <h1 style="margin:0 0 24px 0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;">
                Hey ${firstName}!
              </h1>

              <p style="margin:0 0 24px 0;font-size:16px;color:#d1d5db;line-height:1.6;">
                Thanks for reaching out about the <strong style="color:#ef426f;">DEVSA Coworking Space</strong>. ${recipientLine}
              </p>

              <table role="presentation" style="width:100%;border-collapse:collapse;background-color:rgba(239,66,111,0.1);border-radius:12px;border:1px solid rgba(239,66,111,0.2);margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">
                      Your Question
                    </p>
                    <p style="margin:0;color:#ffffff;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px 0;font-size:14px;color:#9ca3af;line-height:1.6;">
                In the meantime, you can:
              </p>
              <ul style="margin:0 0 24px 0;padding-left:20px;color:#d1d5db;font-size:14px;line-height:1.8;">
                <li>Check our <a href="https://devsa.community/events" style="color:#ef426f;text-decoration:none;">community calendar</a> for upcoming events</li>
                <li>Join us on <a href="https://discord.gg/cvHHzThrEw" style="color:#ef426f;text-decoration:none;">Discord</a> if you'd like real-time chat</li>
                <li>Reply to this email if you have a follow-up</li>
              </ul>

              <div style="height:1px;background:linear-gradient(to right,transparent,#2a2a2a,transparent);margin:24px 0;"></div>

              <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                The DEVSA Coworking Space lives at 110 E Houston St, 6th Floor, San Antonio TX — generously hosted by Geekdom. Access is free; we coordinate via Discord and email so the space stays welcoming for everyone.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:14px;color:#9ca3af;">
                Building San Antonio's tech community together
              </p>
              <p style="margin:0;font-size:12px;color:#6b7280;">
                DEVSA · San Antonio, TX · <a href="https://devsa.community" style="color:#6b7280;text-decoration:underline;">devsa.community</a>
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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
