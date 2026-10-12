import type { NextRequest } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

/**
 * Who is making this admin request — proven, not claimed.
 *
 * Until 2026-10-12 every admin route took the caller's email from the request
 * (a query param or a body field) and looked it up in `approved_admins`. That
 * check could not tell who was asking, only whose email they had typed, and
 * the super admin's address is published on /about. Anyone could read RSVPs,
 * subscribers and Confluencia inquiries by sending it.
 *
 * Now the admin portal signs in with Firebase Auth (an emailed sign-in link,
 * or Google) and sends the resulting ID token as `Authorization: Bearer …`.
 * This verifies the token's signature and expiry with the Admin SDK and
 * returns the email it was issued to — only when Firebase has verified that
 * the holder owns that address. Routes then run their existing
 * `approved_admins` role and community checks against *this* email.
 *
 * Any email a client still sends in a body or query string is ignored for
 * identity. Returns null when there is no valid token.
 */
export async function verifiedEmail(request: NextRequest | Request): Promise<string | null> {
  const header = request.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(match[1]);
    if (!decoded.email || decoded.email_verified !== true) return null;
    return decoded.email.toLowerCase();
  } catch {
    return null;
  }
}
