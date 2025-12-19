// Use TechCommunity ids directly so tags stay in sync with data/communities
export type CommunityTag = string;

export type EventType = "devsa" | "on-demand" | "community";

export interface BaseEvent {
  id: string;
  title: string;
  date: string; // ISO string
  location: string;
  description: string;
  url?: string;
}

export interface DevsaEvent extends BaseEvent {
  type: "devsa";
}

export interface OnDemandEvent extends BaseEvent {
  type: "on-demand";
}

export interface CommunityEvent extends BaseEvent {
  type: "community";
  /**
   * Id of the TechCommunity from data/communities
   */
  communityTag: CommunityTag;
  source?: "manual" | "meetup" | "luma" | "eventbrite";
}

export type AnyEvent = DevsaEvent | OnDemandEvent | CommunityEvent;

export const upcomingDevsaEvent: DevsaEvent | null = {
  id: "devsa-ai-conference-2026",
  type: "devsa",
  title: "Dream It. Ship It",
  date: "2026-02-28T09:00:00.000Z",
  location: "Geekdom 3rd Floor",
  description: "DEVSA is the bridge connecting builders across San Antonio’s core industries. We are bringing together professionals from Military, Cybersecurity, Health, Science, Web Development, and the Creative Arts to explore the AI tools and real-world use cases redefining our industry workflows.",
  url: "/events/aiconference2026",
};

export const featuredOnDemandEvent: OnDemandEvent | null = {
  id: "pysanantonio",
  type: "on-demand",
  title: "PySanAntonio: The First Python Conference in San Antonio",
  date: "2025-11-08T00:00:00.000Z",
  location: "On-demand video",
  description: "PySanAntonio brought together developers, data scientists, security specialists, automation engineers, hobbyists, and curious minds across all experience levels.",
  url: "/events/pysanantonio",
};

export const initialCommunityEvents: CommunityEvent[] = [
  {
    id: "community-1",
    type: "community",
    title: "Alamo Python Meetup - January 2026",
    date: "2026-01-28T09:00:00.000Z",
    location: "Digital Canvas HQ - Finesilver",
    description: "Monthly meetup for Python developers of all levels.",
    communityTag: "alamo-python",
    source: "manual",
    url: "https://www.meetup.com/python-san-antonio/",
  },
];
