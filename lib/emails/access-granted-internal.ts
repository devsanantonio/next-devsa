interface AccessGrantedInternalEmailProps {
  kind: 'talk' | 'volunteer';
  name: string;
  email: string;
  /** Talk fields — absent on a volunteer signup. */
  sessionTitle?: string | null;
  sessionFormat?: string | null;
  audienceLevel?: string | null;
  abstract?: string | null;
  bio?: string | null;
  company?: string | null;
  linkedin?: string | null;
  firstTimeSpeaker?: boolean;
  /** Free text from either path. */
  notes?: string | null;
  /** True when one person submitted a talk AND offered to help. */
  alsoVolunteering?: boolean;
}

const row = (label: string, value?: string | null) =>
  value
    ? `<tr>
        <td style="padding: 6px 16px 6px 0; font-size: 12px; color: #737373; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; white-space: nowrap;">${label}</td>
        <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; vertical-align: top;">${value}</td>
      </tr>`
    : '';

/**
 * The organiser-facing notification, sent when someone answers either half of
 * the Access Granted call.
 *
 * Separate from the two confirmation templates on purpose: those are written
 * to the person who submitted and are mostly reassurance, whereas this one is
 * written to whoever has to act on it and is mostly data. It carries the full
 * abstract rather than a truncation, because the whole point is being able to
 * judge a talk from the inbox without opening the admin portal.
 *
 * Plain and unbranded — it is internal mail, and dressing it up in the event's
 * green would only make it harder to skim.
 */
export function AccessGrantedInternalEmail({
  kind,
  name,
  email,
  sessionTitle,
  sessionFormat,
  audienceLevel,
  abstract,
  bio,
  company,
  linkedin,
  firstTimeSpeaker,
  notes,
  alsoVolunteering,
}: AccessGrantedInternalEmailProps) {
  const isTalk = kind === 'talk';

  const flags = [
    firstTimeSpeaker ? 'FIRST-TIME SPEAKER' : '',
    alsoVolunteering ? 'ALSO VOLUNTEERING' : '',
  ]
    .filter(Boolean)
    .map(
      (f) =>
        `<span style="display: inline-block; margin: 0 6px 6px 0; padding: 4px 10px; background-color: #1f2937; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #6bffa6;">${f}</span>`
    )
    .join('');

  const abstractBlock = abstract
    ? `<div style="margin-top: 20px;">
         <p style="margin: 0 0 6px 0; font-size: 12px; color: #737373; text-transform: uppercase; letter-spacing: 1px;">Abstract</p>
         <div style="padding: 14px; background-color: #0a0a0a; border: 1px solid #262626; border-radius: 8px; font-size: 14px; color: #d4d4d4; line-height: 1.6; white-space: pre-wrap;">${abstract}</div>
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Access Granted submission</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 32px 20px;">
        <table role="presentation" style="max-width: 640px; width: 100%; border-collapse: collapse; background-color: #141414; border: 1px solid #262626; border-radius: 12px;">
          <tr>
            <td style="padding: 28px;">

              <p style="margin: 0 0 4px 0; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; letter-spacing: 2px; color: #00ff66;">
                ACCESS GRANTED
              </p>
              <h1 style="margin: 0 0 18px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                ${isTalk ? 'New talk submission' : 'New volunteer signup'}
              </h1>

              ${flags}

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                ${row('Name', name)}
                ${row('Email', `<a href="mailto:${email}" style="color: #6bffa6; text-decoration: none;">${email}</a>`)}
                ${row('Company', company)}
                ${row('Link', linkedin)}
                ${row('Title', sessionTitle)}
                ${row('Format', sessionFormat)}
                ${row('Audience', audienceLevel)}
                ${row('Bio', bio)}
                ${row('Notes', notes)}
              </table>

              ${abstractBlock}

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #525252;">
                Sent automatically by devsa.community. Manage submissions in the
                <a href="https://www.devsa.community/admin" style="color: #6bffa6; text-decoration: none;">admin portal</a>.
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

export function getAccessGrantedInternalSubject({
  kind,
  name,
  sessionTitle,
}: {
  kind: 'talk' | 'volunteer';
  name: string;
  sessionTitle?: string | null;
}) {
  return kind === 'talk'
    ? `[Access Granted] Talk from ${name} — "${sessionTitle ?? 'untitled'}"`
    : `[Access Granted] Volunteer — ${name}`;
}
