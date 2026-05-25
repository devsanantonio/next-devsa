import { NextRequest, NextResponse } from "next/server";
import { verifyJobBoardUser } from "@/lib/auth-middleware";
import { createExpressDashboardLink } from "@/lib/stripe-connect";

// POST - Generate a Stripe-hosted Express dashboard URL so a claimant who's
// finished onboarding can manage their payout account (bank, payouts history,
// tax forms). Stripe enforces that the requester is the account owner via
// the account link token, so we don't need additional checks here beyond
// requiring auth + matching the user's stored Connect account id.
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  const accountId = result.profile?.stripeConnectAccountId;
  if (!accountId) {
    return NextResponse.json(
      { error: "No payout account yet. Start onboarding first." },
      { status: 404 }
    );
  }

  try {
    const url = await createExpressDashboardLink(accountId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Connect login error:", error);
    return NextResponse.json(
      { error: "Failed to open the Stripe dashboard. Please try again." },
      { status: 500 }
    );
  }
}
