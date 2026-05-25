import { stripe } from "@/lib/stripe";
import {
  getDb,
  COLLECTIONS,
  type JobBoardUser,
} from "@/lib/firebase-admin";
import type Stripe from "stripe";

// Slice 3c: payouts go through Stripe Connect Express accounts owned by each
// claimant. We only need the `transfers` capability — claimants receive money
// from the DEVSA platform, they don't process their own charges.
//
// Country scope for v1: US only. Stripe enforces this via the `country` field
// on account creation.
const CONNECT_COUNTRY = "US" as const;

// Required onboarding state for a claimant to actually receive a payout in
// Slice 3e. Stripe sets these flags as the user completes Express onboarding.
export function isConnectPayoutReady(profile?: Partial<JobBoardUser> | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.stripeConnectAccountId &&
      profile.stripeConnectPayoutsEnabled &&
      profile.stripeConnectDetailsSubmitted &&
      !profile.stripeConnectRequirementsDisabled
  );
}

export interface ConnectStatus {
  hasAccount: boolean;
  accountId?: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDisabled: boolean;
  country?: string;
}

/**
 * Read the cached Connect state from a user profile. Exposed as a public
 * helper so /api/auth/verify can include it on the dashboard response.
 */
export function readConnectStatus(profile?: Partial<JobBoardUser> | null): ConnectStatus {
  if (!profile?.stripeConnectAccountId) {
    return {
      hasAccount: false,
      payoutsEnabled: false,
      chargesEnabled: false,
      detailsSubmitted: false,
      requirementsDisabled: false,
    };
  }
  return {
    hasAccount: true,
    accountId: profile.stripeConnectAccountId,
    payoutsEnabled: Boolean(profile.stripeConnectPayoutsEnabled),
    chargesEnabled: Boolean(profile.stripeConnectChargesEnabled),
    detailsSubmitted: Boolean(profile.stripeConnectDetailsSubmitted),
    requirementsDisabled: Boolean(profile.stripeConnectRequirementsDisabled),
    country: profile.stripeConnectCountry,
  };
}

/**
 * Create a Stripe Connect Express account for a claimant on first use, or
 * return the existing account id. Either way, also returns a fresh onboarding
 * account link the dashboard should redirect the user to.
 *
 * The siteUrl + paths drive Stripe's `refresh_url` / `return_url` for the
 * hosted onboarding flow.
 */
export async function startOnboarding(opts: {
  uid: string;
  email: string;
  profile: Partial<JobBoardUser>;
  siteUrl: string;
}): Promise<{ url: string; accountId: string }> {
  const db = getDb();
  const userRef = db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(opts.uid);

  let accountId = opts.profile.stripeConnectAccountId;
  if (!accountId) {
    const created = await stripe.accounts.create({
      type: "express",
      country: CONNECT_COUNTRY,
      email: opts.email,
      capabilities: {
        // Receive-only marketplace — only `transfers` needed for payouts.
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        uid: opts.uid,
        role: opts.profile.role || "open-to-work",
        platform: "devsa-bounties",
      },
    });
    accountId = created.id;

    // Persist the account id immediately so a retry doesn't create a duplicate.
    await userRef.update({
      stripeConnectAccountId: accountId,
      stripeConnectCountry: CONNECT_COUNTRY,
      stripeConnectChargesEnabled: false,
      stripeConnectPayoutsEnabled: false,
      stripeConnectDetailsSubmitted: false,
      stripeConnectRequirementsDisabled: false,
      stripeConnectUpdatedAt: new Date(),
      updatedAt: new Date(),
    } as Partial<JobBoardUser>);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${opts.siteUrl}/bounties/dashboard?connect=refresh`,
    return_url: `${opts.siteUrl}/bounties/dashboard?connect=return`,
    type: "account_onboarding",
  });

  return { url: link.url, accountId };
}

/**
 * Generate a Stripe Express dashboard login link for a claimant who has
 * already finished onboarding. Useful for letting them update their bank
 * info, see payouts, etc.
 */
export async function createExpressDashboardLink(accountId: string): Promise<string> {
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

/**
 * Apply a Stripe Account object back onto our user record. Used by the
 * webhook handler whenever Stripe pushes us an `account.updated` event.
 *
 * Lookup priority:
 *   1. `account.metadata.uid` (set when we created the account)
 *   2. fallback: `stripeConnectAccountId == account.id` query
 *
 * Side effect: returns the affected uid (or null if nothing matched) so the
 * webhook can log + audit.
 */
export async function syncAccountFromStripe(account: Stripe.Account): Promise<string | null> {
  const db = getDb();
  const metadataUid = (account.metadata as Record<string, string> | undefined)?.uid;

  let userRef: FirebaseFirestore.DocumentReference | null = null;
  if (metadataUid) {
    userRef = db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(metadataUid);
    const exists = await userRef.get();
    if (!exists.exists) userRef = null;
  }
  if (!userRef) {
    const lookup = await db
      .collection(COLLECTIONS.JOB_BOARD_USERS)
      .where("stripeConnectAccountId", "==", account.id)
      .limit(1)
      .get();
    if (lookup.empty) return null;
    userRef = lookup.docs[0].ref;
  }

  // currently_due includes anything Stripe is blocking on; a non-empty list
  // means the account is restricted from payouts until the requirements are
  // satisfied (e.g. additional ID, business doc).
  const currentlyDue = account.requirements?.currently_due ?? [];
  const requirementsDisabled = Boolean(account.requirements?.disabled_reason) || currentlyDue.length > 0;

  const update: Partial<JobBoardUser> = {
    stripeConnectAccountId: account.id,
    stripeConnectChargesEnabled: account.charges_enabled,
    stripeConnectPayoutsEnabled: account.payouts_enabled,
    stripeConnectDetailsSubmitted: account.details_submitted,
    stripeConnectRequirementsDisabled: requirementsDisabled,
    stripeConnectCountry: account.country ?? undefined,
    stripeConnectUpdatedAt: new Date(),
    updatedAt: new Date(),
  };

  const clean = Object.fromEntries(
    Object.entries(update).filter(([, v]) => v !== undefined)
  );
  await userRef.set(clean, { merge: true });

  return userRef.id;
}

/**
 * Used when Stripe sends `account.application.deauthorized`: the user
 * unlinked their Express account from our platform. Clear all Connect fields
 * so the next onboarding attempt creates a fresh account.
 */
export async function clearConnectAccountByStripeId(accountId: string): Promise<string | null> {
  const db = getDb();
  const lookup = await db
    .collection(COLLECTIONS.JOB_BOARD_USERS)
    .where("stripeConnectAccountId", "==", accountId)
    .limit(1)
    .get();
  if (lookup.empty) return null;
  const ref = lookup.docs[0].ref;
  await ref.update({
    stripeConnectAccountId: null,
    stripeConnectChargesEnabled: false,
    stripeConnectPayoutsEnabled: false,
    stripeConnectDetailsSubmitted: false,
    stripeConnectRequirementsDisabled: false,
    stripeConnectCountry: null,
    stripeConnectUpdatedAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Partial<JobBoardUser>);
  return ref.id;
}
