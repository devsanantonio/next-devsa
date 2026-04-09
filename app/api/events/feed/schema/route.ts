import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';
const DEVSA_NAMESPACE = 'https://devsa.community/ns/event-feed/1.0';

export async function GET() {
  // Keep this schema contract in sync with app/api/events/feed/route.ts whenever
  // the RSS implementation changes. Consumers rely on this endpoint as the
  // public reference for available fields, filters, and omission rules.
  return NextResponse.json(
    {
      feed: {
        title: 'DEVSA Community Calendar RSS Schema',
        feedUrl: `${SITE_URL}/api/events/feed`,
        schemaUrl: `${SITE_URL}/api/events/feed/schema`,
        namespace: {
          prefix: 'devsa',
          uri: DEVSA_NAMESPACE,
        },
        variants: [
          {
            name: 'upcoming',
            feedUrl: `${SITE_URL}/api/events/feed`,
            notes: 'Upcoming published events, sorted soonest first.',
          },
          {
            name: 'past',
            feedUrl: `${SITE_URL}/api/events/feed/past`,
            notes: 'Past published events, sorted most recent first. Supports the same item contract and communityId filter, but omits RSVP-specific fields and links.',
          },
        ],
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
            status: 'active',
            notes: 'Filters the feed to events whose participating community list includes any requested community ID. Accepts a single ID or a comma-separated list with match-any semantics.',
            examples: [
              `${SITE_URL}/api/events/feed?communityId=devsa`,
              `${SITE_URL}/api/events/feed?communityId=devsa,alamo-python`,
              `${SITE_URL}/api/events/feed/past?communityId=devsa`,
            ],
          },
        ],
        omissionRules: [
          'Optional fields are omitted entirely when unavailable.',
          'devsa:eventEnd is omitted when no end time is configured.',
          'devsa:venue and devsa:address are omitted when those values are not configured.',
          'devsa:locationLabel is omitted when no human-friendly location text is available.',
          'devsa:rsvpUrl and devsa:rsvpMode are omitted when no actionable RSVP destination exists, and are always omitted from the past feed.',
          'devsa:host may repeat for collaborative events and may be omitted when no host name can be resolved.',
          'devsa:link always includes rel="details" and includes rel="rsvp" only when RSVP is available on the upcoming feed.',
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
            xml: `<item>
  <title>San Antonio JavaScript Social</title>
  <link>${SITE_URL}/events/san-antonio-javascript-social</link>
  <guid isPermaLink="true">${SITE_URL}/events/san-antonio-javascript-social</guid>
  <description>Wednesday, June 10, 2026 at 7:00 PM CT · Downtown San Antonio · Format: In-Person · Hosted by SATXJS · Casual meetup for local JavaScript developers...</description>
  <pubDate>Sat, 30 May 2026 20:10:00 GMT</pubDate>
  <source url="${SITE_URL}/api/events/feed">DEVSA Community Calendar</source>
  <category>In-Person</category>
  <category>SATXJS</category>
  <devsa:eventStart>2026-06-10T19:00:00-05:00</devsa:eventStart>
  <devsa:eventTimezone>America/Chicago</devsa:eventTimezone>
  <devsa:eventType>in-person</devsa:eventType>
  <devsa:description>Casual meetup for local JavaScript developers...</devsa:description>
  <devsa:locationLabel>Downtown San Antonio</devsa:locationLabel>
  <devsa:host id="satxjs">SATXJS</devsa:host>
  <devsa:detailsUrl>${SITE_URL}/events/san-antonio-javascript-social</devsa:detailsUrl>
  <devsa:link rel="details">${SITE_URL}/events/san-antonio-javascript-social</devsa:link>
</item>`,
          },
          {
            scenario: 'RSVP-enabled item',
            xml: `<item>
  <title>AI Builders Meetup</title>
  <link>${SITE_URL}/events/ai-builders-meetup</link>
  <guid isPermaLink="true">${SITE_URL}/events/ai-builders-meetup</guid>
  <description>Thursday, April 16, 2026 at 6:00 PM CT · Geekdom · Format: In-Person · Hosted by DEVSA · Practical meetup for local builders exploring applied AI...</description>
  <pubDate>Mon, 06 Apr 2026 18:22:00 GMT</pubDate>
  <source url="${SITE_URL}/api/events/feed">DEVSA Community Calendar</source>
  <category>In-Person</category>
  <category>DEVSA</category>
  <devsa:eventStart>2026-04-16T18:00:00-05:00</devsa:eventStart>
  <devsa:eventEnd>2026-04-16T20:00:00-05:00</devsa:eventEnd>
  <devsa:eventTimezone>America/Chicago</devsa:eventTimezone>
  <devsa:eventType>in-person</devsa:eventType>
  <devsa:description>Practical meetup for local builders exploring applied AI...</devsa:description>
  <devsa:venue>Geekdom</devsa:venue>
  <devsa:address>110 E Houston St, San Antonio, TX 78205</devsa:address>
  <devsa:locationLabel>Geekdom, 110 E Houston St, San Antonio, TX 78205</devsa:locationLabel>
  <devsa:host id="devsa">DEVSA</devsa:host>
  <devsa:detailsUrl>${SITE_URL}/events/ai-builders-meetup</devsa:detailsUrl>
  <devsa:rsvpUrl>${SITE_URL}/events/ai-builders-meetup#rsvp</devsa:rsvpUrl>
  <devsa:rsvpMode>internal</devsa:rsvpMode>
  <devsa:link rel="details">${SITE_URL}/events/ai-builders-meetup</devsa:link>
  <devsa:link rel="rsvp">${SITE_URL}/events/ai-builders-meetup#rsvp</devsa:link>
</item>`,
          },
          {
            scenario: 'Multi-host item',
            xml: `<item>
  <title>Founder Friday at Capital Factory</title>
  <link>${SITE_URL}/events/founder-friday-capital-factory</link>
  <guid isPermaLink="true">${SITE_URL}/events/founder-friday-capital-factory</guid>
  <description>Friday, May 8, 2026 at 9:00 AM CT · Capital Factory · Format: Hybrid · Hosted by DEVSA, Capital Factory · Founder-focused morning meetup for the local startup community...</description>
  <pubDate>Tue, 28 Apr 2026 15:00:00 GMT</pubDate>
  <source url="${SITE_URL}/api/events/feed">DEVSA Community Calendar</source>
  <category>Hybrid</category>
  <category>DEVSA</category>
  <category>Capital Factory</category>
  <devsa:eventStart>2026-05-08T09:00:00-05:00</devsa:eventStart>
  <devsa:eventEnd>2026-05-08T11:00:00-05:00</devsa:eventEnd>
  <devsa:eventTimezone>America/Chicago</devsa:eventTimezone>
  <devsa:eventType>hybrid</devsa:eventType>
  <devsa:description>Founder-focused morning meetup for the local startup community...</devsa:description>
  <devsa:venue>Capital Factory</devsa:venue>
  <devsa:locationLabel>Capital Factory + online</devsa:locationLabel>
  <devsa:host id="devsa">DEVSA</devsa:host>
  <devsa:host id="capital-factory">Capital Factory</devsa:host>
  <devsa:detailsUrl>${SITE_URL}/events/founder-friday-capital-factory</devsa:detailsUrl>
  <devsa:rsvpUrl>https://lu.ma/founder-friday-sa</devsa:rsvpUrl>
  <devsa:rsvpMode>external</devsa:rsvpMode>
  <devsa:link rel="details">${SITE_URL}/events/founder-friday-capital-factory</devsa:link>
  <devsa:link rel="rsvp">https://lu.ma/founder-friday-sa</devsa:link>
</item>`,
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
