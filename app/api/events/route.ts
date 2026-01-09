import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type Event } from '@/lib/firebase-admin';
import { techCommunities } from '@/data/communities';
import { initialCommunityEvents } from '@/data/events';

// Valid community IDs for validation
const validCommunityIds = new Set(techCommunities.map(c => c.id));

// Get all events
export async function GET() {
  try {
    const db = getDb();
    // Fetch all published events without server-side ordering to avoid index requirement
    const eventsSnapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where('status', '==', 'published')
      .get();

    const firestoreEvents = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      const community = techCommunities.find(c => c.id === data.communityId);
      return {
        id: doc.id,
        ...data,
        communityName: community?.name || 'DEVSA Community',
        isStatic: false, // Firestore events can be edited/deleted
        // Firestore Timestamps have toDate(), regular Dates don't
        createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
      };
    }) as (Event & { id: string; communityName: string; isStatic: boolean })[];

    // Also include static events from data/events.ts
    const staticEvents = initialCommunityEvents.map(event => {
      const community = techCommunities.find(c => c.id === event.communityTag);
      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        date: event.date,
        location: event.location,
        description: event.description,
        url: event.url,
        communityId: event.communityTag,
        communityName: community?.name || 'DEVSA Community',
        source: event.source || 'manual',
        status: 'published' as const,
        isStatic: true, // Static events from data/events.ts cannot be edited/deleted via API
      };
    });

    // Merge events, preferring Firestore events over static ones with same slug
    const firestoreSlugs = new Set(firestoreEvents.map(e => e.slug));
    const mergedEvents = [
      ...firestoreEvents,
      ...staticEvents.filter(e => e.slug && !firestoreSlugs.has(e.slug)),
    ];

    // Sort by date
    mergedEvents.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    return NextResponse.json({ events: mergedEvents });
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
    const { title, date, location, description, url, communityId, source, organizerEmail } = body;

    if (!title || !date || !location || !description || !communityId || !organizerEmail) {
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
      location,
      description,
      url,
      communityId,
      organizerEmail: organizerEmail.toLowerCase(),
      source: source || 'manual',
      status: 'published',
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
    const { eventId, title, date, location, description, url, organizerEmail } = body;

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
    if (location) updateData.location = location;
    if (description) updateData.description = description;
    if (url !== undefined) updateData.url = url;

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
      const eventsSnapshot = await db.collection(COLLECTIONS.EVENTS).get();
      
      const auditResults = eventsSnapshot.docs.map(doc => {
        const data = doc.data();
        const communityId = data.communityId;
        const isValid = validCommunityIds.has(communityId);
        const community = techCommunities.find(c => c.id === communityId);
        
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
        validCommunityIds: techCommunities.map(c => ({ id: c.id, name: c.name })),
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

      if (!validCommunityIds.has(newCommunityId)) {
        return NextResponse.json(
          { error: `Invalid newCommunityId. Must be one of: ${[...validCommunityIds].join(', ')}` },
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

      const community = techCommunities.find(c => c.id === newCommunityId);

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
