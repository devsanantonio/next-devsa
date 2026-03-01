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
  video?: string;
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
  id: "pytexas-2026",
  type: "devsa",
  title: "PyTexas Conference 2026",
  date: "2026-04-17T09:00:00.000Z",
  location: "Austin, TX",
  description: "Celebrating 20 years — Join the largest gathering of Python developers in Texas for three days of software development, data science, and community. April 17–19, 2026.",
  url: "https://www.pytexas.org/2026/",
};

export const featuredOnDemandEvent: OnDemandEvent | null = {
  id: "pysanantonio",
  type: "on-demand",
  title: "PySanAntonio: The First Python Conference in San Antonio",
  date: "2025-11-08T00:00:00.000Z",
  location: "On-demand video",
  description: "PySanAntonio brought together developers, data scientists, security specialists, automation engineers, hobbyists, and curious minds across all experience levels. Powered by Alamo Python, PyTexas, and the DEVSA Community. Watch now to see how San Antonio is embracing Python and building a vibrant local community around it.",
  url: "/events/pysanantonio",
};

export const moreHumanThanHumanEvent: OnDemandEvent | null = {
  id: "more-human-than-human-2026",
  type: "on-demand",
  title: "More Human Than Human: AI Conference powered by the DEVSA Community",
  date: "2026-02-28T00:00:00.000Z",
  location: "Geekdom",
  description: "As AI shifts from a tool we use to an agent that acts, the boundary between human and machine is disappearing. Join San Antonio's builders, dreamers, and technologists for a deep dive into how AI is fundamentally re-architecting the way we write code, secure the internet, and lead organizations.",
  url: "https://www.digitalcanvas.community/conferences/morehumanthanhuman",
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

export const initialCommunityEvents: CommunityEvent[] = [];
