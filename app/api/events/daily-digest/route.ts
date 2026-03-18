import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { shareEventsDigestToDiscord, type DigestEvent } from '@/lib/discord';
import { shareEventsDigestToLinkedIn } from '@/lib/linkedin';

const CRON_SECRET = process.env.CRON_SECRET;

// GET - Daily digest: batch-share unshared published events to Discord & LinkedIn
// Triggered by Vercel cron (sends GET with Authorization header)
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel cron or an authorized caller
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const db = getDb();

    // Find published events that haven't been shared to Discord yet
    const snapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where('status', '==', 'published')
      .where('sharedToDiscord', '==', false)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No new events to share',
        count: 0,
      });
    }

    // Build community lookup for display names
    const communityLookup = new Map<string, string>();
    try {
      const communitiesSnapshot = await db.collection(COLLECTIONS.COMMUNITIES).get();
      communitiesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        communityLookup.set(doc.id, data.name || doc.id);
      });
    } catch {
      // Firestore unavailable for communities — proceed with IDs
    }

    // Build digest payload
    const events: (DigestEvent & { docId: string })[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const communityIds = (data.communityId || '').split(',').map((id: string) => id.trim()).filter(Boolean);
      const communityName = communityIds
        .map((id: string) => communityLookup.get(id) || data.communityName || id)
        .join(', ');

      return {
        docId: doc.id,
        title: data.title,
        slug: data.slug,
        date: data.date,
        location: data.location,
        venue: data.venue,
        communityName,
        eventType: data.eventType,
      };
    });

    // Sort by event date ascending
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Share batch to Discord and LinkedIn
    const discordResult = await shareEventsDigestToDiscord(events)
      .then(() => true)
      .catch((err) => {
        console.error('Discord events digest failed:', err);
        return false;
      });

    const linkedInResult = await shareEventsDigestToLinkedIn(events)
      .then(() => true)
      .catch((err) => {
        console.error('LinkedIn events digest failed:', err);
        return false;
      });

    // Mark events as shared
    const batch = db.batch();
    for (const event of events) {
      const docRef = db.collection(COLLECTIONS.EVENTS).doc(event.docId);
      batch.update(docRef, {
        ...(discordResult ? { sharedToDiscord: true } : {}),
        ...(linkedInResult ? { sharedToLinkedIn: true } : {}),
      });
    }
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Shared ${events.length} event${events.length !== 1 ? 's' : ''} to digest`,
      count: events.length,
      discord: discordResult,
      linkedin: linkedInResult,
    });
  } catch (error) {
    console.error('Events digest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
