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
