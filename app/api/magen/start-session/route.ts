import { NextResponse } from 'next/server';
import { isMagenConfigured } from '@/lib/magen';

// The MAGEN Trust SDK handles session creation client-side.
// This route now just reports whether MAGEN is configured,
// so the frontend knows whether to load the SDK.
export async function POST() {
  const configured = isMagenConfigured();
  const siteId = process.env.MAGEN_SITE_ID || null;

  return NextResponse.json({
    configured,
    siteId: configured ? siteId : null,
  });
}
