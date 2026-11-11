import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { isListed } from '@/lib/event-visibility';

/**
 * The community calendar's record since 2024, for the About page's timeline.
 *
 * Before devsa.community the calendar ran on Luma (luma.com/devSA), read from
 * Luma's public feed on 2026-11-10: 214 events in 2024, 204 in 2025, and 8 in
 * early 2026 that never moved to devsa.community (7 more did, and count once,
 * here). DEVSA's first own event was Coffee & Collaboration, April 17, 2024.
 * The raw list is in ~/Downloads/devsa-records, outside the repo.
 *
 * This year's count is read live, so the total moves with the calendar. It is
 * shown as a floor to the hundred ("600+"): matching moved events by title
 * could miss a renamed one, and a floor stays true either way.
 */
const LUMA_EVENTS = 214 + 204 + 8;

export async function calendarRecord(now = new Date()): Promise<{ thisYear: number; since2024: string } | null> {
  const year = now.getFullYear();
  try {
    const snap = await getDb()
      .collection(COLLECTIONS.EVENTS)
      .where('date', '>=', `${year}-01-01`)
      .where('date', '<', `${year + 1}-01-01`)
      .select('unlisted', 'status')
      .get();
    const thisYear = snap.docs.map((d) => d.data()).filter((e) => isListed(e) && e.status === 'published').length;
    const total = LUMA_EVENTS + thisYear;
    return { thisYear, since2024: `${(Math.floor(total / 100) * 100).toLocaleString('en-US')}+` };
  } catch (err) {
    console.error('calendar record:', err);
    return null;
  }
}
