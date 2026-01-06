import { NextRequest, NextResponse } from 'next/server';
import { checkVerification, MAGEN_THRESHOLDS } from '@/lib/magen';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface SpeakerSubmission {
  name: string;
  email: string;
  company?: string;
  sessionTitle: string;
  sessionFormat: string;
  abstract: string;
  magenSessionId?: string;
  eventId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SpeakerSubmission = await request.json();
    const { name, email, company, sessionTitle, sessionFormat, abstract, magenSessionId, eventId } = body;

    // Validate required fields
    if (!name || !email || !sessionTitle || !sessionFormat || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify MAGEN session if provided and API key is configured
    const MAGEN_API_KEY = process.env.MAGEN_API_KEY;
    let humanScore: number | undefined;
    
    if (magenSessionId && MAGEN_API_KEY && !MAGEN_API_KEY.includes('your_')) {
      const verification = await checkVerification(magenSessionId);

      // Only block if verification explicitly returns low score
      // Allow through if verification service is unavailable
      if (verification.valid && verification.humanScore !== undefined) {
        if (verification.humanScore < MAGEN_THRESHOLDS.formSubmission) {
          console.log('Low human score:', verification.humanScore);
          return NextResponse.json(
            { error: 'Verification failed', reason: 'Low confidence score' },
            { status: 403 }
          );
        }
        humanScore = verification.humanScore;
        console.log('MAGEN verification passed:', {
          humanScore: verification.humanScore,
          classification: verification.classification,
          sessionId: verification.sessionId,
        });
      } else {
        // Verification service error - allow submission but log it
        console.log('MAGEN verification skipped - service unavailable:', verification.error);
      }
    } else {
      // MAGEN not configured - proceeding without verification
      console.log('MAGEN verification skipped - not configured');
    }

    // Submit to Convex database
    const submissionId = await convex.mutation(api.speakers.submit, {
      name,
      email,
      company: company || undefined,
      sessionTitle,
      sessionFormat,
      abstract,
      eventId: eventId || 'aiconference2026',
      magenSessionId: magenSessionId || undefined,
      magenHumanScore: humanScore,
    });

    return NextResponse.json({
      success: true,
      message: 'Proposal submitted successfully',
      recordId: submissionId,
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
