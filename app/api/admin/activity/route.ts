import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { logActivity, RESTORABLE, type ActivityKind } from '@/lib/activity-log';
import { slugTaken } from '@/lib/event-slug';

/**
 * The Activity tab: GET the latest changes, POST `{ id }` to restore what a
 * logged delete removed. Admins and super admins only; organizers act within
 * their own group and don't see the portal-wide record.
 */
async function requireAdmin(request: NextRequest) {
  const email = await verifiedEmail(request);
  if (!email) return { error: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) };
  const q = await getDb().collection(COLLECTIONS.APPROVED_ADMINS).where('email', '==', email).limit(1).get();
  const role = q.empty ? null : q.docs[0].data().role;
  if (role !== 'admin' && role !== 'superadmin') {
    return { error: NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 }) };
  }
  return { email };
}

const iso = (v: unknown) => (v as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? null;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    // `?limit=5` for the Overview's recent changes; the Activity tab takes the default.
    const asked = Number(request.nextUrl.searchParams.get('limit'));
    const limit = Number.isInteger(asked) && asked > 0 ? Math.min(asked, 300) : 300;
    const snap = await getDb().collection(COLLECTIONS.ACTIVITY_LOG).orderBy('at', 'desc').limit(limit).get();
    const entries = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        at: iso(d.at),
        actor: d.actor,
        action: d.action,
        kind: d.kind,
        targetId: d.targetId,
        label: d.label,
        changes: d.changes ?? null,
        detail: d.detail ?? null,
        // The snapshot itself stays on the server; the tab only needs to know Restore is possible.
        restorable: !!d.snapshot && !!RESTORABLE[d.kind as ActivityKind] && !d.restoredAt,
        restoredAt: iso(d.restoredAt),
        restoredBy: d.restoredBy ?? null,
      };
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Activity fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    const { id } = await request.json().catch(() => ({}));
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const db = getDb();
    const entryRef = db.collection(COLLECTIONS.ACTIVITY_LOG).doc(id);
    const entryDoc = await entryRef.get();
    const entry = entryDoc.data();
    const collection = entry ? RESTORABLE[entry.kind as ActivityKind] : undefined;
    if (!entry || entry.action !== 'deleted' || !entry.snapshot || !collection) {
      return NextResponse.json({ error: 'Nothing to restore here' }, { status: 400 });
    }
    if (entry.restoredAt) return NextResponse.json({ error: 'Already restored' }, { status: 409 });

    const targetRef = db.collection(collection).doc(entry.targetId);
    if ((await targetRef.get()).exists) {
      return NextResponse.json({ error: 'Something with that id exists again, so it was not overwritten' }, { status: 409 });
    }
    // An event comes back at its old address only if nothing has taken it since.
    if (entry.kind === 'event' && entry.snapshot.slug) {
      if (await slugTaken(db, entry.snapshot.slug)) {
        return NextResponse.json(
          { error: `devsa.community/events/${entry.snapshot.slug} belongs to another event now. Rename that one first.` },
          { status: 409 }
        );
      }
    }

    await targetRef.create(entry.snapshot);
    await entryRef.update({ restoredAt: new Date(), restoredBy: auth.email });
    await logActivity({ actor: auth.email!, action: 'restored', kind: entry.kind, targetId: entry.targetId, label: entry.label });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity restore error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
