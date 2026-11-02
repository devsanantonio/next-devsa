import { NextRequest, NextResponse } from 'next/server';
import {
  buildWeeklyDigestPayload,
  isEventsDiscordConfigured,
  shareWeeklyDigestToDiscord,
} from '@/lib/discord';
import { gatherWeekDigestEvents } from '@/lib/weekly-digest';
import { GET as renderWeekGraphic } from '@/app/api/og/week/social/route';

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * The week's social graphic as PNG bytes, rendered by the graphic's own route
 * handler so Discord gets exactly what /api/og/week/social draws. Fails soft:
 * a graphic that will not render costs the post its image, never the post.
 */
async function weekGraphic(origin: string, week: string): Promise<ArrayBuffer | null> {
  try {
    const res = await renderWeekGraphic(new NextRequest(`${origin}/api/og/week/social?week=${week}`));
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.arrayBuffer();
  } catch (err) {
    console.error('Weekly graphic render failed; posting without it:', err);
    return null;
  }
}

/**
 * GET — posts this week's calendar to the DEVSA Discord, with the week's
 * "This week" social graphic attached as the card's image.
 *
 * Registered in vercel.json and therefore publicly reachable, so it checks
 * CRON_SECRET before doing any work.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { events, week } = await gatherWeekDigestEvents();

    /* `?dry=1` returns the message instead of sending it.
    
       Still behind CRON_SECRET, so it is no more reachable than the cron
       itself. It exists because the alternative way to check a change to this
       layout is to post it to a channel real people read, and then post the
       correction underneath. */
    if (request.nextUrl.searchParams.get('dry') === '1') {
      return NextResponse.json({
        dryRun: true,
        count: events.length,
        week,
        // On the dry path too, so "is the webhook set in this environment?"
        // can be answered without posting to a live channel to find out.
        configured: isEventsDiscordConfigured(),
        payload: buildWeeklyDigestPayload(events),
        // What the post will carry as its image. Open it to check the week.
        graphic: `${request.nextUrl.origin}/api/og/week/social?week=${week}`,
      });
    }

    // Posts even when the week is empty — a quiet week is worth saying out
    // loud, and silence is indistinguishable from the cron having failed.
    const graphic = isEventsDiscordConfigured() ? await weekGraphic(request.nextUrl.origin, week) : null;
    const posted = await shareWeeklyDigestToDiscord(events, graphic)
      .then(() => true)
      .catch((err) => {
        console.error('Discord weekly digest failed:', err);
        return false;
      });

    return NextResponse.json({
      success: true,
      message: `Weekly digest: ${events.length} event${events.length !== 1 ? 's' : ''} this week`,
      count: events.length,
      week,
      /* Reported separately from `discord`, because on its own that flag
         cannot tell "posted" from "skipped, no webhook set" — the sender fails
         soft and returns without throwing either way. Which is precisely the
         state this endpoint gets checked for after a deploy. */
      configured: isEventsDiscordConfigured(),
      discord: posted,
      graphic: !!graphic,
    });
  } catch (error) {
    console.error('Weekly digest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
