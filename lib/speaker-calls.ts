/**
 * Group calls for speakers: a community group's standing "we're looking for
 * talks" call, which its organizers open and close from the admin.
 *
 * A group's submissions live in the same speaker_submissions collection as the
 * conferences', keyed `group:<communityId>`. That one prefix is what lets the
 * existing pieces carry them unchanged: hostedEventIdsFor() adds it to an
 * organizer's scope, so the Speakers tab, its review controls and the decision
 * emails all work without a second path.
 *
 * Pure: imported by the public form, the API route and the admin alike.
 */

export const GROUP_CALL_PREFIX = "group:"

export const groupCallEventId = (communityId: string) => `${GROUP_CALL_PREFIX}${communityId}`

/** The community id behind a group call's eventId, or null for a conference's. */
export const groupIdOfCall = (eventId?: string | null) =>
  eventId?.startsWith(GROUP_CALL_PREFIX) ? eventId.slice(GROUP_CALL_PREFIX.length) : null

/**
 * The open pool: talks from people who don't know which group they fit. Only
 * admins see it. An admin shares a talk with a group, which copies it into
 * that group's queue (eventId `group:<id>`, routedFrom the pool talk) and tells
 * the group's organizers and the speaker. A pool talk is only ever shared with
 * the speaker's consent, given on the form.
 */
export const OPEN_POOL_ID = "open-pool"

export const isPoolTalk = (eventId?: string | null) => eventId === OPEN_POOL_ID

/** The formats a group call offers. Short on purpose: a meetup's slots are the meetup's to decide. */
export const GROUP_TALK_FORMATS = ["Lightning talk (5–10 min)", "Talk (20–30 min)", "Workshop or demo"] as const

export const GROUP_AUDIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"] as const

/** Limits shared by the form and the route, so the form never offers what the route will refuse. */
export const SPEAKER_CALL_LIMITS = {
  name: 100,
  email: 200,
  sessionTitle: 140,
  abstract: 2000,
  bio: 600,
  link: 300,
  answer: 1000,
  /** The organizer's "what we're looking for" note. */
  note: 280,
  /** The organizer's optional extra question. */
  question: 160,
} as const

/**
 * Plain text, trimmed and capped, or null when empty. Not sanitizeInput: that
 * HTML-encodes, and these strings are only ever rendered by React or by the
 * emails' esc(), so an encoded "Q&amp;A" would show as typed. Control characters
 * other than newlines and tabs are dropped.
 */
export function plainText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const text = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max).trim()
  return text || null
}

/** The public fields of a community that matter to its call. */
export type GroupCall = {
  speakersOpen?: boolean
  speakersNote?: string | null
  speakersQuestion?: string | null
}
