import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getDb, COLLECTIONS, type SpeakerSubmission } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { SpeakerThankYouEmail, getSpeakerThankYouSubject } from '@/lib/emails/speaker-thank-you';
import { StartupWeekThankYouEmail, getStartupWeekThankYouSubject } from '@/lib/emails/startup-week-thank-you';
import { PysaThankYouEmail, getPysaThankYouSubject } from '@/lib/emails/pysa-thank-you';

const DEFAULT_EVENT_ID = 'aiconference2026';

interface SpeakerSubmissionRequest {
  name: string;
  email: string;
  company?: string;
  sessionTitle: string;
  sessionFormat?: string;
  track?: string;
  abstract: string;
  bio?: string;
  linkedin?: string;
  audienceLevel?: string;
  considerFor?: string;
  accommodations?: string;
  eventId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { isBot } = await checkBotId();
    if (isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body: SpeakerSubmissionRequest = await request.json();
    const {
      name, email, company, sessionTitle, sessionFormat, track, abstract, bio, linkedin,
      audienceLevel, considerFor, accommodations, eventId,
    } = body;

    // Validate required fields
    if (!name || !email || !sessionTitle || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Submit to Firestore (use null instead of undefined for Firestore compatibility)
    const db = getDb();
    const submission: SpeakerSubmission = {
      name,
      email: email.toLowerCase(),
      company: company || null,
      sessionTitle,
      sessionFormat: sessionFormat || null,
      track: track || null,
      abstract,
      bio: bio || null,
      linkedin: linkedin || null,
      audienceLevel: audienceLevel || null,
      considerFor: considerFor || null,
      accommodations: accommodations || null,
      eventId: eventId || DEFAULT_EVENT_ID,
      submittedAt: new Date(),
      status: 'pending',
    };

    const docRef = await db.collection(COLLECTIONS.SPEAKERS).add(submission);

    // Send thank you email if Resend is configured. Each event gets its own
    // template — a new eventId without a case here falls back to the AI
    // Conference email, which would be the wrong event entirely.
    const resolvedEventId = eventId || DEFAULT_EVENT_ID;
    const { subject, html } = (() => {
      switch (resolvedEventId) {
        // Retained for the submissions already in Firestore. DEVSA no longer
        // hosts a Startup Week call for speakers — /startup-week-2026 now
        // redirects to sasw.co — so nothing posts this eventId anymore.
        case 'startup-week-2026':
          return {
            subject: getStartupWeekThankYouSubject(sessionTitle),
            html: StartupWeekThankYouEmail({ name, sessionTitle, track: track || '' }),
          };
        case 'pysanantonio-2026':
          return {
            subject: getPysaThankYouSubject(sessionTitle),
            html: PysaThankYouEmail({
              name,
              sessionTitle,
              sessionFormat: sessionFormat || '',
              audienceLevel: audienceLevel || '',
              considerFor: considerFor || '',
            }),
          };
        default:
          return {
            subject: getSpeakerThankYouSubject(sessionTitle),
            html: SpeakerThankYouEmail({
              name,
              sessionTitle,
              sessionFormat: sessionFormat || track || '',
            }),
          };
      }
    })();

    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email.toLowerCase(),
          subject,
          html,
        });
        console.log('Thank you email sent to:', email);
      } catch (emailError) {
        // Log but don't fail the submission if email fails
        console.error('Failed to send thank you email:', emailError);
      }
    } else {
      console.log('Resend not configured - skipping thank you email');
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal submitted successfully',
      recordId: docRef.id,
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a speaker submission
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, adminEmail } = body;

    if (!submissionId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is an admin
    const db = getDb();
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

    const adminData = adminQuery.docs[0].data();
    if (adminData.role !== 'admin' && adminData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can delete speaker submissions' },
        { status: 403 }
      );
    }

    // Check if submission exists
    const submissionDoc = await db.collection(COLLECTIONS.SPEAKERS).doc(submissionId).get();
    if (!submissionDoc.exists) {
      return NextResponse.json(
        { error: 'Speaker submission not found' },
        { status: 404 }
      );
    }

    // Delete the submission
    await db.collection(COLLECTIONS.SPEAKERS).doc(submissionId).delete();

    return NextResponse.json({
      success: true,
      message: 'Speaker submission deleted successfully',
    });

  } catch (error) {
    console.error('Delete speaker submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
