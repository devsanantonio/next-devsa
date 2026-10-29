import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { buildWeeklyDigestPayload, isEventsDiscordConfigured } from '@/lib/discord';
import { gatherWeekDigestEvents } from '@/lib/weekly-digest';

/**
 * GET — what the next Monday Discord digest will post, without posting it.
 *
 * For the admin Overview. Admins and superadmins only: the digest is DEVSA's
 * channel, not a group's. Reads the same events the cron does
 * (lib/weekly-digest.ts) for the week of the next post: today, if it's Monday
 * before the 15:00 UTC run, otherwise the coming Monday.
 */
export async function GET(request: NextRequest) {
  try {
    const email = await verifiedEmail(request);
    if (!email) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }
    const adminQuery = await getDb()
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    const role = adminQuery.empty ? null : adminQuery.docs[0].data().role;
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    }

    const postsAt = nextDigestRun(new Date());
    const { events, week } = await gatherWeekDigestEvents(postsAt);

    return NextResponse.json({
      postsAt: postsAt.toISOString(),
      week,
      count: events.length,
      configured: isEventsDiscordConfigured(),
      events: events.map((e) => ({ title: e.title, date: e.date, communityName: e.communityName })),
      payload: buildWeeklyDigestPayload(events, postsAt),
    });
  } catch (error) {
    console.error('Digest preview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** The cron runs Mondays at 15:00 UTC (vercel.json). The next run from `now`. */
function nextDigestRun(now: Date): Date {
  const run = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 15, 0, 0));
  const daysToMonday = (1 - run.getUTCDay() + 7) % 7;
  run.setUTCDate(run.getUTCDate() + daysToMonday);
  if (run.getTime() <= now.getTime()) run.setUTCDate(run.getUTCDate() + 7);
  return run;
}
