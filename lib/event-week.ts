/**
 * Weeks on the community calendar, in San Antonio's time: Monday to Sunday,
 * as day keys. Shared by the Monday Discord digest and the weekly social
 * graphic, so the post and the image always mean the same seven days.
 */

const TZ = 'America/Chicago';

/** `YYYY-MM-DD` for an instant, as the calendar day it falls on in San Antonio. */
const dayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * The seven Central-time day keys of the week `now` falls in, Monday
 * first.
 *
 * Day keys rather than a pair of timestamps, and this is the part the previous
 * version got wrong. It did:
 *
 *     new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
 *
 * `toLocaleString` returns a wall-clock string with no offset in it, so
 * `new Date` parses it back in the *server's* zone — UTC on Vercel. The result
 * was a Date five or six hours off, and `setHours(0,0,0,0)` then pinned
 * midnight UTC rather than midnight Central. The window ran Sunday evening to
 * Saturday evening: it swept in events from the night before the week began
 * and cut off most of its final Sunday.
 *
 * Comparing day keys sidesteps offsets entirely, and matches how the calendar
 * itself groups events. The arithmetic runs from noon UTC because a civil day
 * is never shorter than 23 hours, so ±12h never lands on a neighboring date
 * however the clocks move.
 */
export function centralWeekDayKeys(now: Date): string[] {
  const noon = new Date(`${dayKeyFmt.format(now)}T12:00:00Z`);
  const backToMonday = (noon.getUTCDay() + 6) % 7; // 0 on a Monday
  const monday = noon.getTime() - backToMonday * 86_400_000;
  return Array.from({ length: 7 }, (_, i) =>
    new Date(monday + i * 86_400_000).toISOString().slice(0, 10),
  );
}

export function centralDayKey(at: Date): string {
  return dayKeyFmt.format(at);
}

/**
 * The week a "this week" graphic means on a given day: the current week on a
 * Monday, otherwise the one starting next Monday. Made on a Wednesday or a
 * Sunday, it is the week ahead.
 */
export function upcomingWeekDayKeys(now: Date): string[] {
  const keys = centralWeekDayKeys(now);
  if (keys[0] === centralDayKey(now)) return keys;
  return centralWeekDayKeys(new Date(new Date(`${keys[0]}T12:00:00Z`).getTime() + 7 * 86_400_000));
}
