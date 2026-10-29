/**
 * The admin's change log: who created, changed or deleted what, and when.
 *
 * Before this, approvals recorded who approved and nothing else did, so "who
 * deleted this event?" had no answer once several organizers and two admins
 * worked in the portal. Every write route that changes something people see
 * calls logActivity after its own write succeeds.
 *
 * A delete stores the whole record it removed (`snapshot`), which is what the
 * Activity tab's Restore puts back, under the same id. An edit stores only the
 * fields that changed, before and after, cut short so a long description can't
 * bloat the log.
 *
 * Logging never fails the change it records: errors are logged and swallowed.
 * A Firestore hiccup must not turn a successful save into an error on screen.
 */
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';

export type ActivityKind = 'event' | 'community' | 'partner' | 'admin' | 'rsvp' | 'newsletter' | 'access';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'restored' | 'sent' | 'approved' | 'declined' | 'removed';

/** Which collection a restorable kind lives in. */
export const RESTORABLE: Partial<Record<ActivityKind, string>> = {
  event: COLLECTIONS.EVENTS,
  community: COLLECTIONS.COMMUNITIES,
  partner: COLLECTIONS.PARTNERS,
  rsvp: COLLECTIONS.EVENT_RSVPS,
};

export interface ActivityEntry {
  at: Date;
  actor: string;
  action: ActivityAction;
  kind: ActivityKind;
  targetId: string;
  /** What a person would call it: the event's title, the group's name, an email. */
  label: string;
  /** Edits: field → [before, after], each shortened. */
  changes?: Record<string, [string, string]> | null;
  /** Deletes: the record as it was, for Restore. */
  snapshot?: Record<string, unknown> | null;
  /** Free text where a count or a detail helps: "sent to 231". */
  detail?: string | null;
  restoredAt?: Date | null;
  restoredBy?: string | null;
}

const short = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '—';
  const text = typeof v === 'string' ? v : (v as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? JSON.stringify(v);
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
};

/** The fields an update actually changed, before and after. Bookkeeping fields are skipped. */
export function diffFields(before: Record<string, unknown> | undefined, update: Record<string, unknown>): Record<string, [string, string]> {
  const out: Record<string, [string, string]> = {};
  for (const [key, after] of Object.entries(update)) {
    if (key === 'updatedAt' || key === 'createdAt' || key === 'slugHistory') continue;
    const prev = before?.[key];
    if (JSON.stringify(prev ?? null) === JSON.stringify(after ?? null)) continue;
    out[key] = [short(prev), short(after)];
  }
  return out;
}

export async function logActivity(entry: Omit<ActivityEntry, 'at'>): Promise<void> {
  try {
    if (entry.action === 'updated' && entry.changes && Object.keys(entry.changes).length === 0) return;
    await getDb().collection(COLLECTIONS.ACTIVITY_LOG).add({
      ...entry,
      changes: entry.changes ?? null,
      snapshot: entry.snapshot ?? null,
      detail: entry.detail ?? null,
      at: new Date(),
    });
  } catch (err) {
    console.error('Activity log write failed:', err);
  }
}
