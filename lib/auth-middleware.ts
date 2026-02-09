import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getDb, COLLECTIONS, type JobBoardUser } from '@/lib/firebase-admin';

export interface VerifiedUser {
  uid: string;
  email: string;
  profile: JobBoardUser | null;
  isSuperAdmin: boolean;
}

/**
 * Verify a Firebase ID token from the Authorization header
 * and optionally load the user's job board profile.
 * 
 * Usage in API routes:
 *   const result = await verifyJobBoardUser(request);
 *   if (result instanceof NextResponse) return result; // error response
 *   const { uid, email, profile } = result;
 */
export async function verifyJobBoardUser(
  request: NextRequest,
  options?: { requireProfile?: boolean; requireRole?: 'hiring' | 'open-to-work' }
): Promise<VerifiedUser | NextResponse> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const adminAuth = getFirebaseAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;
    const email = decodedToken.email || '';
    const superAdmin = isSuperAdmin(email);

    // Load the user's job board profile from Firestore
    const db = getDb();
    const profileDoc = await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(uid).get();
    const profile = profileDoc.exists ? (profileDoc.data() as JobBoardUser) : null;

    if (options?.requireProfile && !profile && !superAdmin) {
      return NextResponse.json(
        { error: 'Job board profile not found. Please complete your profile setup.' },
        { status: 403 }
      );
    }

    // Super admin bypasses role restrictions
    if (options?.requireRole && profile?.role !== options.requireRole && !superAdmin) {
      return NextResponse.json(
        { error: `This action requires the "${options.requireRole}" role` },
        { status: 403 }
      );
    }

    return { uid, email, profile, isSuperAdmin: superAdmin };
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired authentication token' },
      { status: 401 }
    );
  }
}

/**
 * Check if a user is the superadmin (for moderation/oversight)
 */
export function isSuperAdmin(email: string): boolean {
  return email.toLowerCase() === 'jesse@devsanantonio.com';
}
