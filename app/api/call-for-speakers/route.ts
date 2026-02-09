import { NextRequest, NextResponse } from 'next/server';
import { isMagenConfigured, verifySession, shouldBlock } from '@/lib/magen';
import { getDb, COLLECTIONS, type SpeakerSubmission } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { SpeakerThankYouEmail, getSpeakerThankYouSubject } from '@/lib/emails/speaker-thank-you';

interface SpeakerSubmissionRequest {
  name: string;
  email: string;
  company?: string;
  sessionTitle: string;
  sessionFormat: string;
  abstract: string;
  magenSessionId?: string;
  magenVerdict?: string;
  magenScore?: number;
  eventId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SpeakerSubmissionRequest = await request.json();
    const { name, email, company, sessionTitle, sessionFormat, abstract, magenSessionId, magenVerdict, magenScore, eventId } = body;

    // Validate required fields
    if (!name || !email || !sessionTitle || !sessionFormat || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Server-side MAGEN re-verification
    if (isMagenConfigured() && magenSessionId) {
      const result = await verifySession(magenSessionId);
      if (result.success && shouldBlock(result)) {
        console.log('MAGEN blocked submission:', { verdict: result.verdict, session_id: magenSessionId });
        return NextResponse.json(
          { error: 'Verification failed', reason: 'Unverified traffic' },
          { status: 403 }
        );
      }
      if (result.success) {
        console.log('MAGEN verification passed:', { verdict: result.verdict, session_id: magenSessionId });
      }
    } else {
      console.log('MAGEN verification skipped - not configured');
    }

    // Submit to Firestore (use null instead of undefined for Firestore compatibility)
    const db = getDb();
    const submission: SpeakerSubmission = {
      name,
      email: email.toLowerCase(),
      company: company || null,
      sessionTitle,
      sessionFormat,
      abstract,
      eventId: eventId || 'aiconference2026',
      submittedAt: new Date(),
      magenSessionId: magenSessionId ?? null,
      magenVerdict: magenVerdict ?? null,
      magenScore: magenScore ?? null,
      status: 'pending',
    };

    const docRef = await db.collection(COLLECTIONS.SPEAKERS).add(submission);

    // Send thank you email if Resend is configured
    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email.toLowerCase(),
          subject: getSpeakerThankYouSubject(sessionTitle),
          html: SpeakerThankYouEmail({ name, sessionTitle, sessionFormat }),
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
