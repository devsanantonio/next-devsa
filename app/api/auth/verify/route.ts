import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getDb, COLLECTIONS, type JobBoardUser } from '@/lib/firebase-admin';
import { isSuperAdmin } from '@/lib/auth-middleware';

// Verify Firebase ID token and return user profile
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    const adminAuth = getFirebaseAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';

    // Check if user has a job board profile
    const db = getDb();
    const profileDoc = await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(uid).get();

    const superAdmin = isSuperAdmin(email);

    if (profileDoc.exists) {
      const profile = profileDoc.data() as JobBoardUser;
      return NextResponse.json({
        authenticated: true,
        hasProfile: true,
        isSuperAdmin: superAdmin,
        uid,
        email,
        profile: {
          uid: profile.uid,
          email: profile.email,
          role: profile.role,
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          profileImage: profile.profileImage,
          companyName: profile.companyName,
          companyLogo: profile.companyLogo,
          isActive: profile.isActive,
        },
      });
    }

    return NextResponse.json({
      authenticated: true,
      hasProfile: false,
      isSuperAdmin: superAdmin,
      uid,
      email,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
