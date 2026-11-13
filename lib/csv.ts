/**
 * One CSV cell, quoted, and safe to open in a spreadsheet.
 *
 * Every export holds text the public typed into a form. A cell that starts with
 * = + - @ (or a tab or carriage return) is run as a formula by Excel and Sheets
 * when an admin opens the file, so those get a leading apostrophe, which shows
 * the text as typed. Quotes are doubled. Use this for every cell, not only the
 * ones that look like free text: names and emails come from the public too.
 */
export function csvCell(value: unknown): string {
  const text = String(value ?? "")
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

const SA_TZ = "America/Chicago"

/** A date as San Antonio sees it: "Nov 12, 2026", or "2026-11-12" with `iso`. */
function saDate(date: Date | string, iso = false): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return iso
    ? d.toLocaleDateString("en-CA", { timeZone: SA_TZ }) // YYYY-MM-DD
    : d.toLocaleDateString("en-US", { timeZone: SA_TZ, month: "short", day: "numeric", year: "numeric" })
}

/**
 * The file name for an admin export, written to be read by a person: what it is, what it's
 * for, and when it was exported, in San Antonio time.
 *
 *   csvFilename("RSVPs", "Community Roundtable", eventDate)
 *     → "RSVPs - Community Roundtable (Nov 12, 2026) - exported 2026-11-13.csv"
 *
 * The names used to carry the event's Firestore id (rsvps-WtFQAC5L9f8vwQs6vpwN-2026-11-13.csv)
 * and a UTC date, so an evening export in San Antonio was stamped with tomorrow. Characters
 * that file systems refuse are dropped; the subject is capped so the name stays readable.
 */
export function csvFilename(kind: string, subject?: string | null, subjectDate?: string | Date | null): string {
  const clean = (s: string) => s.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim()
  const what = subject ? clean(subject).slice(0, 70).trim() : ""
  const when = subjectDate ? saDate(subjectDate) : ""
  const parts = [clean(kind), what && (when ? `${what} (${when})` : what), `exported ${saDate(new Date(), true)}`].filter(Boolean)
  return `${parts.join(" - ")}.csv`
}
