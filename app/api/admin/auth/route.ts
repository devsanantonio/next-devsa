import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { logActivity } from '@/lib/activity-log';
import { getDb, COLLECTIONS, type ApprovedAdmin, type AccessRequest } from '@/lib/firebase-admin';
import { isProtectedAdmin } from '@/lib/protected-admins';
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from '@/lib/resend';
import { AccessApprovedEmail } from '@/lib/emails/access-approved';
import { cleanText, cleanEmail, cleanLinkedin, groupsOf } from '@/lib/organizer-directory';
import { isProfilePhotoUrl } from '@/lib/profile-photo';
import { del } from '@vercel/blob';

// Check if user is an approved admin
export async function GET(request: NextRequest) {
  try {
    const email = await verifiedEmail(request);

    if (!email) {
      return NextResponse.json(
        { error: 'Sign in required' },
        { status: 401 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const db = getDb();

    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json({
        isAdmin: false,
      });
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;

    /**
     * Stamp the login.
     *
     * This check IS the login for this app — signing in is an email matched
     * against this collection, with the session then restored from
     * localStorage, so there is no other moment that means "they are here".
     *
     * Throttled to fifteen minutes so a page refresh does not cost a write on
     * every load. That makes the value accurate to the quarter hour, which is
     * the right resolution for a column answering "is this person still using
     * the admin".
     *
     * Fire-and-forget, and deliberately not awaited: a failed write must never
     * stop someone signing in. The worst case is a stale timestamp.
     */
    const lastLogin = adminData.lastLoginAt as unknown as { toDate?: () => Date } | undefined;
    const lastLoginMs = lastLogin?.toDate?.()?.getTime() ?? 0;
    if (Date.now() - lastLoginMs > 15 * 60 * 1000) {
      adminQuery.docs[0].ref
        .update({ lastLoginAt: new Date() })
        .catch((err) => console.error('Failed to stamp admin login:', err));
    }

    return NextResponse.json({
      isAdmin: true,
      role: adminData.role,
      communityId: adminData.communityId,
      firstName: adminData.firstName || null,
      lastName: adminData.lastName || null,
      profileImage: isProfilePhotoUrl(adminData.profileImage) ? adminData.profileImage : null,
      // The organizer directory profile; see lib/organizer-directory.ts.
      title: adminData.title ?? null,
      contactEmail: adminData.contactEmail ?? null,
      linkedin: adminData.linkedin ?? null,
      gradTerm: adminData.gradTerm ?? null,
      inDirectory: adminData.inDirectory === true,
      profileConfirmedAt:
        (adminData.profileConfirmedAt as unknown as { toDate?: () => Date } | undefined)?.toDate?.()?.toISOString() ?? null,
      // An admin's own groups: each is an organizer view in the account menu. Empty for organizers.
      groups: adminData.role === 'organizer' ? [] : groupsOf(adminData),
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add a new approved admin (requires existing admin auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, communityId } = body;
    const approverEmail = await verifiedEmail(request);
    // The groups an admin also runs, set by another admin from Manage Admins. Only
    // real groups are kept, and only for admin roles: an organizer has one group.
    const wantsGroups = Array.isArray(body.organizerOf) && role !== 'organizer';

    if (!email || !role || !approverEmail) {
      return NextResponse.json(
        { error: 'Email, role, and approverEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if approver is an admin or superadmin
    const approverQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', approverEmail.toLowerCase())
      .limit(1)
      .get();

    if (approverQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can add new admins' },
        { status: 403 }
      );
    }

    const approverData = approverQuery.docs[0].data() as ApprovedAdmin;
    if (approverData.role !== 'admin' && approverData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can add new admins' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Protect super admin from having their role changed
    if (isProtectedAdmin(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Cannot modify super admin account' },
        { status: 403 }
      );
    }

    // Check if already exists
    const existingQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    let organizerOf: string[] | null = null;
    if (wantsGroups) {
      const ids = [...new Set((body.organizerOf as unknown[]).filter((id): id is string => typeof id === 'string' && id.length > 0))].slice(0, 10);
      const found = await Promise.all(ids.map((id) => db.collection(COLLECTIONS.COMMUNITIES).doc(id).get()));
      organizerOf = ids.filter((_, i) => found[i].exists);
    }

    if (!existingQuery.empty) {
      // Update existing
      const was = existingQuery.docs[0].data() as ApprovedAdmin;
      await existingQuery.docs[0].ref.update({
        role,
        communityId: communityId ?? null,
        ...(role === 'organizer' ? { organizerOf: null } : organizerOf ? { organizerOf } : {}),
        approvedAt: new Date(),
        approvedBy: approverEmail,
      });
      await logActivity({
        actor: approverEmail.toLowerCase(),
        action: 'updated',
        kind: 'admin',
        targetId: existingQuery.docs[0].id,
        label: normalizedEmail,
        changes: {
          ...(was.role !== role ? { role: [was.role, role] as [string, string] } : {}),
          ...((was.communityId ?? '') !== (communityId ?? '') ? { communityId: [was.communityId || '—', communityId || '—'] as [string, string] } : {}),
          ...(organizerOf && JSON.stringify(was.organizerOf ?? []) !== JSON.stringify(organizerOf)
            ? { organizerOf: [(was.organizerOf ?? []).join(', ') || '—', organizerOf.join(', ') || '—'] as [string, string] }
            : {}),
        },
      });
      return NextResponse.json({
        success: true,
        message: 'Admin updated successfully',
      });
    }

    // Create new approved admin (filter out undefined values for Firestore)
    const approvedAdmin: ApprovedAdmin = {
      email: normalizedEmail,
      approvedAt: new Date(),
      approvedBy: approverEmail,
      role,
      ...(communityId && { communityId }),
      ...(organizerOf && organizerOf.length ? { organizerOf } : {}),
    };

    const added = await db.collection(COLLECTIONS.APPROVED_ADMINS).add(approvedAdmin);
    await logActivity({ actor: approverEmail.toLowerCase(), action: 'approved', kind: 'admin', targetId: added.id, label: normalizedEmail, detail: role + (communityId ? ` · ${communityId}` : '') });

    // Update access request status if exists and get user info for email
    const accessRequestQuery = await db
      .collection(COLLECTIONS.ACCESS_REQUESTS)
      .where('email', '==', normalizedEmail)
      .get();

    let userName: string | undefined;
    let userCommunityOrg: string | undefined;

    for (const doc of accessRequestQuery.docs) {
      const requestData = doc.data() as AccessRequest;
      userName = requestData.name;
      userCommunityOrg = requestData.communityOrg;
      await doc.ref.update({ status: 'approved' });
    }

    // Send approval notification email
    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalizedEmail,
          replyTo: EMAIL_REPLY_TO,
          subject: "Your DEVSA organizer access is approved",
          html: AccessApprovedEmail({
            name: userName,
            email: normalizedEmail,
            communityOrg: userCommunityOrg,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin added successfully',
    });
  } catch (error) {
    console.error('Add admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove an admin
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    const approverEmail = await verifiedEmail(request);

    if (!email || !approverEmail) {
      return NextResponse.json(
        { error: 'Email and approverEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if approver is an admin or superadmin
    const approverQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', approverEmail.toLowerCase())
      .limit(1)
      .get();

    if (approverQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can remove admins' },
        { status: 403 }
      );
    }

    const approverData = approverQuery.docs[0].data() as ApprovedAdmin;
    if (approverData.role !== 'admin' && approverData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can remove admins' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Protect super admin from being removed
    if (isProtectedAdmin(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Cannot remove super admin account' },
        { status: 403 }
      );
    }

    // Find and delete
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    const removed = adminQuery.docs[0].data();
    await adminQuery.docs[0].ref.delete();
    await logActivity({ actor: approverEmail.toLowerCase(), action: 'removed', kind: 'admin', targetId: adminQuery.docs[0].id, label: normalizedEmail, detail: removed.role + (removed.communityId ? ` · ${removed.communityId}` : '') });

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully',
    });
  } catch (error) {
    console.error('Remove admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update admin profile: name and photo, and the organizer directory fields
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    // Your own profile only: the email is the signed-in one, not a field.
    const { firstName, lastName, profileImage, title, contactEmail, linkedin, gradTerm, inDirectory, organizerOf } = body;
    const email = await verifiedEmail(request);

    if (!email) {
      return NextResponse.json(
        { error: 'Sign in required' },
        { status: 401 }
      );
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase();

    // Find the admin record
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Update profile fields
    const updateData: Partial<ApprovedAdmin> = {};
    if (firstName !== undefined) updateData.firstName = cleanText(firstName, 60) ?? '';
    if (lastName !== undefined) updateData.lastName = cleanText(lastName, 60) ?? '';
    // A photo is set only by uploading one (/api/upload, purpose=profile). Here it can
    // only be removed, so no other address can ever be stored as someone's photo.
    let removedPhoto: string | null = null;
    if (profileImage === null || profileImage === '') {
      const current = adminQuery.docs[0].data().profileImage;
      updateData.profileImage = null;
      if (isProfilePhotoUrl(current)) removedPhoto = current;
    }

    // The directory fields. Other organizers click these, so a malformed email or
    // a non-LinkedIn URL is refused rather than stored.
    if (contactEmail !== undefined) {
      const email = cleanEmail(contactEmail);
      if (email === 'invalid') {
        return NextResponse.json({ error: "That contact email doesn't look right" }, { status: 400 });
      }
      updateData.contactEmail = email;
    }
    if (linkedin !== undefined) {
      const url = cleanLinkedin(linkedin);
      if (url === 'invalid') {
        return NextResponse.json({ error: 'LinkedIn needs to be a linkedin.com profile link' }, { status: 400 });
      }
      updateData.linkedin = url;
    }
    if (title !== undefined) updateData.title = cleanText(title, 60);
    if (gradTerm !== undefined) updateData.gradTerm = cleanText(gradTerm, 30);
    if (inDirectory !== undefined) updateData.inDirectory = inDirectory === true;

    // The groups an admin also runs. Admins only: an organizer's group is set by
    // whoever approved them, and isn't theirs to widen. Ids must be real groups.
    const me = adminQuery.docs[0].data() as ApprovedAdmin;
    if (organizerOf !== undefined && me.role !== 'organizer') {
      const wanted = Array.isArray(organizerOf)
        ? [...new Set(organizerOf.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0))].slice(0, 10)
        : [];
      const found = await Promise.all(wanted.map((id) => db.collection(COLLECTIONS.COMMUNITIES).doc(id).get()));
      updateData.organizerOf = wanted.filter((_, i) => found[i].exists);
    }
    // Any save is a confirmation that the profile is current; the directory shows its age.
    const touchesDirectory = [title, contactEmail, linkedin, gradTerm, inDirectory, firstName, lastName].some((v) => v !== undefined);
    if (touchesDirectory) updateData.profileConfirmedAt = new Date();

    await adminQuery.docs[0].ref.update(updateData);
    if (removedPhoto) {
      await del(removedPhoto).catch((err) => console.error('Removed profile photo not deleted:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      firstName: updateData.firstName ?? null,
      lastName: updateData.lastName ?? null,
      profileImage: updateData.profileImage === null ? null : undefined,
      profileConfirmedAt: updateData.profileConfirmedAt?.toISOString() ?? null,
      groups: me.role === 'organizer' ? [] : groupsOf({ ...me, ...updateData }),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
