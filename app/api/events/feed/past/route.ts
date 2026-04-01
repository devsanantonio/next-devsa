import { NextRequest, NextResponse } from 'next/server';
import { buildEventFeedResponse } from '../_shared';

export async function GET(request: NextRequest) {
  try {
    return await buildEventFeedResponse(request, {
      scope: 'past',
      selfPath: '/api/events/feed/past',
      channelTitle: 'DEVSA Community Calendar Past Events',
      defaultDescription: 'Past events from the DEVSA Community Calendar. Revisit previous community gatherings, workshops, and meetups across San Antonio.',
      filteredDescriptionPrefix: 'Past DEVSA community events involving',
      sourceTitle: 'DEVSA Community Calendar Past Events',
      includeRsvp: false,
    });
  } catch (error) {
    console.error('Past RSS feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
