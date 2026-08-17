/**
 * One source of truth for how a community-calendar event is read and rendered.
 *
 * This exists because there were two. The list on /events and the detail page
 * at /events/[slug] each carried their own copy of "when does this event end",
 * "what time is it in San Antonio" and "build me a calendar link" — and they
 * had already drifted:
 *
 *  · the list guarded against an end time that lands before its start; the
 *    detail page did not, so an event whose end date was typed as a past date
 *    showed as upcoming in the list and "Event Ended" on its own page, which
 *    also hid the RSVP form. Silent, and invisible to the organizer.
 *  · the detail page printed a hardcoded " CST" on every event. The times were
 *    right — both surfaces format in America/Chicago — but San Antonio is CDT
 *    from March to November, so most of the calendar was mislabelled.
 *  · the two .ics builders emitted different descriptions.
 *
 * Every one of those is the same bug: shared semantics living in two places.
 * Anything here is used by both surfaces, and neither should reimplement it.
 */

/**
 * The calendar is pinned to San Antonio, not to the reader.
 *
 * A 7pm Thursday meetup is Friday to a visitor in London. Grouping, labelling
 * or comparing against "today" in the reader's zone files events under days
 * nobody local would recognise, so every date operation here names this zone
 * explicitly.
 */
export const TZ = "America/Chicago"

/** The minimum an event needs for its timing to be resolved. */
export interface TimedEvent {
  date: string
  endTime?: string
}

/** Plus what a calendar entry needs to describe itself. */
export interface CalendarEvent extends TimedEvent {
  id?: string
  slug?: string
  title: string
  location: string
  description: string
  url?: string
}

export type EventStatus = "upcoming" | "happening" | "ended"

/** Two hours, the assumed length of an event that does not state one. */
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000

/**
 * When an event actually ends, as a timestamp.
 *
 * Ignores an end time that is missing, unparseable, or inverted — one that
 * lands at or before the start, which is the shape a date-picker slip takes —
 * and falls back to two hours after the start. The point is that a future event
 * with bad end data is never treated as already over.
 */
export function effectiveEndMs(event: TimedEvent): number {
  const start = new Date(event.date).getTime()
  const rawEnd = event.endTime ? new Date(event.endTime).getTime() : NaN
  return Number.isFinite(rawEnd) && rawEnd > start
    ? rawEnd
    : start + DEFAULT_DURATION_MS
}

/** Upcoming, in progress, or over — from the same clock on every surface. */
export function getEventStatus(event: TimedEvent, now: Date = new Date()): EventStatus {
  const start = new Date(event.date).getTime()
  const end = effectiveEndMs(event)
  const t = now.getTime()
  if (t >= start && t < end) return "happening"
  if (t >= end) return "ended"
  return "upcoming"
}

/** `YYYY-MM-DD` for the event's local day in San Antonio. Sorts lexically. */
export function localDayKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  // en-CA gives ISO order (2026-08-21) without hand-assembling parts.
  return d.toLocaleDateString("en-CA", { timeZone: TZ })
}

/**
 * "Thursday, August 21" — from a `localDayKey`.
 *
 * Rendered in UTC, NOT in TZ, and that is not an oversight. The key is already
 * the San Antonio calendar day; converting it again is an off-by-one, because
 * `new Date("2026-08-21")` parses as UTC midnight and that instant is 7pm on
 * the 20th in Central. Pinning the parse to midday and formatting in UTC keeps
 * the key's own date intact with clearance no offset can drag across.
 */
export function formatDayHeading(dayKey: string): string {
  return new Date(`${dayKey}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

/** "Aug 18" — from a `localDayKey`. Same UTC-midday trick as above. */
export function formatDayShort(dayKey: string): string {
  return new Date(`${dayKey}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

/**
 * The calendar day a grid cell stands for, as a `localDayKey`.
 *
 * Built from the cell's own year/month/day rather than by converting a Date,
 * because the cell is not an instant — it is a square labelled "18". Running it
 * through a timezone would move it.
 */
export function dayKeyFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** The full date, for surfaces that show one event rather than a day's worth. */
export function formatFullDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: TZ,
  })
}

/** "6:00 PM". */
export function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  })
}

/**
 * "CST" or "CDT", whichever the event actually falls in.
 *
 * Derived per event, never hardcoded. The detail page used to print a literal
 * " CST" beside every time; San Antonio observes daylight time from March to
 * November, so roughly two thirds of the calendar carried the wrong zone next
 * to a correct time — the worst version of the mistake, because the time looks
 * authoritative and the label quietly contradicts it.
 */
export function formatZoneLabel(value: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    timeZoneName: "short",
  }).formatToParts(new Date(value))
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "CT"
}

/** "Today" / "Tomorrow" where it applies, otherwise nothing. */
export function relativeDayLabel(dayKey: string, now: Date): string | null {
  if (dayKey === localDayKey(now)) return "Today"
  if (dayKey === localDayKey(new Date(now.getTime() + 86_400_000))) return "Tomorrow"
  return null
}

// ── Calendar links ──────────────────────────────────────────────────────────

/** `YYYYMMDDTHHMMSSZ`, the form both Google and ICS want. */
function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

/**
 * ICS reserves backslash, semicolon and comma inside text values, and folds
 * newlines to a literal `\n`. Neither hand-rolled builder escaped any of them,
 * so a venue like "Geekdom, 3rd Floor" or a description containing a semicolon
 * emitted a malformed property that strict parsers drop.
 */
function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

/**
 * A Google Calendar template URL and an .ics payload for one event.
 *
 * Both surfaces call this, so "add to calendar" cannot mean two different
 * things depending on which page you clicked it from — which it did: the list
 * appended "More info: <url>" to the description and the detail page did not.
 */
export function buildCalendarLinks(event: CalendarEvent, siteUrl?: string) {
  const start = new Date(event.date)
  const end = new Date(effectiveEndMs(event))

  const details = event.description + (event.url ? `\n\nMore info: ${event.url}` : "")

  const googleUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${stamp(start)}/${stamp(end)}` +
    `&location=${encodeURIComponent(event.location)}` +
    `&details=${encodeURIComponent(details)}`

  /**
   * A stable UID, which neither builder emitted. Without one, importing the
   * same event twice creates two entries in most clients instead of updating
   * the first — so a visitor who clicks .ics again after a detail changes ends
   * up with a duplicate rather than a correction.
   */
  const uid = `${event.slug || event.id || stamp(start)}@devsa.community`

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DEVSA//Community Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    // DTSTAMP is required by RFC 5545; some parsers reject a VEVENT without it.
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    `DESCRIPTION:${escapeIcs(details)}`,
    ...(siteUrl && event.slug ? [`URL:${siteUrl}/events/${event.slug}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n") // RFC 5545 wants CRLF; both builders emitted bare LF.

  return { googleUrl, icsContent }
}

/** Hand the browser an .ics download. Shared so the filename rule is one rule. */
export function downloadIcs(event: CalendarEvent, siteUrl?: string): void {
  const { icsContent } = buildCalendarLinks(event, siteUrl)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${event.slug || event.id || "event"}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
