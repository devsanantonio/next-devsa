import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type Event } from '@/lib/firebase-admin';

// Helper to build community lookup map from Firestore
async function buildCommunityLookup(db: FirebaseFirestore.Firestore) {
  const lookup = new Map<string, { name: string; logo: string }>();
  try {
    const communitiesSnapshot = await db.collection(COLLECTIONS.COMMUNITIES).get();
    communitiesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      lookup.set(doc.id, { name: data.name || doc.id, logo: data.logo || '' });
    });
  } catch {
    // Firestore unavailable
  }
  return lookup;
}

// Get all events
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const includeAll = request.nextUrl.searchParams.get('includeAll') === 'true';
    
    // Build merged community lookup (static + Firestore)
    const communityLookup = await buildCommunityLookup(db);
    
    // For admin dashboard, fetch all events including drafts
    // For public pages, only fetch published events
    let eventsSnapshot;
    if (includeAll) {
      eventsSnapshot = await db.collection(COLLECTIONS.EVENTS).get();
    } else {
      eventsSnapshot = await db
        .collection(COLLECTIONS.EVENTS)
        .where('status', '==', 'published')
        .get();
    }

    const firestoreEvents = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      const community = communityLookup.get(data.communityId);
      return {
        id: doc.id,
        ...data,
        communityName: community?.name || 'DEVSA Community',
        communityLogo: community?.logo || '',
        isStatic: false, // Firestore events can be edited/deleted
        // Firestore Timestamps have toDate(), regular Dates don't
        createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
      };
    }) as (Event & { id: string; communityName: string; communityLogo: string; isStatic: boolean })[];

    // Sort by date
    firestoreEvents.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    return NextResponse.json({ events: firestoreEvents });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, date, endTime, location, venue, address, description, communityId, status, eventType, rsvpEnabled, organizerEmail } = body;

    if (!title || !date || !description || !communityId || !organizerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Compute location from venue + address if not provided directly
    const computedLocation = location || (venue && address ? `${venue}, ${address}` : venue || address || '');

    // Verify organizer is an approved admin/organizer
    const db = getDb();
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', organizerEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - organizer access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data();

    // If organizer role, check community access
    if (adminData.role === 'organizer' && adminData.communityId !== communityId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only create events for your community' },
        { status: 403 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    const event: Event = {
      title,
      slug,
      date,
      endTime, // Optional end time for "Happening Now" feature
      location: computedLocation,
      venue: venue || '',
      address: address || '',
      description,
      communityId,
      organizerEmail: organizerEmail.toLowerCase(),
      status: status === 'draft' ? 'draft' : 'published',
      eventType: eventType || 'in-person',
      rsvpEnabled: rsvpEnabled || false,
      createdAt: new Date(),
    };

    const docRef = await db.collection(COLLECTIONS.EVENTS).add(event);

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      eventId: docRef.id,
      slug,
    });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update an existing event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, title, date, endTime, location, venue, address, description, status, eventType, rsvpEnabled, organizerEmail } = body;

    if (!eventId || !organizerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify organizer is an approved admin/organizer
    const db = getDb();
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', organizerEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - organizer access required' },
        { status: 403 }
      );
    }

    // Get the event to check permissions
    const eventDoc = await db.collection(COLLECTIONS.EVENTS).doc(eventId).get();
    
    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const adminData = adminQuery.docs[0].data();
    const eventData = eventDoc.data();

    // If organizer role, check community access
    if (adminData.role === 'organizer' && adminData.communityId !== eventData?.communityId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only edit events for your community' },
        { status: 403 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (date) updateData.date = date;
    if (endTime) updateData.endTime = endTime;
    if (location) updateData.location = location;
    if (typeof venue === 'string') updateData.venue = venue;
    if (typeof address === 'string') updateData.address = address;
    // Recompute location if venue or address changed
    if (typeof venue === 'string' || typeof address === 'string') {
      const newVenue = typeof venue === 'string' ? venue : eventData?.venue || '';
      const newAddress = typeof address === 'string' ? address : eventData?.address || '';
      if (newVenue && newAddress) {
        updateData.location = `${newVenue}, ${newAddress}`;
      } else {
        updateData.location = newVenue || newAddress || location || eventData?.location || '';
      }
    }
    if (description) updateData.description = description;
    if (status && (status === 'published' || status === 'draft')) updateData.status = status;
    if (typeof rsvpEnabled === 'boolean') updateData.rsvpEnabled = rsvpEnabled;
    if (eventType && ['in-person', 'hybrid', 'virtual'].includes(eventType)) updateData.eventType = eventType;

    await db.collection(COLLECTIONS.EVENTS).doc(eventId).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete an event
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, organizerEmail } = body;

    if (!eventId || !organizerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify organizer is an approved admin/organizer
    const db = getDb();
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', organizerEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - organizer access required' },
        { status: 403 }
      );
    }

    // Get the event to check permissions
    const eventDoc = await db.collection(COLLECTIONS.EVENTS).doc(eventId).get();
    
    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const adminData = adminQuery.docs[0].data();
    const eventData = eventDoc.data();

    // If organizer role, check community access
    if (adminData.role === 'organizer' && adminData.communityId !== eventData?.communityId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only delete events for your community' },
        { status: 403 }
      );
    }

    await db.collection(COLLECTIONS.EVENTS).doc(eventId).delete();

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Audit and fix invalid communityIds
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, organizerEmail, eventId, newCommunityId } = body;

    if (!organizerEmail) {
      return NextResponse.json(
        { error: 'Missing organizerEmail' },
        { status: 400 }
      );
    }

    // Verify user is an admin (not just organizer)
    const db = getDb();
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', organizerEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data();
    if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can audit/fix events' },
        { status: 403 }
      );
    }

    // Action: audit - find all events with invalid communityIds
    if (action === 'audit') {
      // Build merged community lookup for validation
      const communityLookup = await buildCommunityLookup(db);
      const eventsSnapshot = await db.collection(COLLECTIONS.EVENTS).get();
      
      const auditResults = eventsSnapshot.docs.map(doc => {
        const data = doc.data();
        const communityId = data.communityId;
        const isValid = communityLookup.has(communityId);
        const community = communityLookup.get(communityId);
        
        return {
          id: doc.id,
          title: data.title,
          slug: data.slug,
          communityId,
          communityName: community?.name || null,
          isValid,
          status: data.status,
        };
      });

      const invalidEvents = auditResults.filter(e => !e.isValid);
      const validEvents = auditResults.filter(e => e.isValid);

      return NextResponse.json({
        summary: {
          total: auditResults.length,
          valid: validEvents.length,
          invalid: invalidEvents.length,
        },
        invalidEvents,
        validCommunityIds: Array.from(communityLookup.entries()).map(([id, c]) => ({ id, name: c.name })),
      });
    }

    // Action: fix - update a specific event's communityId
    if (action === 'fix') {
      if (!eventId || !newCommunityId) {
        return NextResponse.json(
          { error: 'Missing eventId or newCommunityId' },
          { status: 400 }
        );
      }

      // Build merged community lookup for validation
      const communityLookup = await buildCommunityLookup(db);
      if (!communityLookup.has(newCommunityId)) {
        return NextResponse.json(
          { error: `Invalid newCommunityId. Must be one of: ${Array.from(communityLookup.keys()).join(', ')}` },
          { status: 400 }
        );
      }

      const eventDoc = await db.collection(COLLECTIONS.EVENTS).doc(eventId).get();
      if (!eventDoc.exists) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      await db.collection(COLLECTIONS.EVENTS).doc(eventId).update({
        communityId: newCommunityId,
        updatedAt: new Date(),
      });

      const community = communityLookup.get(newCommunityId);

      return NextResponse.json({
        success: true,
        message: `Event communityId updated to "${newCommunityId}" (${community?.name})`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "audit" or "fix"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Event audit/fix error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
