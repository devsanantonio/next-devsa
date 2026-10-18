import { randomBytes } from "crypto"
import { COLLECTIONS } from "@/lib/firebase-admin"
import { slugify, shortDateParts } from "@/lib/event-slug-shared"
export { RESERVED_EVENT_SLUGS, slugify, invalidCustomSlug, defaultSlugPreview } from "@/lib/event-slug-shared"

/**
 * Event addresses: /events/<slug>.
 *
 * They used to be the title plus Date.now() in base 36 —
 * /events/tech-tuesdays-mv1cvoco — which kept them unique but meant nothing to a
 * reader. Events created from 2026-10-17 get a readable default instead, and an
 * organizer can set their own in the event drawer. Older events keep the
 * addresses they were shared under.
 *
 * - Default: title + short date in San Antonio's time — tech-tuesdays-oct-20.
 *   The year is added only when that name and date are already taken (a yearly
 *   event the following year): pysanantonio-oct-2-2027. A same-day clash after
 *   that gets -2, -3.
 * - Link only (lib/event-visibility.ts): title + a random code, as before. The
 *   hard-to-guess ending is part of what keeps a private event private, so a
 *   readable default would undo it.
 * - Custom: whatever the organizer types, if it is well formed, free, and not
 *   one of the site's own pages under /events.
 *
 * A changed address is kept in the event's slugHistory, and the event page
 * redirects from it, so a link already shared never breaks.
 */

/** Whether any event, other than `exceptId`, holds this address now or held it before. */
export async function slugTaken(db: FirebaseFirestore.Firestore, slug: string, exceptId?: string): Promise<boolean> {
  const events = db.collection(COLLECTIONS.EVENTS)
  const [current, previous] = await Promise.all([
    events.where("slug", "==", slug).limit(2).get(),
    events.where("slugHistory", "array-contains", slug).limit(2).get(),
  ])
  return [...current.docs, ...previous.docs].some((d) => d.id !== exceptId)
}

/** The default address for a new event. */
export async function defaultEventSlug(
  db: FirebaseFirestore.Firestore,
  { title, date, unlisted }: { title: string; date: string; unlisted?: boolean }
): Promise<string> {
  const base = slugify(title) || "event"
  if (unlisted) return `${base}-${randomBytes(4).toString("hex")}`

  const { month, day, year } = shortDateParts(date)
  const short = `${base}-${month}-${day}`
  if (!(await slugTaken(db, short))) return short
  const withYear = `${short}-${year}`
  if (!(await slugTaken(db, withYear))) return withYear
  for (let n = 2; n < 50; n++) {
    const candidate = `${withYear}-${n}`
    if (!(await slugTaken(db, candidate))) return candidate
  }
  return `${withYear}-${randomBytes(3).toString("hex")}`
}
