import { NextRequest, NextResponse } from "next/server";
import { verifyJobBoardUser } from "@/lib/auth-middleware";
import { startOnboarding } from "@/lib/stripe-connect";

// POST - Start (or resume) Stripe Connect Express onboarding for the
// authenticated user. Returns a Stripe-hosted URL the client should redirect
// to.
//
// Idempotent: if the user already has a Connect account, we don't create a
// new one — we just generate a fresh account link (Stripe account links
// expire). Used both for first-time onboarding and for resuming after the
// user abandoned the hosted flow.
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community";

    const { url, accountId } = await startOnboarding({
      uid: result.uid,
      email: result.email,
      profile: result.profile!,
      siteUrl: origin,
    });

    return NextResponse.json({ url, accountId });
  } catch (error) {
    console.error("Connect onboard error:", error);
    return NextResponse.json(
      { error: "Failed to start payout onboarding. Please try again." },
      { status: 500 }
    );
  }
}
