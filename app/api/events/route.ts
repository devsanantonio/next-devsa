import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type Event } from '@/lib/firebase-admin';
import { techCommunities } from '@/data/communities';
import { initialCommunityEvents } from '@/data/events';

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
        // Firestore Timestamps have toDate(), regular Dates don't
        createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
      };
    }) as (Event & { id: string; communityName: string })[];

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
