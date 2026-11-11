import { NextResponse } from 'next/server';
import { calendarRecord } from '@/lib/calendar-record';

/**
 * GET: the community calendar's record since 2024 ("600+"), for the homepage's
 * opening statement, which is a client tree and can't read Firestore itself.
 * Read-only and public; no BotID, since nothing is written or sent. The same
 * figure /about shows (lib/calendar-record.ts).
 *
 * Revalidated every five minutes: it's a total, not an admin record, so a few
 * minutes behind is fine.
 */
export const revalidate = 300;

export async function GET() {
  const record = await calendarRecord();
  return NextResponse.json({ eventsSince2024: record?.since2024 ?? null });
}
