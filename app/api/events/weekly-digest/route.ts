import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { shareWeeklyDigestToDiscord, type DigestEvent } from '@/lib/discord';
import { shareWeeklyDigestToLinkedIn } from '@/lib/linkedin';

const CRON_SECRET = process.env.CRON_SECRET;

// GET - Weekly digest: share this week's events to Discord & LinkedIn
// Triggered by Vercel cron every Monday at 9am CST (0 15 * * 1 UTC)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const db = getDb();

    // Calculate Monday–Sunday window in Central Time
    const now = new Date();
    // Start of today (Monday) at midnight CT
    const weekStart = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    weekStart.setHours(0, 0, 0, 0);
    // End of Sunday at 11:59:59 PM CT
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

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

    // Fetch published events
    const snapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where('status', '==', 'published')
      .get();

    // Filter to events within this week's window
    const events: DigestEvent[] = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const communityIds = (data.communityId || '').split(',').map((id: string) => id.trim()).filter(Boolean);
        const communityName = communityIds
          .map((id: string) => communityLookup.get(id) || data.communityName || id)
          .join(', ');

        return {
          title: data.title as string,
          slug: data.slug as string,
          date: data.date as string,
          location: data.location as string | undefined,
          venue: data.venue as string | undefined,
          communityName,
          eventType: data.eventType as string | undefined,
        };
      })
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= weekStart && eventDate <= weekEnd;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Post to Discord (posts even if empty — shows "no events this week")
    const discordResult = await shareWeeklyDigestToDiscord(events)
      .then(() => true)
      .catch((err) => {
        console.error('Discord weekly digest failed:', err);
        return false;
      });

    // Post to LinkedIn (skips if empty)
    const linkedInResult = await shareWeeklyDigestToLinkedIn(events)
      .then(() => true)
      .catch((err) => {
        console.error('LinkedIn weekly digest failed:', err);
        return false;
      });

    return NextResponse.json({
      success: true,
      message: `Weekly digest: ${events.length} event${events.length !== 1 ? 's' : ''} this week`,
      count: events.length,
      discord: discordResult,
      linkedin: linkedInResult,
    });
  } catch (error) {
    console.error('Weekly digest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
