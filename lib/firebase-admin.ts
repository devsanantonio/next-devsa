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
  MERCH_SUBMISSIONS: 'merch_submissions',
  FAILED_ORDERS: 'failed_orders',
  ORDERS: 'orders',
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
   * Granted has no role picker — a signup there means "I'm in" and organisers
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
  profileImage?: string;
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
  submittedAt: Date;
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
