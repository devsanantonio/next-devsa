interface CoworkingInquiryOpsEmailProps {
  name: string;
  email: string | null;
  message: string;
  adminName: string | null;
  botNotified: boolean;
  submittedAt: Date;
}

export function CoworkingInquiryOpsEmail({
  name,
  email,
  message,
  adminName,
  botNotified,
  submittedAt,
}: CoworkingInquiryOpsEmailProps) {
  const botStatus = botNotified
    ? `Sent to ${adminName ?? "active admin"} on Discord`
    : "Not sent on Discord (no active admin or bot unavailable)";

  const replyHint = email
    ? `Hit "Reply" to respond directly to <strong style="color:#ef426f;">${escapeHtml(email)}</strong>.`
    : `No reply email provided. If you need to follow up, respond on Discord.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Coworking Inquiry</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">
                DEVSA Coworking Space · New Inquiry
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:linear-gradient(135deg,#1f1f1f 0%,#0f0f0f 100%);border-radius:16px;border:1px solid #2a2a2a;padding:32px;">
              <h1 style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                New question from ${escapeHtml(name)}
              </h1>

              <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span style="color:#9ca3af;font-size:13px;">From</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;">
                    <span style="color:#ffffff;font-size:13px;font-weight:600;">${escapeHtml(name)}</span>
                  </td>
                </tr>
                ${email
                  ? `<tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span style="color:#9ca3af;font-size:13px;">Email</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;">
                    <a href="mailto:${escapeHtml(email)}" style="color:#ef426f;font-size:13px;font-weight:600;text-decoration:none;">${escapeHtml(email)}</a>
                  </td>
                </tr>`
                  : ""}
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span style="color:#9ca3af;font-size:13px;">Submitted</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;">
                    <span style="color:#ffffff;font-size:13px;">${formatTimestamp(submittedAt)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="color:#9ca3af;font-size:13px;">Discord notify</span>
                  </td>
                  <td style="padding:8px 0;text-align:right;">
                    <span style="color:${botNotified ? "#10b981" : "#f59e0b"};font-size:13px;font-weight:600;">${botStatus}</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px 0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">
                Message
              </p>
              <div style="background-color:rgba(255,255,255,0.04);border-left:3px solid #ef426f;padding:16px 18px;border-radius:8px;margin-bottom:20px;">
                <p style="margin:0;color:#ffffff;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
              </div>

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                ${replyHint}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#6b7280;">
                Sent from devsa.community/coworking-space
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

function formatTimestamp(d: Date): string {
  return d.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
