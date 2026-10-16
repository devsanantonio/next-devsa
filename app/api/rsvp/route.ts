import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { getDb, COLLECTIONS, type EventRSVP, type ApprovedAdmin, type NewsletterSubscription } from '@/lib/firebase-admin';
import { checkBotId } from 'botid/server';
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from '@/lib/resend';
import { RsvpThankYouEmail, getRsvpThankYouSubject } from '@/lib/emails/rsvp-thank-you';

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

    // Create RSVP
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

    await db.collection(COLLECTIONS.EVENT_RSVPS).add(rsvp);

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

    // Send thank you email
    if (isResendConfigured() && resend) {
      try {
        // Get community name
        let communityName = 'DEVSA Community';
        if (communityId) {
          const communityDoc = await db.collection(COLLECTIONS.COMMUNITIES).doc(communityId).get();
          if (communityDoc.exists) {
            communityName = communityDoc.data()?.name || communityName;
          }
        }

        // Format event date
        const eventDate = eventData?.date 
          ? new Date(eventData.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })
          : 'TBD';

        const eventLocation = eventData?.location || 'TBD';
        const eventUrl = `https://www.devsa.community/events/${eventSlug}`;

        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalizedEmail,
          replyTo: EMAIL_REPLY_TO,
          subject: getRsvpThankYouSubject(eventData?.title || eventSlug),
          html: RsvpThankYouEmail({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            eventTitle: eventData?.title || eventSlug,
            eventDate,
            eventLocation,
            communityName,
            eventUrl,
          }),
        });
      } catch (emailError) {
        // Log but don't fail the RSVP
        console.error('Failed to send RSVP confirmation email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'RSVP submitted successfully',
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

    const rsvps = rsvpSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: (doc.data().submittedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || doc.data().submittedAt,
    }));

    // If CSV format requested, return CSV
    if (format === 'csv') {
      const headers = ['First Name', 'Last Name', 'Email', 'Event', 'Joined Newsletter', 'Question', 'Answer', 'Submitted At'];
      // Quotes doubled, and a leading = + - @ neutralized: an answer is free text
      // from the public, and a spreadsheet would otherwise run it as a formula.
      const cell = (v: unknown) => {
        const text = String(v ?? '');
        return `"${(/^[=+\-@]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
      };
      const csvRows = [headers.join(',')];
      
      for (const rsvp of rsvps) {
        const row = [
          `"${(rsvp as EventRSVP & { id: string }).firstName}"`,
          `"${(rsvp as EventRSVP & { id: string }).lastName}"`,
          `"${(rsvp as EventRSVP & { id: string }).email}"`,
          `"${(rsvp as EventRSVP & { id: string }).eventSlug}"`,
          (rsvp as EventRSVP & { id: string }).joinNewsletter ? 'Yes' : 'No',
          cell((rsvp as EventRSVP & { id: string }).question),
          cell((rsvp as EventRSVP & { id: string }).answer),
          `"${(rsvp as { submittedAt: string }).submittedAt}"`,
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

    // Delete the RSVP
    await db.collection(COLLECTIONS.EVENT_RSVPS).doc(rsvpId).delete();

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
