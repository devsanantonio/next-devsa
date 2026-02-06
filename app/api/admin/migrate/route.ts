import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, SUPER_ADMIN_EMAIL, type ApprovedAdmin, type Community, type Partner } from '@/lib/firebase-admin';
import { techCommunities } from '@/data/communities';
import { partners } from '@/data/partners';

// POST - Migrate static data to Firestore (super admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, migrateType } = body;

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required' },
        { status: 400 }
      );
    }

    // Only super admin can run migrations
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized - only super admin can run migrations' },
        { status: 403 }
      );
    }

    const db = getDb();
    const results = {
      communities: { migrated: 0, skipped: 0, errors: 0 },
      partners: { migrated: 0, skipped: 0, errors: 0 },
    };

    // Migrate communities
    if (!migrateType || migrateType === 'communities' || migrateType === 'all') {
      for (const community of techCommunities) {
        try {
          const docRef = db.collection(COLLECTIONS.COMMUNITIES).doc(community.id);
          const existing = await docRef.get();

          if (existing.exists) {
            results.communities.skipped++;
            continue;
          }

          const communityData: Community = {
            id: community.id,
            name: community.name,
            logo: community.logo,
            description: community.description,
            ...(community.website && { website: community.website }),
            ...(community.discord && { discord: community.discord }),
            ...(community.meetup && { meetup: community.meetup }),
            ...(community.luma && { luma: community.luma }),
            ...(community.instagram && { instagram: community.instagram }),
            ...(community.twitter && { twitter: community.twitter }),
            createdAt: new Date(),
          };

          await docRef.set(communityData);
          results.communities.migrated++;
        } catch (error) {
          console.error(`Failed to migrate community ${community.id}:`, error);
          results.communities.errors++;
        }
      }
    }

    // Migrate partners
    if (!migrateType || migrateType === 'partners' || migrateType === 'all') {
      for (const partner of partners) {
        try {
          const docRef = db.collection(COLLECTIONS.PARTNERS).doc(partner.id);
          const existing = await docRef.get();

          if (existing.exists) {
            results.partners.skipped++;
            continue;
          }

          const partnerData: Partner = {
            id: partner.id,
            name: partner.name,
            logo: partner.logo,
            description: partner.description,
            ...(partner.website && { website: partner.website }),
            ...(partner.video && { video: partner.video }),
            ...(partner.isEasterEgg && { isEasterEgg: partner.isEasterEgg }),
            createdAt: new Date(),
          };

          await docRef.set(partnerData);
          results.partners.migrated++;
        } catch (error) {
          console.error(`Failed to migrate partner ${partner.id}:`, error);
          results.partners.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check migration status
export async function GET(request: NextRequest) {
  try {
    const adminEmail = request.nextUrl.searchParams.get('adminEmail');

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required' },
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
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;
    if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    // Get counts
    const [communitiesSnapshot, partnersSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.COMMUNITIES).get(),
      db.collection(COLLECTIONS.PARTNERS).get(),
    ]);

    return NextResponse.json({
      firestore: {
        communities: communitiesSnapshot.size,
        partners: partnersSnapshot.size,
      },
      static: {
        communities: techCommunities.length,
        partners: partners.length,
      },
      isMigrated: communitiesSnapshot.size > 0 && partnersSnapshot.size > 0,
    });
  } catch (error) {
    console.error('Migration status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
