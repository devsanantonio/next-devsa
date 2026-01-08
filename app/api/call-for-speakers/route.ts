import { NextRequest, NextResponse } from 'next/server';
import { MAGEN_THRESHOLDS } from '@/lib/magen';
import { getDb, COLLECTIONS, type SpeakerSubmission } from '@/lib/firebase-admin';

interface SpeakerSubmissionRequest {
  name: string;
  email: string;
  company?: string;
  sessionTitle: string;
  sessionFormat: string;
  abstract: string;
  magenSessionId?: string;
  magenHumanScore?: number;
  eventId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SpeakerSubmissionRequest = await request.json();
    const { name, email, company, sessionTitle, sessionFormat, abstract, magenSessionId, magenHumanScore, eventId } = body;

    // Validate required fields
    if (!name || !email || !sessionTitle || !sessionFormat || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check MAGEN human score (passed from frontend verification)
    // Frontend has already verified and rejected low scores, but double-check here
    const MAGEN_API_KEY = process.env.MAGEN_API_KEY;
    let humanScore: number | undefined = magenHumanScore;

    if (MAGEN_API_KEY && !MAGEN_API_KEY.includes('your_')) {
      // If we have a score from frontend, validate it
      if (humanScore !== undefined && humanScore < MAGEN_THRESHOLDS.formSubmission) {
        console.log('Low human score:', humanScore);
        return NextResponse.json(
          { error: 'Verification failed', reason: 'Low confidence score' },
          { status: 403 }
        );
      }
      if (humanScore !== undefined) {
        console.log('MAGEN verification passed:', {
          humanScore,
          sessionId: magenSessionId,
        });
      }
    } else {
      // MAGEN not configured - proceeding without verification
      console.log('MAGEN verification skipped - not configured');
    }

    // Submit to Firestore (use null instead of undefined for Firestore compatibility)
    const db = getDb();
    const submission: SpeakerSubmission = {
      name,
      email: email.toLowerCase(),
      company: company || undefined,
      sessionTitle,
      sessionFormat,
      abstract,
      eventId: eventId || 'aiconference2026',
      submittedAt: new Date(),
      magenSessionId: magenSessionId || undefined,
      magenHumanScore: humanScore ?? null,
      status: 'pending',
    };

    const docRef = await db.collection(COLLECTIONS.SPEAKERS).add(submission);

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
