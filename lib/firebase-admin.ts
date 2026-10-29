import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth, Auth as AdminAuth } from 'firebase-admin/auth';

let adminAuthInstance: AdminAuth | null = null;

let app: App | null = null;
let firestoreInstance: Firestore | null = null;

// Initialize Firebase Admin SDK lazily
function getFirebaseApp(): App {
  if (app) {
    return app;
  }

  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    app = initializeApp({
      credential: cert(serviceAccount),
    });
    
    return app;
  } catch (error) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', error);
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format');
  }
}

// Export a getter for the Firestore instance
// Uses the 'devsa' database ID instead of default
export function getDb(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }
  
  const firebaseApp = getFirebaseApp();
  firestoreInstance = getFirestore(firebaseApp, 'devsa');
  return firestoreInstance;
}

// Export a getter for Firebase Admin Auth (server-side token verification)
export function getFirebaseAdminAuth(): AdminAuth {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }
  
  const firebaseApp = getFirebaseApp();
  adminAuthInstance = getAdminAuth(firebaseApp);
  return adminAuthInstance;
}

// Collection names
export const COLLECTIONS = {
  NEWSLETTER: 'newsletter_subscriptions',
  SPEAKERS: 'speaker_submissions',
  ACCESS_REQUESTS: 'access_requests',
  VOLUNTEER_SIGNUPS: 'volunteer_signups',
  APPROVED_ADMINS: 'approved_admins',
  EVENTS: 'events',
  COMMUNITIES: 'communities',
  PARTNERS: 'partners',
  EVENT_RSVPS: 'event_rsvps',
  AI_CONFERENCE_SPEAKERS: 'ai_conference_speakers',
  AI_CONFERENCE_SESSIONS: 'ai_conference_sessions',
  AI_CONFERENCE_SPONSORS: 'ai_conference_sponsors',
  // Removed with the bounty board: job_board_users, job_listings, job_comments,
  // job_applications, bounties, bounty_claims, bounty_deliverables,
  // conversations, messages, notifications, saved_jobs.
  //
  // Removed with the Discord digest crons: news_articles, youtube_videos.
  //
  // ALL THIRTEEN STILL HOLD DATA. Counted against the `devsa` database on
  // 2026-08-16: 2,444 documents, of which 12 are job_board_users — real
  // accounts, whose owners can no longer sign in now that the auth layer is
  // gone. The bulk is digest cache (news_articles 1150, youtube_videos 1265),
  // which is genuinely inert; the job_board_* and conversations/messages/
  // notifications/saved_jobs rows involve people and deserve a decision rather
  // than a delete.
  //
  // An earlier pass in this repo claimed all thirteen were empty. That count
  // was taken against the DEFAULT database. getDb() below opens the NAMED
  // database 'devsa', and getFirestore(app) without that argument silently
  // reads a different, near-empty one in the same project. Any script that
  // audits this data must pass 'devsa' explicitly or it will report zeros for
  // everything and look like a clean bill of health.
  //
  // Named here rather than silently dropped because "the code stopped
  // referencing it" and "the data is gone" are different claims, and only the
  // first one is true.
  DEVSA_SUBSCRIBERS: 'devsa_subscribers',
  // Logo submissions from the shop's "Submit Your Logo" form, removed
  // 2026-10-12 along with its admin tab, and then the shop itself. Empty when
  // checked that day.
  MERCH_SUBMISSIONS: 'merch_submissions',
  // Partner and sponsor inquiries from the Confluencia page. The page and its
  // form left the site on 2026-10-13 (434 MEDIA activates the event, with
  // DEVSA as a partner), so nothing new arrives. The admin tab stays so the
  // leads already here can be followed up or handed over. Admin and super
  // admin only — organizers never see them, in the API or the dashboard.
  DEMO_DAY_INQUIRIES: 'demo_day_inquiries',
  // Inquiries from /get-involved: partners, sponsors and general questions.
  // Admin and super admin only, like Confluencia inquiries.
  GET_INVOLVED_INQUIRIES: 'get_involved_inquiries',
  // One document per calendar subscription code (lib/calendar-subscribe.ts),
  // written by /api/events/calendar each time a calendar app polls it.
  CALENDAR_SUBSCRIPTIONS: 'calendar_subscriptions',
  // The shop's order audit trail. The shop, Printify integration and its
  // reconcile cron were removed on 2026-10-12; nothing writes these now.
  // `orders` holds one document: a June 2026 hat that was never produced
  // (Printify accepted it but could not collect payment), refunded in Stripe
  // and canceled in Printify. Kept as the record of that.
  FAILED_ORDERS: 'failed_orders',
  ORDERS: 'orders',
  // Who created, changed or deleted what in the admin, newest read first. A
  // delete keeps the record it removed, so it can be restored from the
  // Activity tab. Written by lib/activity-log.ts; admins and super admins read it.
  ACTIVITY_LOG: 'activity_log',
  // One document per newsletter sent from the admin: who, when, subject, counts.
  NEWSLETTER_SENDS: 'newsletter_sends',
} as const;

/**
 * Sort comparator for anything with an optional `order` and a `name`.
 *
 * Deliberately applied in memory rather than as a Firestore `orderBy('order')`.
 * Firestore excludes documents that lack the ordered field entirely, so the
 * moment one record is dragged into position every record that has never been
 * dragged would vanish from the site — a reorder silently becoming a delete.
 *
 * Ordered records come first in their set order; the rest fall to the end
 * alphabetically, which is where they already were.
 */
export type Orderable = { id: string; order?: number; name?: string }

export function byDisplayOrder(a: Orderable, b: Orderable): number {
  const ao = a.order ?? Number.MAX_SAFE_INTEGER;
  const bo = b.order ?? Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return (a.name || '').localeCompare(b.name || '');
}

// Types for Firestore documents
export interface NewsletterSubscription {
  email: string;
  subscribedAt: Date;
  source?: string | null;
  status: 'active' | 'unsubscribed';
}

export interface SpeakerSubmission {
  name: string;
  email: string;
  company?: string | null;
  sessionTitle: string;
  sessionFormat?: string | null;
  /** Submission track (e.g. Startup Week's speaking tracks). */
  track?: string | null;
  abstract: string;
  /** Short speaker bio. */
  bio?: string | null;
  /** Speaker LinkedIn or website URL. */
  linkedin?: string | null;
  /** Who the talk is pitched at — e.g. PySanAntonio's Beginner/Intermediate/Advanced. */
  audienceLevel?: string | null;
  /**
   * Which lineup the speaker wants to be considered for. PySanAntonio asks
   * this so a talk that doesn't fit the conference can be routed to Alamo
   * Python's regular meetups instead of being turned down.
   */
  considerFor?: string | null;
  /** Accessibility, scheduling or A/V requests. */
  accommodations?: string | null;
  eventId?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  /** Who last set the status in the admin, and when. */
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * Someone answering the Demo Day ask: offering the lead seat, the build
 * partnership, the evening sponsorship, or something else.
 *
 * Free text is stored through sanitizeInput, so it holds HTML entities
 * ("&amp;"), not raw characters — safe to drop into the notification email,
 * and decoded for display in the admin inbox.
 */
export interface DemoDayInquiry {
  name: string;
  email: string;
  organization: string;
  /** Their title or role at the organization. */
  title: string | null;
  /** 'lead' | 'build' | 'evening' | 'other' — see DEMO_DAY_INTERESTS. */
  interest: string;
  /** One of DEMO_DAY_INDUSTRIES, 'Other', or null when not given. */
  industry: string | null;
  message: string;
  submittedAt: Date;
  status: 'new' | 'contacted' | 'closed';
}

/** One submission of the /get-involved form. See lib/get-involved.ts. */
export interface GetInvolvedInquiry {
  /** 'partner' | 'sponsor' | 'general' */
  path: string;
  /** For a partner: one of PARTNER_WAYS' keys. Null on the other paths. */
  way: string | null;
  name: string;
  email: string;
  organization: string | null;
  /** Their title or role. */
  title: string | null;
  /** For a sponsor: the event they have in mind, if any. No longer asked —
   *  sponsoring moved to the donation form — but kept on older records. */
  event: string | null;
  /** For a question: what it is about, if they said. */
  subject?: string | null;
  message: string;
  submittedAt: Date;
  status: 'new' | 'contacted' | 'closed';
}

export interface AccessRequest {
  name: string;
  email: string;
  communityOrg: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Someone offering to help run an event, as opposed to speak at one.
 *
 * Kept separate from SpeakerSubmission rather than folded into it with a role
 * flag: the admin Speakers tab treats every document in that collection as a
 * talk to accept or reject, and a volunteer has no title or abstract to judge.
 *
 * `eventId` matches the speaker submissions' key (e.g. 'access-granted-2026')
 * so both halves of one event's open call can be pulled with the same filter.
 */
export interface VolunteerSignup {
  name: string;
  email: string;
  /** Which org they're turning up with, if any. */
  org?: string | null;
  /**
   * What they put their hand up for, when the event asks. Optional: Access
   * Granted has no role picker — a signup there means "I'm in" and organizers
   * assign work by reaching out — so this is null for those records.
   */
  role?: string | null;
  /** Free text: what they'd bring, what they can't cover, when they can be there. */
  notes?: string | null;
  eventId: string;
  submittedAt: Date;
  status: 'pending' | 'confirmed' | 'declined';
}

export interface ApprovedAdmin {
  email: string;
  approvedAt: Date;
  /**
   * Last successful admin-auth check — see /api/admin/auth, which writes it.
   *
   * Recorded by us rather than read from Firebase Auth, because admin sign-in
   * does not go through Firebase Auth: it is an email checked against this
   * collection, so there is no `lastSignInTime` anywhere to read.
   *
   * Absent for anyone approved but never seen since this started recording.
   */
  lastLoginAt?: Date;
  approvedBy?: string;
  role: 'superadmin' | 'admin' | 'organizer';
  communityId?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;   // a profiles/ blob only; see lib/profile-photo.ts
  /**
   * The organizer directory: other signed-in organizers see these on the
   * Communities tab. Nothing here is public, and none of it is shown until the
   * person ticks `inDirectory` themselves. Every save stamps
   * `profileConfirmedAt`, so a stale contact shows its age.
   */
  title?: string | null;          // their role in the group: "Organizer", "President"
  contactEmail?: string | null;   // shown instead of the sign-in email when set
  linkedin?: string | null;
  gradTerm?: string | null;       // student leads: "May 2027", so successors are planned for
  inDirectory?: boolean;
  profileConfirmedAt?: Date;
  /**
   * Groups an admin or super admin also runs, picked on their own profile. Each
   * one adds an organizer view to the account menu and lists them in that
   * group's directory. Organizers have one group, `communityId`, and ignore this.
   */
  organizerOf?: string[] | null;
}

/** A lead who handed the group on, kept so the group's history outlives the handoff. No contact details. */
export interface PastLead {
  name: string;
  title?: string | null;
  until: string;                  // "May 2026"
}

// Community (formerly TechCommunity from static data)
export interface Community {
  id: string; // Firestore doc ID matches this
  name: string;
  /**
   * Display position, set by dragging in the admin. Absent until someone
   * reorders — see `byDisplayOrder`, which is what keeps unordered records
   * visible rather than letting a Firestore orderBy drop them.
   */
  order?: number;
  logo: string;
  description: string;
  website?: string;
  discord?: string;
  meetup?: string;
  luma?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  twitch?: string;
  facebook?: string;
  github?: string;
  /** Absent means a tech group; student orgs are filtered apart in the organizer directory. */
  kind?: 'tech' | 'student';
  school?: string | null;
  pastLeads?: PastLead[];
  createdAt: Date;
  updatedAt?: Date;
}

// Partner organization
export interface Partner {
  id: string; // Firestore doc ID matches this
  name: string;
  /** Display position, set by dragging in the admin. See `byDisplayOrder`. */
  order?: number;
  logo: string;
  description: string;
  website?: string;
  video?: string;
  isEasterEgg?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Protected super admin - cannot be removed or have role changed
// The original super admin. Who is protected from removal or demotion is
// PROTECTED_ADMIN_EMAILS in lib/protected-admins.ts — check there, not here.
export const SUPER_ADMIN_EMAIL = 'jesse@devsanantonio.com';

export interface Event {
  title: string;
  slug: string;
  date: string;
  endTime?: string; // ISO string for event end time
  location: string;
  venue?: string;
  address?: string;
  description: string;
  url?: string;
  communityId: string;
  communityName?: string; // Display name for custom/one-off communities
  partnerId?: string; // Comma-separated partner IDs co-hosting the event
  /**
   * DEVSA is the host, not merely the listing platform — an activation it
   * convened rather than one of the 24 groups' own meetups.
   *
   * A flag rather than a convention, because the obvious alternatives are both
   * wrong. DEVSA is not one of the communities it indexes, so a `devsa`
   * community record would put it on the wall alongside the groups it exists
   * to serve. And it is not a partner of itself, so it cannot be inferred from
   * `partnerId`. Neither of those is a thing an organizer could get right by
   * accident, which is what makes it worth its own field.
   *
   * Drives the spotlight treatment on the calendar. Absent on every event that
   * predates it, which reads as false.
   */
  isOfficial?: boolean;
  /**
   * Link only: reachable at its own URL, left off every list and feed. See
   * lib/event-visibility.ts, which every listing surface goes through.
   */
  unlisted?: boolean;
  /** Addresses this event used before; the event page redirects from them. See lib/event-slug.ts. */
  slugHistory?: string[];
  /**
   * One question of the organizer's own on the DEVSA RSVP form — Luma's custom
   * registration question. Only means anything while rsvpEnabled; null when unset.
   */
  rsvpQuestion?: string | null;
  /** Whether attendees must answer rsvpQuestion. */
  rsvpQuestionRequired?: boolean;
  /**
   * The room's limit for the DEVSA RSVP form. Past it, sign-ups join a waitlist
   * and an organizer moves people up by hand (attendees can't cancel their own
   * RSVP, so nothing would free a spot automatically). Null: no limit.
   */
  capacity?: number | null;
  /** "Message attendees" sends, newest last. At most two per event; see /api/events/notify. */
  messages?: { at: Date; by: string; subject: string; sent: number }[];
  /**
   * One line, in the organizer's words, for the Monday Discord digest. When
   * unset the digest uses the description's first sentence, which is often
   * warm-up ("Looking to find a relaxing evening out?"). Plain text, at most
   * 120 characters; null when unset.
   */
  summary?: string | null;
  /**
   * An activation with a design system of its own — see lib/event-brands.ts.
   *
   * Keyed by name rather than carrying colors, because these are identities
   * and not palettes. An earlier pass offered a color picker on every official
   * event, which was the wrong question twice over: it asked for a hex where
   * the answer is a brand, and being tied to `isOfficial` it dressed an AWS
   * pentesting session in The Model's wordmark.
   */
  brand?: string;
  /**
   * Where "View Details" goes, when it should not go to this site.
   *
   * Its own field rather than reusing `url`, which 20 published events already
   * carry alongside a slug — their Meetup and Luma pages. Letting `url` win
   * would quietly redirect all of them off the site. This one is only ever set
   * deliberately, so it can take precedence without collateral.
   *
   * Opens in a new tab: it is leaving devsa.community.
   */
  detailsUrl?: string;
  organizerEmail: string;
  source?: 'manual' | 'meetup' | 'luma' | 'eventbrite';
  status?: 'draft' | 'published' | 'cancelled';
  eventType?: 'in-person' | 'hybrid' | 'virtual';
  rsvpEnabled?: boolean;
  externalRsvpUrl?: string | null;
  sharedToDiscord?: boolean;
  sharedToLinkedIn?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface EventRSVP {
  eventId: string;
  eventSlug: string;
  communityId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinNewsletter: boolean;
  /** The question as it read when this person answered, so a later edit cannot relabel old answers. */
  question?: string;
  answer?: string;
  submittedAt: Date;
  /** Signed up after the event was full. Not counted, not reminded, until an organizer moves them up. */
  waitlisted?: boolean;
  promotedAt?: Date | null;
  /** Ticked at the door; what turnout is counted from. */
  checkedInAt?: Date | null;
}

// AI Conference types
export interface AIConferenceSpeaker {
  name: string;
  email: string;
  company?: string;
  title?: string;
  bio: string;
  photo?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  status: 'confirmed' | 'pending' | 'declined';
  order?: number;
  createdAt: Date;
}

export interface AIConferenceSession {
  title: string;
  abstract: string;
  speakerId: string;
  speakerName: string;
  format: 'talk' | 'lightning' | 'panel' | 'workshop';
  time?: string;
  room?: string;
  status: 'scheduled' | 'pending' | 'cancelled';
  order?: number;
  createdAt: Date;
}

export interface AIConferenceSponsor {
  name: string;
  logo: string;
  website?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'community';
  order?: number;
  createdAt: Date;
}

/**
 * One calendar subscription, keyed by its random code (the document id).
 * firstSeen and lastSeen are when its calendar app first and last polled the
 * feed; a subscription polled across more than a day is a real one, not a
 * single click or someone opening the link once.
 */
export interface CalendarSubscription {
  firstSeen: Date;
  lastSeen: Date;
  fetches: number;
  /** google | apple | outlook | other, from the poller's user-agent. */
  client: 'google' | 'apple' | 'outlook' | 'other';
}
