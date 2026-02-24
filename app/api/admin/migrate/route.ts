import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, SUPER_ADMIN_EMAIL, type ApprovedAdmin, type Partner } from '@/lib/firebase-admin';
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
      communities: { migrated: 0, skipped: 0, errors: 0, message: 'Communities are now managed in Firestore directly' },
      partners: { migrated: 0, skipped: 0, errors: 0 },
      devsaSubscribers: { migrated: 0, skipped: 0, errors: 0 },
    };

    // Communities are now fully managed in Firestore - no static migration needed
    if (!migrateType || migrateType === 'communities' || migrateType === 'all') {
      // No-op: communities are already in Firestore
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

    // DevSA subscribers - already migrated to Firestore
    if (!migrateType || migrateType === 'devsa-subscribers' || migrateType === 'all') {
      const existingCount = (await db.collection(COLLECTIONS.DEVSA_SUBSCRIBERS).get()).size;
      results.devsaSubscribers.skipped = existingCount;
      results.devsaSubscribers.migrated = 0;
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
    const [communitiesSnapshot, partnersSnapshot, devsaSubsSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.COMMUNITIES).get(),
      db.collection(COLLECTIONS.PARTNERS).get(),
      db.collection(COLLECTIONS.DEVSA_SUBSCRIBERS).get(),
    ]);

    return NextResponse.json({
      firestore: {
        communities: communitiesSnapshot.size,
        partners: partnersSnapshot.size,
        devsaSubscribers: devsaSubsSnapshot.size,
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
