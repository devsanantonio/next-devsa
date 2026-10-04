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

/**
 * The one DEVSA event FeaturedDevsaEvent promotes, or null when there is none.
 *
 * Null right now. It held PySanAntonio II, which ran on 2 October 2026 as the
 * closing day of SA Startup + Tech Week, and its description still advertised
 * a call for speakers that had closed on 25 September. Nothing renders
 * FeaturedDevsaEvent at the moment, so none of that was visible — which is
 * exactly why it rotted. A stale record behind an unmounted component is worse
 * than an empty one, because it comes back the moment someone remounts it and
 * looks like current information.
 *
 * Null is a supported state and the component has a branch for it, so leaving
 * this empty is correct until there is a real next event. Set it, and the
 * component promotes it; there is nothing else to wire up.
 */
export const upcomingDevsaEvent: DevsaEvent | null = null;

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
  // No "powered by the DEVSA Community" here any more. The section this card
  // sits in is headed "Watch Past Conferences Powered by DEVSA", so the card
  // was saying it a second time inside the block that already said it.
  title: "More Human Than Human: AI Conference",
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
