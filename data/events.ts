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
  id: "devsa-meetup-1",
  type: "devsa",
  title: "DevSA Monthly Meetup",
  date: new Date().toISOString(),
  location: "San Antonio, TX",
  description: "Join the local developer community for talks, networking, and collaboration.",
  url: "https://devsa.io/events",
};

export const featuredOnDemandEvent: OnDemandEvent | null = {
  id: "devsa-on-demand-1",
  type: "on-demand",
  title: "Building the San Antonio Dev Ecosystem",
  date: new Date().toISOString(),
  location: "On-demand video",
  description: "Watch a recorded session on how DevSA supports builders in San Antonio.",
  url: "https://devsa.io/on-demand",
};

export const initialCommunityEvents: CommunityEvent[] = [
  {
    id: "community-1",
    type: "community",
    title: "Python San Antonio Meetup",
    date: new Date().toISOString(),
    location: "Geekdom, San Antonio, TX",
    description: "Monthly meetup for Python developers of all levels.",
    communityTag: "alamo-python",
    source: "manual",
    url: "https://www.meetup.com/python-san-antonio/",
  },
];
