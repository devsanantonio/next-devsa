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
  APPROVED_ADMINS: 'approved_admins',
  EVENTS: 'events',
  COMMUNITIES: 'communities',
  PARTNERS: 'partners',
  EVENT_RSVPS: 'event_rsvps',
  AI_CONFERENCE_SPEAKERS: 'ai_conference_speakers',
  AI_CONFERENCE_SESSIONS: 'ai_conference_sessions',
  AI_CONFERENCE_SPONSORS: 'ai_conference_sponsors',
  // Job Board collections
  JOB_BOARD_USERS: 'job_board_users',
  JOB_LISTINGS: 'job_listings',
  JOB_COMMENTS: 'job_comments',
  JOB_APPLICATIONS: 'job_applications',
  // Bounty marketplace
  BOUNTIES: 'bounties',
  BOUNTY_CLAIMS: 'bounty_claims',
  BOUNTY_DELIVERABLES: 'bounty_deliverables',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  SAVED_JOBS: 'saved_jobs',
  DEVSA_SUBSCRIBERS: 'devsa_subscribers',
  MERCH_SUBMISSIONS: 'merch_submissions',
  FAILED_ORDERS: 'failed_orders',
  // News digest
  NEWS_ARTICLES: 'news_articles',
  // YouTube digest
  YOUTUBE_VIDEOS: 'youtube_videos',
} as const;

// Types for Firestore documents
export interface NewsletterSubscription {
  email: string;
  subscribedAt: Date;
  source?: string | null;
  magenSessionId?: string | null;
  magenVerdict?: string | null;
  magenScore?: number | null;
  status: 'active' | 'unsubscribed';
}

export interface SpeakerSubmission {
  name: string;
  email: string;
  company?: string | null;
  sessionTitle: string;
  sessionFormat: string;
  abstract: string;
  eventId?: string;
  submittedAt: Date;
  magenSessionId?: string | null;
  magenVerdict?: string | null;
  magenScore?: number | null;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AccessRequest {
  name: string;
  email: string;
  communityOrg: string;
  submittedAt: Date;
  magenSessionId?: string | null;
  magenVerdict?: string | null;
  magenScore?: number | null;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ApprovedAdmin {
  email: string;
  approvedAt: Date;
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

// ========================================
// Job Board Types
// ========================================

export interface WorkHistoryEntry {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface ProjectSpotlight {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  projectUrl?: string;
}

export interface JobBoardUser {
  uid: string; // Firebase Auth UID
  email: string;
  role: 'hiring' | 'open-to-work';
  displayName?: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  phone?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  workHistory: WorkHistoryEntry[];
  education: EducationEntry[];
  projectSpotlights: ProjectSpotlight[];
  companyName?: string; // for hiring role
  companyLogo?: string; // for hiring role
  companyDescription?: string; // for hiring role
  companySize?: string; // for hiring role
  industry?: string; // for hiring role
  companyLocation?: string; // for hiring role
  foundedYear?: string; // for hiring role
  benefits?: string[]; // for hiring role
  techStack?: string[]; // for hiring role
  skills?: string[]; // for open-to-work role
  certifications?: CertificationEntry[]; // for open-to-work role
  resumeUrl?: string; // for open-to-work role
  jobPreferences?: JobPreferences; // for open-to-work role
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
}

export interface JobPreferences {
  desiredTitle?: string;
  desiredTypes?: string[]; // w2, 1099, equity, internship
  desiredLocations?: string[]; // remote, onsite, hybrid
  desiredSalary?: string;
  openToRelocation?: boolean;
}

export interface JobListing {
  id: string;
  authorUid: string;
  authorName: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  slug: string;
  type: 'w2' | '1099' | 'equity' | 'internship' | 'other';
  locationType: 'remote' | 'onsite' | 'hybrid';
  location?: string;
  salaryRange?: string;
  description: string;
  requirements?: string;
  applicationUrl?: string;
  equityRange?: string;
  startupStage?: string;
  tags: string[];
  communityId?: string;
  status: 'draft' | 'pending' | 'published' | 'closed' | 'expired' | 'rejected';
  applicantCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface JobComment {
  id: string;
  jobId: string;
  authorUid: string;
  authorName: string;
  authorImage?: string;
  authorRole: 'hiring' | 'open-to-work';
  content: string;
  mentions: string[]; // UIDs of @mentioned users
  parentCommentId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// Bounty marketplace
// ----------------------------------------------------------------------------
// A bounty is a bite-sized, fixed-price piece of work posted by an organization
// (typically a local nonprofit or startup) and claimed by a community member.
// DEVSA acts as the bridge — funds are held in escrow at posting time via
// Stripe Connect and released to the claimant on approval, minus an 8%
// platform fee that funds DEVSA programming.
// ============================================================================

export type BountyCategory =
  | 'website'
  | 'integration'
  | 'automation'
  | 'data'
  | 'design'
  | 'ai'
  | 'accessibility'
  | 'devops'
  | 'mobile'
  | 'other';

export type BountyStatus =
  | 'draft'          // poster is still composing
  | 'pending_review' // submitted, awaiting DEVSA admin review
  | 'open'           // approved + funded, accepting claims
  | 'claimed'        // a claimant is working on it
  | 'in_review'      // claimant submitted deliverable, awaiting poster approval
  | 'completed'      // approved + paid out
  | 'disputed'       // poster + claimant disagree, admin involvement
  | 'cancelled'      // pulled by poster before claim, escrow refunded
  | 'expired';       // open too long without a claim

export interface Bounty {
  id: string;
  posterUid: string;
  posterName: string;
  posterImage?: string;
  orgName: string;       // the organization posting (e.g. nonprofit name)
  orgLogo?: string;
  orgVerifiedNonprofit?: boolean; // set true by admin after 501(c)(3) verification
  title: string;
  slug: string;
  summary: string;       // one-line pitch shown on cards
  description: string;   // long-form scope (markdown / sanitized HTML)
  deliverables: string[]; // checklist of what "done" means
  category: BountyCategory;
  tags: string[];
  // Money
  amountCents: number;           // gross bounty amount (what poster funds)
  platformFeeCents: number;      // DEVSA's cut (e.g. 8% of amount)
  payoutCents: number;           // claimant receives this (amount - fee)
  currency: 'usd';
  // Escrow state
  escrowStatus: 'unfunded' | 'funded' | 'released' | 'refunded';
  stripePaymentIntentId?: string;
  // Timeline
  estimatedHours?: number;
  deadlineAt?: Date;
  // Match
  status: BountyStatus;
  claimantUid?: string;
  claimantName?: string;
  claimedAt?: Date;
  completedAt?: Date;
  // Visibility
  isPublic: boolean;      // false = invite-only / hidden
  applicantCount: number; // how many devs have expressed interest
  createdAt: Date;
  updatedAt?: Date;
  expiresAt?: Date;
}

// Expressions of interest before a poster picks a claimant. Once a claim is
// accepted, that claim's status becomes 'accepted' and others become 'declined'.
export interface BountyClaim {
  id: string;
  bountyId: string;
  bountyTitle: string;
  claimantUid: string;
  claimantName: string;
  claimantEmail: string;
  claimantImage?: string;
  pitchNote: string;        // why this person; relevant work, approach, timeline
  proposedTimelineDays?: number;
  portfolioLinks?: string[];
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  createdAt: Date;
  decidedAt?: Date;
}

// Submitted work / artifacts attached to a claimed bounty.
export interface BountyDeliverable {
  id: string;
  bountyId: string;
  claimantUid: string;
  summary: string;
  links: string[];   // PR URLs, deployed previews, file links
  notes?: string;
  submittedAt: Date;
  reviewStatus: 'pending' | 'approved' | 'changes_requested' | 'rejected';
  reviewNote?: string;
  reviewedAt?: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantUid: string;
  applicantName: string;
  applicantEmail: string;
  coverNote?: string;
  status: 'submitted' | 'viewed' | 'shortlisted' | 'rejected';
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[]; // array of UIDs
  participantNames: Record<string, string>;
  participantImages: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Date;
  jobId?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  senderImage?: string;
  content: string;
  readAt?: Date;
  createdAt: Date;
}

export interface Notification {
  id: string;
  recipientUid: string;
  type: 'message' | 'comment' | 'mention' | 'application' | 'status-update';
  title: string;
  body: string;
  link: string; // in-app route
  sourceUid: string;
  sourceName: string;
  referenceId: string; // jobId or conversationId
  read: boolean;
  createdAt: Date;
}

export interface SavedJob {
  id: string;
  userUid: string;
  jobId: string;
  savedAt: Date;
}
