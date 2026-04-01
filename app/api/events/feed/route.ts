import { NextRequest, NextResponse } from 'next/server';
import { buildEventFeedResponse } from './_shared';

export async function GET(request: NextRequest) {
  try {
    return await buildEventFeedResponse(request, {
      scope: 'upcoming',
      selfPath: '/api/events/feed',
      channelTitle: 'DEVSA Community Calendar',
      defaultDescription: `One calendar for every community. Stop hunting for links — DEVSA brings San Antonio's tech groups together in one place. Find your people. Build your future.`,
      filteredDescriptionPrefix: 'Upcoming DEVSA community events involving',
      sourceTitle: 'DEVSA Community Calendar',
      includeRsvp: true,
    });
  } catch (error) {
    console.error('RSS feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
