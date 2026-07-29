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
  id: "pysanantonio-2026",
  type: "devsa",
  title: "PySanAntonio II — San Antonio's Python Conference",
  date: "2026-10-02T18:00:00.000Z", // 1:00 PM CDT
  location: "Geekdom, 3rd Floor — San Antonio, TX",
  description: "San Antonio's Python conference returns for a second year — an afternoon of learning, networking, and community building with the people already doing the work here. Led by Alamo Python, backed by the PyTexas Foundation, hosted by DEVSA inside SA Startup + Tech Week. The call for speakers is open through August 15.",
  url: "/events/pysanantonio",
  video: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa2.mp4",
};

export const featuredOnDemandEvent: OnDemandEvent | null = {
  id: "pysanantonio-2025",
  type: "on-demand",
  title: "PySanAntonio: The First Python Conference in San Antonio",
  date: "2025-11-08T00:00:00.000Z",
  location: "On-demand video",
  description: "PySanAntonio brought together developers, data scientists, security specialists, automation engineers, hobbyists, and curious minds across all experience levels. Powered by Alamo Python, PyTexas, and the DEVSA Community. Watch now to see how San Antonio is embracing Python and building a vibrant local community around it.",
  url: "/events/pysanantonio/2025",
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
