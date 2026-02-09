import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type JobBoardUser } from '@/lib/firebase-admin';
import { verifyJobBoardUser, isSuperAdmin } from '@/lib/auth-middleware';

// GET - Get own profile or another user's public profile
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');

  if (!uid) {
    // Get own profile (authenticated)
    const result = await verifyJobBoardUser(request);
    if (result instanceof NextResponse) return result;

    if (!result.profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile: result.profile });
  }

  // Get public profile by UID
  try {
    const db = getDb();
    const doc = await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(uid).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const profile = doc.data() as JobBoardUser;

    // Return public-safe fields only
    return NextResponse.json({
      profile: {
        uid: profile.uid,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImage: profile.profileImage,
        role: profile.role,
        bio: profile.bio,
        website: profile.website,
        linkedin: profile.linkedin,
        github: profile.github,
        companyName: profile.companyName,
        companyLogo: profile.companyLogo,
        workHistory: profile.workHistory,
        education: profile.education,
        projectSpotlights: profile.projectSpotlights,
        isActive: profile.isActive,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new job board profile after signup
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request);
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const { role, displayName, firstName, lastName } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    if (!['hiring', 'open-to-work'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be "hiring" or "open-to-work"' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    if (result.profile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    const db = getDb();
    const now = new Date();

    const newProfile: JobBoardUser = {
      uid: result.uid,
      email: result.email,
      role,
      displayName: displayName || firstName || result.email.split('@')[0],
      firstName: firstName || '',
      lastName: lastName || '',
      workHistory: [],
      education: [],
      projectSpotlights: [],
      isActive: true,
      createdAt: now,
    };

    await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(result.uid).set(newProfile);

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: newProfile,
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update own profile
export async function PUT(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      displayName,
      profileImage,
      phone,
      bio,
      workHistory,
      education,
      projectSpotlights,
      companyName,
      companyLogo,
    } = body;

    // Accept social links as top-level OR nested under socialLinks
    const website = body.website ?? body.socialLinks?.website;
    const linkedin = body.linkedin ?? body.socialLinks?.linkedin;
    const github = body.github ?? body.socialLinks?.github;
    const twitter = body.twitter ?? body.socialLinks?.twitter;

    const db = getDb();

    const updateData: Partial<JobBoardUser> = { updatedAt: new Date() };
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (github !== undefined) updateData.github = github;
    if (twitter !== undefined) (updateData as Record<string, unknown>).twitter = twitter;
    if (workHistory !== undefined) updateData.workHistory = workHistory;
    if (education !== undefined) updateData.education = education;
    if (projectSpotlights !== undefined) updateData.projectSpotlights = projectSpotlights;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyLogo !== undefined) updateData.companyLogo = companyLogo;

    await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(result.uid).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a profile (cannot delete super admin)
export async function DELETE(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const { uid } = await request.json();
    const targetUid = uid || result.uid;

    // Load the target profile to check email
    const db = getDb();
    const targetDoc = await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(targetUid).get();

    if (!targetDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const targetProfile = targetDoc.data() as JobBoardUser;

    // Prevent deleting the super admin
    if (isSuperAdmin(targetProfile.email)) {
      return NextResponse.json(
        { error: 'The super admin account cannot be deleted' },
        { status: 403 }
      );
    }

    // Only the profile owner or super admin can delete
    if (targetUid !== result.uid && !result.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(targetUid).delete();

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
