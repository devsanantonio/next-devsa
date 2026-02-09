import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type EventRSVP, type ApprovedAdmin, type NewsletterSubscription } from '@/lib/firebase-admin';
import { isMagenConfigured, verifySession, shouldBlock } from '@/lib/magen';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { RsvpThankYouEmail, getRsvpThankYouSubject } from '@/lib/emails/rsvp-thank-you';

// Submit an RSVP (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, eventSlug, communityId, firstName, lastName, email, joinNewsletter, magenSessionId, magenVerdict, magenScore } = body;

    if (!eventId || !eventSlug || !communityId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Server-side MAGEN verification (log-only mode until client SDK collects behavioral signals)
    if (isMagenConfigured() && magenSessionId) {
      const result = await verifySession(magenSessionId);
      console.log('[MAGEN] RSVP verification:', { session_id: magenSessionId, verdict: result.verdict, score: result.score, is_human: result.is_human });
      // TODO: Enable blocking once MAGEN client SDK sends behavioral events
      // if (result.success && shouldBlock(result)) {
      //   return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 });
      // }
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
        const eventUrl = `https://devsa.community/events/${eventSlug}`;

        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalizedEmail,
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
    const adminEmail = request.nextUrl.searchParams.get('adminEmail');
    const format = request.nextUrl.searchParams.get('format'); // 'csv' for export

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required' },
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

    // Build query based on role
    let rsvpQuery;
    
    if (adminData.role === 'organizer') {
      // Organizers can only see RSVPs for their community
      if (!adminData.communityId) {
        return NextResponse.json(
          { error: 'No community assigned' },
          { status: 403 }
        );
      }
      rsvpQuery = db.collection(COLLECTIONS.EVENT_RSVPS)
        .where('communityId', '==', adminData.communityId);
    } else {
      // Admins can see all or filter by eventId/communityId
      if (eventId) {
        rsvpQuery = db.collection(COLLECTIONS.EVENT_RSVPS)
          .where('eventId', '==', eventId);
      } else if (communityId) {
        rsvpQuery = db.collection(COLLECTIONS.EVENT_RSVPS)
          .where('communityId', '==', communityId);
      } else {
        rsvpQuery = db.collection(COLLECTIONS.EVENT_RSVPS);
      }
    }

    // If organizer wants specific event, verify it's their community
    if (adminData.role === 'organizer' && eventId) {
      rsvpQuery = rsvpQuery.where('eventId', '==', eventId);
    }

    const rsvpSnapshot = await rsvpQuery.get();

    const rsvps = rsvpSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: (doc.data().submittedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || doc.data().submittedAt,
    }));

    // If CSV format requested, return CSV
    if (format === 'csv') {
      const headers = ['First Name', 'Last Name', 'Email', 'Event', 'Joined Newsletter', 'Submitted At'];
      const csvRows = [headers.join(',')];
      
      for (const rsvp of rsvps) {
        const row = [
          `"${(rsvp as EventRSVP & { id: string }).firstName}"`,
          `"${(rsvp as EventRSVP & { id: string }).lastName}"`,
          `"${(rsvp as EventRSVP & { id: string }).email}"`,
          `"${(rsvp as EventRSVP & { id: string }).eventSlug}"`,
          (rsvp as EventRSVP & { id: string }).joinNewsletter ? 'Yes' : 'No',
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
