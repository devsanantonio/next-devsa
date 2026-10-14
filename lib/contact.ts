/**
 * The organization's working mailbox.
 *
 * On devsanantonio.com, not devsa.community, even though the latter is the
 * canonical host and has Google Workspace MX. Mail forwarding is independent
 * of the web redirect — devsanantonio.com answers on Porkbun's forwarders —
 * and this is the address that is actually read.
 *
 * Confirmed against DNS rather than taken on trust: devsaantonio.com, which
 * is one letter off and easy to type, resolves to nothing at all. A funder
 * page is the worst possible place to publish an address into a void.
 */
export const FUNDER_CONTACT = "jesse@devsanantonio.com"

/**
 * Where automated alerts go: Get Involved inquiries, Access Granted
 * submissions. A Gmail inbox rather than the forwarder above, which on
 * 2026-10-11 did not deliver Firebase's sign-in emails. An inquiry from a
 * would-be funder is the last email that can be allowed to vanish that way.
 * Never shown on the site.
 */
export const ALERT_EMAIL = "jesseovr@gmail.com"

export function mailto(subject: string): string {
  return `mailto:${FUNDER_CONTACT}?subject=${encodeURIComponent(subject)}`
}
