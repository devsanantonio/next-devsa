import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { logActivity } from '@/lib/activity-log';
import { getDb, COLLECTIONS, type EventRSVP, type ApprovedAdmin, type NewsletterSubscription } from '@/lib/firebase-admin';
import { checkBotId } from 'botid/server';
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from '@/lib/resend';
import { RsvpThankYouEmail, getRsvpThankYouSubject, RsvpWaitlistEmail, getRsvpWaitlistSubject } from '@/lib/emails/rsvp-thank-you';
import { EVENT_TIMEZONE } from '@/app/api/events/feed/_shared';
import { isHostedBy } from '@/lib/event-hosts';

/**
 * The email for one RSVP: the confirmation, the waitlist notice, or the
 * confirmation that a waitlisted person was moved up. Failures are logged and
 * swallowed; an email outage must never cost someone their RSVP.
 */
async function sendRsvpEmail(
  db: FirebaseFirestore.Firestore,
  rsvp: { firstName: string; lastName: string; email: string; eventSlug: string; communityId?: string },
  eventData: FirebaseFirestore.DocumentData | undefined,
  kind: 'confirmed' | 'waitlisted' | 'promoted'
) {
  if (!isResendConfigured() || !resend) return;
  try {
    let communityName = 'DEVSA Community';
    if (rsvp.communityId) {
      const communityDoc = await db.collection(COLLECTIONS.COMMUNITIES).doc(rsvp.communityId.split(',')[0].trim()).get();
      if (communityDoc.exists) {
        communityName = communityDoc.data()?.name || communityName;
      }
    }

    // Format event date in San Antonio's time, and say so.
    //
    // This had no timeZone, so it formatted in the server's zone — UTC on
    // Vercel — with no zone name. A 6 PM event arrived in the confirmation
    // as "12:00 AM" the next day, which the Community Roundtable's
    // registrants reasonably took as the real time. Every event on this
    // site is in San Antonio; the feed uses the same zone.
    const eventDate = eventData?.date
      ? new Date(eventData.date).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: EVENT_TIMEZONE,
          timeZoneName: 'short',
        })
      : 'TBD';

    const title = eventData?.title || rsvp.eventSlug;
    const props = {
      firstName: rsvp.firstName,
      lastName: rsvp.lastName,
      eventTitle: title,
      eventDate,
      eventLocation: eventData?.location || 'TBD',
      communityName,
      eventUrl: `https://www.devsa.community/events/${rsvp.eventSlug}`,
    };

    await resend.emails.send({
      from: EMAIL_FROM,
      to: rsvp.email,
      replyTo: EMAIL_REPLY_TO,
      subject: kind === 'waitlisted' ? getRsvpWaitlistSubject(title) : getRsvpThankYouSubject(title, kind === 'promoted'),
      html: kind === 'waitlisted' ? RsvpWaitlistEmail(props) : RsvpThankYouEmail({ ...props, fromWaitlist: kind === 'promoted' }),
    });
  } catch (emailError) {
    console.error('Failed to send RSVP email:', emailError);
  }
}

// Submit an RSVP (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const { isBot } = await checkBotId();
    if (isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { eventId, eventSlug, firstName, lastName, email, joinNewsletter, answer } = body;
    /*
     * communityId used to be required here, which meant an event hosted only by
     * partners — or by DEVSA with a partner, and no community group — could
     * never take an RSVP: every submission came back "Missing required fields".
     * It is only used to scope an organizer's view of RSVPs, so it is optional.
     */
    const communityId = typeof body.communityId === 'string' ? body.communityId : '';

    if (!eventId || !eventSlug || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if event exists and has RSVP enabled
    const eventDoc = await db.collection(COLLECTIONS.EVENTS).doc(eventId).get();
    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = eventDoc.data();
    if (!eventData?.rsvpEnabled) {
      return NextResponse.json(
        { error: 'RSVP is not enabled for this event' },
        { status: 400 }
      );
    }

    // The organizer's own question, if the event has one.
    const question = typeof eventData.rsvpQuestion === 'string' ? eventData.rsvpQuestion.trim() : '';
    const answerText = question && typeof answer === 'string' ? answer.trim().slice(0, 500) : '';
    if (question && eventData.rsvpQuestionRequired === true && !answerText) {
      return NextResponse.json(
        { error: 'Please answer the question above' },
        { status: 400 }
      );
    }

    // Check if already RSVP'd
    const existingRsvp = await db
      .collection(COLLECTIONS.EVENT_RSVPS)
      .where('eventId', '==', eventId)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (!existingRsvp.empty) {
      return NextResponse.json(
        { error: 'You have already registered for this event' },
        { status: 409 }
      );
    }

    const rsvp: EventRSVP = {
      eventId,
      eventSlug,
      communityId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      joinNewsletter: joinNewsletter || false,
      ...(question ? { question, answer: answerText } : {}),
      submittedAt: new Date(),
    };

    // Past capacity, the RSVP is kept on the waitlist. Counted and written in one
    // transaction, so two people taking the last seat at once can't both get it.
    const capacity = typeof eventData.capacity === 'number' && eventData.capacity > 0 ? eventData.capacity : null;
    const ref = db.collection(COLLECTIONS.EVENT_RSVPS).doc();
    const waitlisted = await db.runTransaction(async (tx) => {
      let full = false;
      if (capacity) {
        const taken = await tx.get(db.collection(COLLECTIONS.EVENT_RSVPS).where('eventId', '==', eventId));
        full = taken.docs.filter((d) => d.data().waitlisted !== true).length >= capacity;
      }
      tx.create(ref, full ? { ...rsvp, waitlisted: true } : rsvp);
      return full;
    });

    // If user opted in to newsletter, add them
    if (joinNewsletter) {
      // Check if already subscribed
      const existingSubscription = await db
        .collection(COLLECTIONS.NEWSLETTER)
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();

      if (existingSubscription.empty) {
        const subscription: NewsletterSubscription = {
          email: normalizedEmail,
          subscribedAt: new Date(),
          source: `event-rsvp:${eventSlug}`,
          status: 'active',
        };
        await db.collection(COLLECTIONS.NEWSLETTER).add(subscription);
      }
    }

    await sendRsvpEmail(db, rsvp, eventData, waitlisted ? 'waitlisted' : 'confirmed');

    return NextResponse.json({
      success: true,
      waitlisted,
      message: waitlisted ? "You're on the waitlist" : 'RSVP submitted successfully',
    });
  } catch (error) {
    console.error('RSVP submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get RSVPs for an event (admin/organizer only)
export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId');
    const communityId = request.nextUrl.searchParams.get('communityId');
    const adminEmail = await verifiedEmail(request);
    const format = request.nextUrl.searchParams.get('format'); // 'csv' for export

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Sign in required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify admin permissions
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;

    /*
     * A collab event stores its hosts as one comma-separated communityId
     * ("alamo-python,pytexas"), and every RSVP to it copies that string. An
     * equality query never matched it, so a co-hosting group's organizer saw
     * none of the RSVPs to their own event, and the admin's community filter
     * dropped them too. A group now matches any RSVP it is one of the hosts of,
     * checked in memory after the query.
     */
    const hostedBy = (stored: unknown, id: string) =>
      String(stored || '').split(',').map((s) => s.trim()).includes(id);

    let rsvpQuery: FirebaseFirestore.Query = db.collection(COLLECTIONS.EVENT_RSVPS);
    let scopeCommunity: string | null = null;

    if (adminData.role === 'organizer') {
      // Organizers can only see RSVPs for their community
      if (!adminData.communityId) {
        return NextResponse.json(
          { error: 'No community assigned' },
          { status: 403 }
        );
      }
      scopeCommunity = adminData.communityId;
      if (eventId) rsvpQuery = rsvpQuery.where('eventId', '==', eventId);
    } else if (eventId) {
      // Admins can see all or filter by eventId/communityId
      rsvpQuery = rsvpQuery.where('eventId', '==', eventId);
    } else if (communityId) {
      scopeCommunity = communityId;
    }

    const snapshot = await rsvpQuery.get();
    const rsvpSnapshot = {
      docs: scopeCommunity
        ? snapshot.docs.filter((doc) => hostedBy(doc.data().communityId, scopeCommunity!))
        : snapshot.docs,
    };

    const iso = (v: unknown): string | null => (v as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? (typeof v === "string" ? v : null);
    const rsvps = rsvpSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: iso(doc.data().submittedAt),
      checkedInAt: iso(doc.data().checkedInAt),
      promotedAt: iso(doc.data().promotedAt),
    }));

    // If CSV format requested, return CSV
    if (format === 'csv') {
      const headers = ['First Name', 'Last Name', 'Email', 'Event', 'Joined Newsletter', 'Question', 'Answer', 'Submitted At', 'Status', 'Checked In'];
      // Quotes doubled, and a leading = + - @ neutralized: an answer is free text
      // from the public, and a spreadsheet would otherwise run it as a formula.
      const cell = (v: unknown) => {
        const text = String(v ?? '');
        return `"${(/^[=+\-@]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
      };
      const csvRows = [headers.join(',')];
      
      for (const rsvp of rsvps) {
        const r = rsvp as unknown as Omit<EventRSVP, 'submittedAt' | 'checkedInAt'> & { submittedAt: string | null; checkedInAt: string | null };
        const row = [
          `"${r.firstName}"`,
          `"${r.lastName}"`,
          `"${r.email}"`,
          `"${r.eventSlug}"`,
          r.joinNewsletter ? 'Yes' : 'No',
          cell(r.question),
          cell(r.answer),
          `"${r.submittedAt}"`,
          r.waitlisted ? 'Waitlist' : 'Going',
          r.checkedInAt ? 'Yes' : 'No',
        ];
        csvRows.push(row.join(','));
      }

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="rsvps-${eventId || communityId || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      rsvps,
      total: rsvps.length,
    });
  } catch (error) {
    console.error('RSVP fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete an RSVP (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { rsvpId } = body;
    const adminEmail = await verifiedEmail(request);

    if (!rsvpId || !adminEmail) {
      return NextResponse.json(
        { error: 'RSVP ID and admin email are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify admin permissions
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data() as ApprovedAdmin;
    if (adminData.role !== 'superadmin' && adminData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - admin or superadmin role required' },
        { status: 403 }
      );
    }

    // Delete the RSVP, keeping it in the activity log so it can be restored.
    const rsvpRef = db.collection(COLLECTIONS.EVENT_RSVPS).doc(rsvpId);
    const gone = (await rsvpRef.get()).data();
    await rsvpRef.delete();
    if (gone) {
      await logActivity({
        actor: adminEmail.toLowerCase(),
        action: 'deleted',
        kind: 'rsvp',
        targetId: rsvpId,
        label: `${gone.firstName} ${gone.lastName} · ${gone.eventSlug}`,
        snapshot: gone,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'RSVP deleted successfully',
    });
  } catch (error) {
    console.error('RSVP deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH — the door and the waitlist, for an admin or any organizer of a group
 * hosting the event:
 *
 *   { rsvpId, action: 'checkin', value: true | false }   tick or untick "came"
 *   { rsvpId, action: 'promote' }                         move off the waitlist, and email them
 *
 * Promoting may go past capacity: the cap is what the form enforces, and an
 * organizer who knows a seat is free is the better judge.
 */
export async function PATCH(request: NextRequest) {
  try {
    const email = await verifiedEmail(request);
    if (!email) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const { rsvpId, action, value } = await request.json().catch(() => ({}));
    if (!rsvpId || (action !== 'checkin' && action !== 'promote')) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const db = getDb();
    const adminQuery = await db.collection(COLLECTIONS.APPROVED_ADMINS).where('email', '==', email).limit(1).get();
    if (adminQuery.empty) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const admin = adminQuery.docs[0].data() as ApprovedAdmin;

    const rsvpRef = db.collection(COLLECTIONS.EVENT_RSVPS).doc(rsvpId);
    const rsvpDoc = await rsvpRef.get();
    if (!rsvpDoc.exists) return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    const rsvp = rsvpDoc.data() as EventRSVP;
    const eventDoc = await db.collection(COLLECTIONS.EVENTS).doc(rsvp.eventId).get();
    const eventData = eventDoc.data();

    const isAdmin = admin.role === 'admin' || admin.role === 'superadmin';
    if (!isAdmin && !isHostedBy(eventData ?? { communityId: rsvp.communityId }, admin.communityId)) {
      return NextResponse.json({ error: 'Unauthorized - not your event' }, { status: 403 });
    }

    if (action === 'checkin') {
      const checkedInAt = value === false ? null : new Date();
      await rsvpRef.update({ checkedInAt });
      return NextResponse.json({ success: true, checkedInAt: checkedInAt?.toISOString() ?? null });
    }

    if (rsvp.waitlisted !== true) return NextResponse.json({ error: 'Already going' }, { status: 409 });
    await rsvpRef.update({ waitlisted: false, promotedAt: new Date() });
    await sendRsvpEmail(db, rsvp, eventData, 'promoted');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('RSVP update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
