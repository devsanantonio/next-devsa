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
  slug?: string;
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
  title: "More Human Than Human",
  date: "2026-02-28T09:00:00.000Z",
  location: "Geekdom 3rd Floor",
  description: "Join San Antonio's builders, dreamers, and technologists as we explore how AI is transforming the way we write code, test, automate, and ship.",
  url: "/events/morehumanthanhuman",
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

// Helper to generate a URL-friendly slug (same logic as Convex)
function generateSlug(title: string, date: string): string {
  const dateSlug = new Date(date).toISOString().split("T")[0];
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${titleSlug}-${dateSlug}`;
}

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
    slug: generateSlug("Alamo Python Meetup - January 2026", "2026-01-28T09:00:00.000Z"),
  },
];
