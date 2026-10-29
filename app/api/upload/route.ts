import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { put, del } from '@vercel/blob';
import { getDb, COLLECTIONS, type ApprovedAdmin } from '@/lib/firebase-admin';
import { isProfilePhotoUrl, PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from '@/lib/profile-photo';

/**
 * `purpose=profile`: the signed-in person's own photo (lib/profile-photo.ts).
 * Filed under their admin record's id, which comes from the token and never
 * from the form, so nobody can replace anyone else's. Unlike logos, it saves
 * the record here and deletes the photo it replaces: there is no form to
 * submit, and replaced photos would otherwise pile up in Blob.
 */
async function uploadProfilePhoto(file: File, record: FirebaseFirestore.QueryDocumentSnapshot) {
  if (!(PROFILE_PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: 'Use a JPEG, PNG or WebP photo' }, { status: 400 });
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 });
  }
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  // A random suffix keeps the address unguessable: the file is public to anyone who has it.
  const blob = await put(`profiles/${record.id}.${extension}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });
  const previous = record.data().profileImage;
  await record.ref.update({ profileImage: blob.url });
  if (isProfilePhotoUrl(previous) && previous !== blob.url) {
    await del(previous).catch((err) => console.error('Old profile photo not deleted:', err));
  }
  return NextResponse.json({ success: true, url: blob.url });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const adminEmail = await verifiedEmail(request);
    const communityId = formData.get('communityId') as string;
    // Partner logos land in their own prefix. Without this every upload went to
    // `communities/`, so a partner logo would have been filed under a community
    // id it has nothing to do with.
    const partnerId = formData.get('partnerId') as string | null;

    if (!file || !adminEmail) {
      return NextResponse.json(
        { error: 'File and adminEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify permissions
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (formData.get('purpose') === 'profile') {
      return uploadProfilePhoto(file, adminQuery.docs[0]);
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;
    const isAdmin = adminData.role === 'admin' || adminData.role === 'superadmin';

    if (partnerId !== null) {
      // Partners are admin-managed — there is no organizer scoped to one, so
      // the organizer branch below must not be reachable for them. An organizer
      // passing a partnerId would otherwise fall through to the community check
      // and pass it whenever their own communityId happened to be empty.
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized - only admins can upload partner logos' },
          { status: 403 }
        );
      }
    } else {
      const isOrganizerForCommunity =
        adminData.role === 'organizer' && adminData.communityId === communityId;

      if (!isAdmin && !isOrganizerForCommunity) {
        return NextResponse.json(
          { error: 'Unauthorized - you can only upload for your assigned community' },
          { status: 403 }
        );
      }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG, GIF' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const extension = file.name.split('.').pop() || 'png';
    const filename =
      partnerId !== null
        ? `partners/${partnerId || 'new'}-${Date.now()}.${extension}`
        : `communities/${communityId || 'new'}-${Date.now()}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
