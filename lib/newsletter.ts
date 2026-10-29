/**
 * Sending the DEVSA newsletter from the admin (Newsletter tab → Write a newsletter).
 *
 * The list is `newsletter_subscriptions` in Firestore and stays the only list:
 * no copy in Resend to drift from it. Every send carries what the law asks
 * of commercial email (CAN-SPAM): a working unsubscribe link and a postal
 * address. Until both are configured, sending is locked:
 *
 *   NEWSLETTER_SECRET          signs the unsubscribe links. Any long random
 *                              string; changing it breaks links already sent.
 *   NEWSLETTER_POSTAL_ADDRESS  DEVSA's mailing address, printed in every
 *                              footer — a PO box is fine.
 *
 * An unsubscribe link carries the email and an HMAC of it, so it works without
 * signing in and can't be forged for someone else's address. The link opens a
 * page with a button (mail scanners follow links, and must not unsubscribe
 * anyone by doing so); mail apps' own one-click unsubscribe POSTs instead
 * (RFC 8058), which the API accepts directly.
 */
import { createHmac, timingSafeEqual } from 'crypto';

export const SITE = 'https://www.devsa.community';

export function newsletterConfig(): { ready: boolean; missing: string[]; postalAddress: string | null } {
  const missing = [
    !process.env.NEWSLETTER_SECRET && 'NEWSLETTER_SECRET',
    !process.env.NEWSLETTER_POSTAL_ADDRESS?.trim() && 'NEWSLETTER_POSTAL_ADDRESS',
  ].filter((v): v is string => !!v);
  return { ready: missing.length === 0, missing, postalAddress: process.env.NEWSLETTER_POSTAL_ADDRESS?.trim() || null };
}

const sign = (email: string) =>
  createHmac('sha256', process.env.NEWSLETTER_SECRET || '')
    .update(`unsubscribe:${email.trim().toLowerCase()}`)
    .digest('base64url')
    .slice(0, 32);

const encodeEmail = (email: string) => Buffer.from(email.trim().toLowerCase()).toString('base64url');

/** The email a link names, if its signature checks out; null otherwise. */
export function verifyUnsubscribe(e: string | null | undefined, t: string | null | undefined): string | null {
  if (!e || !t || !process.env.NEWSLETTER_SECRET) return null;
  let email: string;
  try {
    email = Buffer.from(e, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const expected = Buffer.from(sign(email));
  const given = Buffer.from(t);
  return expected.length === given.length && timingSafeEqual(expected, given) ? email : null;
}

/** The page link, for the footer. */
export const unsubscribePageUrl = (email: string) => `${SITE}/newsletter/unsubscribe?e=${encodeEmail(email)}&t=${sign(email)}`;

/** The one-click endpoint, for the List-Unsubscribe header. */
export const unsubscribeApiUrl = (email: string) => `${SITE}/api/newsletter/unsubscribe?e=${encodeEmail(email)}&t=${sign(email)}`;
