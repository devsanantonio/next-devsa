/**
 * Subscribe links for the community calendar feed, each carrying its own code.
 *
 * Subscribing to an .ics feed signs nobody up: the calendar app is handed an
 * address and polls it on its own schedule, so there was no way to say how many
 * people get DEVSA's events in their calendar. Every Subscribe dialog now hands
 * out a feed address with a random `s` code, and /api/events/calendar records
 * each code when the app polls. Distinct codes polled recently is the count —
 * see /api/admin/calendar-subscribers for how "active" is decided.
 *
 * The code is random and tied to nothing: no name, email or device. It exists
 * only so two polls from the same subscription can be recognized as one.
 *
 * Subscriptions made before this existed use the bare address and are not
 * counted; the number starts from zero and grows.
 *
 * Client-safe: no server imports.
 */

/** 10 lowercase hex characters. Checked again on the server before it is stored. */
export const SUBSCRIBE_CODE = /^[a-f0-9]{10}$/

export function newSubscribeCode(): string {
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function calendarSubscribeLinks(origin: string, code: string) {
  const feed = `${origin}/api/events/calendar?s=${code}`
  const webcal = feed.replace(/^https?:\/\//, "webcal://")
  return {
    feed,
    webcal,
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feed)}&name=${encodeURIComponent("DEVSA Community Events")}`,
  }
}
