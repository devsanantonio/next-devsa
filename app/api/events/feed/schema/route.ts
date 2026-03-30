import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';
const DEVSA_NAMESPACE = 'https://devsa.community/ns/event-feed/1.0';

export async function GET() {
  return NextResponse.json(
    {
      feed: {
        title: 'DEVSA Community Calendar RSS Schema',
        feedUrl: `${SITE_URL}/api/events/feed`,
        namespace: {
          prefix: 'devsa',
          uri: DEVSA_NAMESPACE,
        },
        notes: [
          'Optional fields are omitted when unavailable and are not emitted as empty tags.',
          'Array values are emitted as repeated tags rather than comma-separated values.',
          'The standard RSS description field remains backward-compatible and is a human-readable summary.',
          'The devsa:description field contains description-only text and may be truncated at a word boundary with an ellipsis.',
        ],
        filters: [
          {
            name: 'communityId',
            type: 'string',
            required: false,
            repeatable: false,
            status: 'planned',
            notes: 'When implemented, this will return only events whose participating community list includes the given community ID.',
          },
        ],
      },
      channel: {
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
            constant: 'DEVSA Community Calendar',
          },
          {
            name: 'link',
            type: 'url',
            required: true,
            constant: `${SITE_URL}/events`,
          },
          {
            name: 'atom:link',
            type: 'url',
            required: true,
            constant: `${SITE_URL}/api/events/feed`,
          },
          {
            name: 'language',
            type: 'string',
            required: true,
            constant: 'en-us',
          },
          {
            name: 'generator',
            type: 'string',
            required: true,
            constant: 'devsa.community',
          },
          {
            name: 'docs',
            type: 'url',
            required: true,
            constant: 'https://www.rssboard.org/rss-specification',
          },
        ],
      },
      item: {
        fields: [
          {
            name: 'title',
            namespace: 'rss',
            type: 'string',
            required: true,
            repeatable: false,
            notes: 'Event title.',
          },
          {
            name: 'link',
            namespace: 'rss',
            type: 'url',
            required: true,
            repeatable: false,
            notes: 'Canonical DEVSA event URL.',
          },
          {
            name: 'guid',
            namespace: 'rss',
            type: 'url',
            required: true,
            repeatable: false,
            notes: 'Canonical DEVSA event URL with isPermaLink=true.',
          },
          {
            name: 'description',
            namespace: 'rss',
            type: 'string',
            required: true,
            repeatable: false,
            notes: 'Human-readable event summary. Includes formatted date/time, location, format, hosts, and a truncated description excerpt.',
          },
          {
            name: 'pubDate',
            namespace: 'rss',
            type: 'rfc822-datetime',
            required: true,
            repeatable: false,
            notes: 'Publication date for the RSS item.',
          },
          {
            name: 'source',
            namespace: 'rss',
            type: 'string',
            required: true,
            repeatable: false,
            constant: 'DEVSA Community Calendar',
          },
          {
            name: 'category',
            namespace: 'rss',
            type: 'string',
            required: true,
            repeatable: true,
            notes: 'Includes the event format label and each host name.',
          },
          {
            name: 'devsa:eventStart',
            namespace: 'devsa',
            type: 'iso8601-datetime',
            required: true,
            repeatable: false,
            notes: 'Event start time with UTC offset.',
          },
          {
            name: 'devsa:eventEnd',
            namespace: 'devsa',
            type: 'iso8601-datetime',
            required: false,
            repeatable: false,
            notes: 'Event end time with UTC offset. Omitted when no end time is configured.',
          },
          {
            name: 'devsa:eventTimezone',
            namespace: 'devsa',
            type: 'string',
            required: true,
            repeatable: false,
            constant: 'America/Chicago',
          },
          {
            name: 'devsa:eventType',
            namespace: 'devsa',
            type: 'string',
            required: true,
            repeatable: false,
            allowedValues: ['in-person', 'hybrid', 'virtual'],
          },
          {
            name: 'devsa:description',
            namespace: 'devsa',
            type: 'string',
            required: false,
            repeatable: false,
            notes: 'Description-only plain text. Truncated at a word boundary with an ellipsis when shortened.',
          },
          {
            name: 'devsa:venue',
            namespace: 'devsa',
            type: 'string',
            required: false,
            repeatable: false,
            notes: 'Venue name when configured.',
          },
          {
            name: 'devsa:address',
            namespace: 'devsa',
            type: 'string',
            required: false,
            repeatable: false,
            notes: 'Street address when configured.',
          },
          {
            name: 'devsa:locationLabel',
            namespace: 'devsa',
            type: 'string',
            required: false,
            repeatable: false,
            notes: 'Human-friendly combined location text.',
          },
          {
            name: 'devsa:host',
            namespace: 'devsa',
            type: 'string',
            required: false,
            repeatable: true,
            notes: 'Participating host/community name. Derived from the event community list. May include an id attribute when available.',
          },
          {
            name: 'devsa:detailsUrl',
            namespace: 'devsa',
            type: 'url',
            required: true,
            repeatable: false,
            notes: 'Canonical DEVSA event details URL.',
          },
          {
            name: 'devsa:rsvpUrl',
            namespace: 'devsa',
            type: 'url',
            required: false,
            repeatable: false,
            notes: 'Actionable RSVP URL. Omitted when no RSVP destination is available.',
          },
          {
            name: 'devsa:rsvpMode',
            namespace: 'devsa',
            type: 'string',
            required: false,
            repeatable: false,
            allowedValues: ['internal', 'external'],
            notes: 'Only present when devsa:rsvpUrl is present.',
          },
          {
            name: 'devsa:link',
            namespace: 'devsa',
            type: 'url',
            required: true,
            repeatable: true,
            notes: 'Typed action link. rel="details" is always present. rel="rsvp" appears when RSVP is available.',
          },
        ],
        examples: [
          {
            scenario: 'Minimal item',
            notes: [
              'No end time.',
              'No RSVP URL.',
              'Single host.',
            ],
          },
          {
            scenario: 'RSVP-enabled item',
            notes: [
              'Includes devsa:rsvpUrl and devsa:rsvpMode.',
              'Always includes devsa:detailsUrl and devsa:link rel="details".',
            ],
          },
          {
            scenario: 'Multi-host item',
            notes: [
              'Emits one devsa:host per participating community.',
              'Emits a category for each host name.',
            ],
          },
        ],
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    }
  );
}
