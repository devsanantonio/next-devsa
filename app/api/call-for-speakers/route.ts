import { NextRequest, NextResponse } from 'next/server';
import { checkVerification, MAGEN_THRESHOLDS } from '@/lib/magen';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID; // Base: devsa

interface SpeakerSubmission {
  name: string;
  email: string;
  company?: string;
  sessionTitle: string;
  sessionFormat: string;
  abstract: string;
  magenSessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SpeakerSubmission = await request.json();
    const { name, email, company, sessionTitle, sessionFormat, abstract, magenSessionId } = body;

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

      if (!verification.valid) {
        console.log('MAGEN verification failed:', verification.error);
        return NextResponse.json(
          { error: 'Verification failed', reason: verification.error },
          { status: 403 }
        );
      }

      // Check human score threshold
      if ((verification.humanScore ?? 0) < MAGEN_THRESHOLDS.formSubmission) {
        console.log('Low human score:', verification.humanScore);
        return NextResponse.json(
          { error: 'Verification failed', reason: 'Low confidence score' },
          { status: 403 }
        );
      }

      humanScore = verification.humanScore;

      // Log successful verification
      console.log('MAGEN verification passed:', {
        humanScore: verification.humanScore,
        classification: verification.classification,
        sessionId: verification.sessionId,
      });
    } else {
      // MAGEN not configured - proceeding without verification
      console.log('MAGEN verification skipped - not configured');
    }

    // Submit to Airtable
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Airtable configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Build Airtable fields - only include Human Score if available
    const airtableFields: Record<string, string | number> = {
      Name: name,
      Email: email,
      Company: company || '',
      'Session Title': sessionTitle,
      'Session Format': sessionFormat,
      Abstract: abstract,
      'Submitted At': new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };

    if (humanScore !== undefined) {
      airtableFields['Human Score'] = humanScore;
    }

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/call%20for%20speakers`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: airtableFields,
            },
          ],
        }),
      }
    );

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.json();
      console.error('Airtable error:', errorData);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    const airtableData = await airtableResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Proposal submitted successfully',
      recordId: airtableData.records?.[0]?.id,
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
