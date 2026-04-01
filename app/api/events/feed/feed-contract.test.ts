import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

type FirestoreDoc = {
  id: string;
  data: () => Record<string, unknown>;
};

const mockDb = {
  collection: vi.fn(),
};

vi.mock('@/lib/firebase-admin', () => ({
  getDb: () => mockDb,
  COLLECTIONS: {
    EVENTS: 'events',
    COMMUNITIES: 'communities',
  },
}));

function createDoc(id: string, data: Record<string, unknown>): FirestoreDoc {
  return {
    id,
    data: () => data,
  };
}

function buildDb({
  events,
  communities,
}: {
  events: FirestoreDoc[];
  communities: FirestoreDoc[];
}) {
  mockDb.collection.mockImplementation((name: string) => {
    if (name === 'communities') {
      return {
        get: vi.fn().mockResolvedValue({ docs: communities }),
      };
    }

    if (name === 'events') {
      return {
        where: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({ docs: events }),
        }),
      };
    }

    throw new Error(`Unexpected collection: ${name}`);
  });
}

describe('events feed contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://devsa.community';
  });

  it('returns the upcoming feed with structured extension fields and community filtering', async () => {
    buildDb({
      communities: [
        createDoc('devsa', { name: 'DEVSA' }),
        createDoc('alamo-python', { name: 'Alamo Python' }),
      ],
      events: [
        createDoc('future-1', {
          title: 'AI Builders Meetup',
          slug: 'ai-builders-meetup',
          date: '2099-04-16T23:00:00.000Z',
          endTime: '2099-04-17T01:00:00.000Z',
          venue: 'Geekdom',
          address: '110 E Houston St, San Antonio, TX 78205',
          location: 'Geekdom, 110 E Houston St, San Antonio, TX 78205',
          description: '<p>Practical meetup for local builders exploring applied AI workflows and demos across the city.</p>',
          communityId: 'devsa,alamo-python',
          eventType: 'in-person',
          rsvpEnabled: true,
          createdAt: '2099-04-01T12:00:00.000Z',
        }),
        createDoc('past-1', {
          title: 'Past Event',
          slug: 'past-event',
          date: '2020-01-01T18:00:00.000Z',
          description: 'Old event',
          communityId: 'devsa',
          eventType: 'in-person',
          createdAt: '2020-01-01T12:00:00.000Z',
        }),
      ],
    });

    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://devsa.community/api/events/feed?communityId=alamo-python'));
    const xml = await response.text();

    expect(response.headers.get('content-type')).toContain('application/rss+xml');
    expect(xml).toContain('<title>DEVSA Community Calendar: alamo-python</title>');
    expect(xml).toContain('Upcoming DEVSA community events involving alamo-python.');
    expect(xml).toContain('<devsa:eventTimezone>America/Chicago</devsa:eventTimezone>');
    expect(xml).toContain('<devsa:detailsUrl>https://devsa.community/events/ai-builders-meetup</devsa:detailsUrl>');
    expect(xml).toContain('<devsa:rsvpUrl>https://devsa.community/events/ai-builders-meetup#rsvp</devsa:rsvpUrl>');
    expect(xml).toContain('<devsa:rsvpMode>internal</devsa:rsvpMode>');
    expect(xml).toContain('<devsa:host id="devsa">DEVSA</devsa:host>');
    expect(xml).toContain('<devsa:host id="alamo-python">Alamo Python</devsa:host>');
    expect(xml).toContain('<devsa:description>Practical meetup for local builders exploring applied AI workflows and demos across the city.</devsa:description>');
    expect(xml).not.toContain('Past Event');
  });

  it('returns the past feed without RSVP-specific fields while preserving details links', async () => {
    buildDb({
      communities: [
        createDoc('devsa', { name: 'DEVSA' }),
      ],
      events: [
        createDoc('past-1', {
          title: 'Founder Friday',
          slug: 'founder-friday',
          date: '2020-05-08T14:00:00.000Z',
          endTime: '2020-05-08T16:00:00.000Z',
          venue: 'Capital Factory',
          description: 'Founder-focused morning meetup for the local startup community.',
          communityId: 'devsa',
          eventType: 'hybrid',
          rsvpEnabled: true,
          url: 'https://lu.ma/founder-friday',
          createdAt: '2020-05-01T12:00:00.000Z',
        }),
        createDoc('future-1', {
          title: 'Future Event',
          slug: 'future-event',
          date: '2099-05-08T14:00:00.000Z',
          description: 'Future event',
          communityId: 'devsa',
          eventType: 'hybrid',
          createdAt: '2099-05-01T12:00:00.000Z',
        }),
      ],
    });

    const { GET } = await import('./past/route');
    const response = await GET(new NextRequest('https://devsa.community/api/events/feed/past?communityId=devsa'));
    const xml = await response.text();

    expect(xml).toContain('<title>DEVSA Community Calendar Past Events: devsa</title>');
    expect(xml).toContain('Past DEVSA community events involving devsa.');
    expect(xml).toContain('<devsa:detailsUrl>https://devsa.community/events/founder-friday</devsa:detailsUrl>');
    expect(xml).toContain('<devsa:link rel="details">https://devsa.community/events/founder-friday</devsa:link>');
    expect(xml).not.toContain('<devsa:rsvpUrl>');
    expect(xml).not.toContain('<devsa:rsvpMode>');
    expect(xml).not.toContain('rel="rsvp"');
    expect(xml).not.toContain('Future Event');
  });

  it('documents feed variants, active filters, omission rules, and examples in the schema endpoint', async () => {
    const { GET } = await import('./schema/route');
    const response = await GET();
    const schema = await response.json();

    expect(schema.feed.variants).toEqual([
      expect.objectContaining({ name: 'upcoming', feedUrl: 'https://devsa.community/api/events/feed' }),
      expect.objectContaining({ name: 'past', feedUrl: 'https://devsa.community/api/events/feed/past' }),
    ]);
    expect(schema.feed.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'communityId',
          status: 'active',
          examples: expect.arrayContaining([
            'https://devsa.community/api/events/feed?communityId=devsa',
            'https://devsa.community/api/events/feed/past?communityId=devsa',
          ]),
        }),
      ])
    );
    expect(schema.feed.omissionRules).toContain(
      'devsa:rsvpUrl and devsa:rsvpMode are omitted when no actionable RSVP destination exists, and are always omitted from the past feed.'
    );
    expect(schema.item.examples).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ scenario: 'Minimal item', xml: expect.stringContaining('<devsa:eventStart>') }),
        expect.objectContaining({ scenario: 'RSVP-enabled item', xml: expect.stringContaining('<devsa:rsvpMode>internal</devsa:rsvpMode>') }),
        expect.objectContaining({ scenario: 'Multi-host item', xml: expect.stringContaining('<devsa:host id="capital-factory">Capital Factory</devsa:host>') }),
      ])
    );
  });
});
