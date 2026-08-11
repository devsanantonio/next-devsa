import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getDb, COLLECTIONS, type VolunteerSignup } from '@/lib/firebase-admin';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import {
  AccessGrantedVolunteerEmail,
  getAccessGrantedVolunteerSubject,
} from '@/lib/emails/access-granted-volunteer';
import {
  AccessGrantedInternalEmail,
  getAccessGrantedInternalSubject,
} from '@/lib/emails/access-granted-internal';
import { AG_EVENT_ID, AG_NOTIFY_EMAILS } from '@/data/access-granted/2026';

/**
 * Volunteer signups for an event's open call.
 *
 * Generic by event rather than named for Access Granted: the shape — who are
 * you, which org, what will you do, anything we should know — is the same for
 * any event that needs hands, and `eventId` keeps them apart. Access Granted is
 * simply the first caller.
 *
 * Deliberately NOT folded into /api/call-for-speakers. That route's documents
 * land in the collection the admin Speakers tab reads, where every row is a
 * talk to accept or reject; a volunteer has no title or abstract to judge and
 * would sit there as a permanently un-actionable submission.
 *
 * Public and unauthenticated, so BotID gates it — the path is registered in
 * instrumentation-client.ts, which is what attaches the classification headers.
 * It also sends mail, so it is rate limited on top of that.
 */

/** Only these are offered by the form; anything else is a hand-rolled POST. */
const MAX_LEN = { name: 100, email: 200, org: 120, role: 120, notes: 2000 } as const;

interface VolunteerRequest {
  name?: string;
  email?: string;
  org?: string;
  role?: string;
  notes?: string;
  eventId?: string;
  /**
   * False when this signup rides along with a talk submitted in the same
   * breath — the Access Granted form posts to both routes when someone picks
   * "Both", and two confirmations for one action reads as a bug. The speaker
   * template says "you also offered to help" instead. The organiser
   * notification is NOT suppressed; the crew list still needs the record.
   */
  sendConfirmation?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Cheap local checks first, then the network calls.
    const limit = rateLimit(getClientIp(request), 5, 60_000);
    if (!limit.success) return rateLimitResponse(limit.resetMs);

    const { isBot } = await checkBotId();
    if (isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body: VolunteerRequest = await request.json();

    const name = sanitizeInput((body.name ?? '').trim().slice(0, MAX_LEN.name));
    const email = sanitizeInput((body.email ?? '').trim().slice(0, MAX_LEN.email)).toLowerCase();
    const role = sanitizeInput((body.role ?? '').trim().slice(0, MAX_LEN.role));
    const org = sanitizeInput((body.org ?? '').trim().slice(0, MAX_LEN.org));
    const notes = sanitizeInput((body.notes ?? '').trim().slice(0, MAX_LEN.notes));
    const eventId = sanitizeInput((body.eventId ?? '').trim().slice(0, 64));
    const sendConfirmation = body.sendConfirmation !== false;

    // `role` is deliberately NOT required. Access Granted dropped its role
    // picker — most of the jobs on that list belonged to the partner orgs
    // rather than to us — so a signup is now just "I'm in", and organisers
    // work out who does what by reaching out. An event that does want to ask
    // can still send one, and it will be stored and shown in the email.
    if (!name || !email || !eventId) {
      return NextResponse.json(
        { error: 'Name, email and event are all required.' },
        { status: 400 }
      );
    }

    // Deliberately loose. A stricter pattern rejects valid addresses more often
    // than it catches typos, and the confirmation email is the real check —
    // if it does not arrive, the address was wrong.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'That email address looks wrong.' }, { status: 400 });
    }

    const db = getDb();

    // One signup per person per event. A second submission updates rather than
    // duplicating — someone who changes their mind about which table to run
    // should not appear twice on the organiser's list.
    const existing = await db
      .collection(COLLECTIONS.VOLUNTEER_SIGNUPS)
      .where('eventId', '==', eventId)
      .where('email', '==', email)
      .limit(1)
      .get();

    // Firestore rejects undefined — optional fields are coerced, not omitted.
    const signup: VolunteerSignup = {
      name,
      email,
      org: org || null,
      role: role || null,
      notes: notes || null,
      eventId,
      submittedAt: new Date(),
      status: 'pending',
    };

    let recordId: string;
    if (!existing.empty) {
      recordId = existing.docs[0].id;
      await db.collection(COLLECTIONS.VOLUNTEER_SIGNUPS).doc(recordId).set(signup);
    } else {
      const docRef = await db.collection(COLLECTIONS.VOLUNTEER_SIGNUPS).add(signup);
      recordId = docRef.id;
    }

    // Each event brings its own confirmation template. An unrecognised eventId
    // gets NO email rather than someone else's — the write is what matters, and
    // a volunteer for a future event should not be welcomed to Access Granted.
    // Add a case here when the next event starts using this route.
    const confirmation =
      eventId === AG_EVENT_ID
        ? {
            subject: getAccessGrantedVolunteerSubject(),
            html: AccessGrantedVolunteerEmail({ name, role: role || null, org: org || null }),
          }
        : null;

    // Side effect, not the user's goal: logged and swallowed. A Resend outage
    // must not cost someone their signup.
    if (confirmation && sendConfirmation && isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: confirmation.subject,
          html: confirmation.html,
        });
      } catch (emailError) {
        console.error('Failed to send volunteer confirmation:', emailError);
      }
    } else if (!confirmation) {
      console.warn(`No volunteer confirmation template for eventId "${eventId}"`);
    } else {
      console.log('Resend not configured - skipping volunteer confirmation');
    }

    // Organiser notification. Sent even when the confirmation is suppressed —
    // a "Both" submission produces two records and the crew list needs its own.
    if (eventId === AG_EVENT_ID && isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [...AG_NOTIFY_EMAILS],
          replyTo: email,
          subject: getAccessGrantedInternalSubject({ kind: 'volunteer', name }),
          html: AccessGrantedInternalEmail({
            kind: 'volunteer',
            name,
            email,
            company: org || null,
            notes: notes || null,
            alsoVolunteering: !sendConfirmation,
          }),
        });
        console.log('Organiser notification sent for %s submission:', 'volunteer', AG_NOTIFY_EMAILS.join(', '));
      } catch (notifyError) {
        console.error('Failed to send organiser notification:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks — you are on the crew.',
      recordId,
    });
  } catch (error) {
    console.error('Volunteer signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Delete a volunteer signup. Admin and superadmin only.
 *
 * Mirrors the DELETE on /api/call-for-speakers deliberately, including the
 * role check: per the dashboard's permission model, organizers are scoped
 * readers of community-owned data but deletes stay with admins. An organizer
 * who could delete signups could quietly empty another event's crew list,
 * since this collection is shared across events.
 *
 * There is no auth token on this route — the caller passes `adminEmail` and the
 * server verifies it against approved_admins, which is the convention every
 * other admin endpoint here uses.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { signupId, adminEmail } = body;

    if (!signupId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDb();
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', String(adminEmail).toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data();
    if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can delete volunteer signups' },
        { status: 403 }
      );
    }

    const doc = await db.collection(COLLECTIONS.VOLUNTEER_SIGNUPS).doc(signupId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Volunteer signup not found' }, { status: 404 });
    }

    await db.collection(COLLECTIONS.VOLUNTEER_SIGNUPS).doc(signupId).delete();

    return NextResponse.json({
      success: true,
      message: 'Volunteer signup deleted successfully',
    });
  } catch (error) {
    console.error('Delete volunteer signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
