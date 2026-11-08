/**
 * The "Getting there" note is plain text with one allowance: **bold**, as the
 * event description uses it, so an organizer can lead with "**Parking is free.**".
 * Split into runs here so the event page and the emails render it the same way.
 */
export function arrivalNoteRuns(note: string): { text: string; bold: boolean }[] {
  return note
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4
        ? { text: part.slice(2, -2), bold: true }
        : { text: part.replace(/\*\*/g, ""), bold: false },
    )
}
