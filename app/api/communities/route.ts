import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type Community, type ApprovedAdmin } from '@/lib/firebase-admin';

// GET - Fetch all communities (public)
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    const communitiesSnapshot = await db
      .collection(COLLECTIONS.COMMUNITIES)
      .orderBy('name')
      .get();

    const communities = communitiesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    return NextResponse.json({ communities, source: 'firestore' });
  } catch (error) {
    console.error('Communities fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

// POST - Create a new community (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, logo, description, website, discord, meetup, luma, instagram, twitter, linkedin, youtube, twitch, facebook, github, adminEmail } = body;

    if (!id || !name || !logo || !description || !adminEmail) {
      return NextResponse.json(
        { error: 'ID, name, logo, description, and adminEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify admin permissions
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;
    if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can create communities' },
        { status: 403 }
      );
    }

    // Check if community ID already exists
    const existingDoc = await db.collection(COLLECTIONS.COMMUNITIES).doc(id).get();
    if (existingDoc.exists) {
      return NextResponse.json(
        { error: 'Community with this ID already exists' },
        { status: 409 }
      );
    }

    const community: Community = {
      id,
      name,
      logo,
      description,
      ...(website && { website }),
      ...(discord && { discord }),
      ...(meetup && { meetup }),
      ...(luma && { luma }),
      ...(instagram && { instagram }),
      ...(twitter && { twitter }),
      ...(linkedin && { linkedin }),
      ...(youtube && { youtube }),
      ...(twitch && { twitch }),
      ...(facebook && { facebook }),
      ...(github && { github }),
      createdAt: new Date(),
    };

    // Use the ID as the document ID for easy lookup
    await db.collection(COLLECTIONS.COMMUNITIES).doc(id).set(community);

    return NextResponse.json({
      success: true,
      message: 'Community created successfully',
      community,
    });
  } catch (error) {
    console.error('Create community error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a community (admin or assigned organizer)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, logo, description, website, discord, meetup, luma, instagram, twitter, linkedin, youtube, twitch, facebook, github, adminEmail } = body;

    if (!id || !adminEmail) {
      return NextResponse.json(
        { error: 'Community ID and adminEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify permissions - admin/superadmin can edit any, organizer can only edit their own
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;
    const isAdmin = adminData.role === 'admin' || adminData.role === 'superadmin';
    const isOrganizerForCommunity = adminData.role === 'organizer' && adminData.communityId === id;

    if (!isAdmin && !isOrganizerForCommunity) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only edit your assigned community' },
        { status: 403 }
      );
    }

    // Check if community exists
    const communityRef = db.collection(COLLECTIONS.COMMUNITIES).doc(id);
    const communityDoc = await communityRef.get();

    if (!communityDoc.exists) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: Partial<Community> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name;
    if (logo !== undefined) updates.logo = logo;
    if (description !== undefined) updates.description = description;
    if (website !== undefined) updates.website = website || undefined;
    if (discord !== undefined) updates.discord = discord || undefined;
    if (meetup !== undefined) updates.meetup = meetup || undefined;
    if (luma !== undefined) updates.luma = luma || undefined;
    if (instagram !== undefined) updates.instagram = instagram || undefined;
    if (twitter !== undefined) updates.twitter = twitter || undefined;
    if (linkedin !== undefined) updates.linkedin = linkedin || undefined;
    if (youtube !== undefined) updates.youtube = youtube || undefined;
    if (twitch !== undefined) updates.twitch = twitch || undefined;
    if (facebook !== undefined) updates.facebook = facebook || undefined;
    if (github !== undefined) updates.github = github || undefined;

    await communityRef.update(updates);

    return NextResponse.json({
      success: true,
      message: 'Community updated successfully',
    });
  } catch (error) {
    console.error('Update community error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a community (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, adminEmail } = body;

    if (!id || !adminEmail) {
      return NextResponse.json(
        { error: 'Community ID and adminEmail are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify admin permissions
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;
    if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can delete communities' },
        { status: 403 }
      );
    }

    const communityRef = db.collection(COLLECTIONS.COMMUNITIES).doc(id);
    const communityDoc = await communityRef.get();

    if (!communityDoc.exists) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    await communityRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Community deleted successfully',
    });
  } catch (error) {
    console.error('Delete community error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
