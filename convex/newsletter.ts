import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Magen verification thresholds
const MAGEN_THRESHOLDS = {
  newsletter: 0.3,
};

// Subscribe to newsletter
export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
    magenSessionId: v.optional(v.string()),
    magenHumanScore: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Check Magen score if provided
    if (args.magenHumanScore !== undefined && args.magenHumanScore < MAGEN_THRESHOLDS.newsletter) {
      throw new Error("Verification failed");
    }

    // Check if already subscribed
    const existing = await ctx.db
      .query("newsletterSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      // If previously unsubscribed, resubscribe
      if (existing.status === "unsubscribed") {
        return await ctx.db.patch(existing._id, {
          status: "active",
          subscribedAt: Date.now(),
          source: args.source,
          magenSessionId: args.magenSessionId,
          magenHumanScore: args.magenHumanScore,
        });
      }
      // Already subscribed
      return existing._id;
    }

    // Create new subscription
    return await ctx.db.insert("newsletterSubscriptions", {
      email: args.email.toLowerCase(),
      subscribedAt: Date.now(),
      source: args.source,
      magenSessionId: args.magenSessionId,
      magenHumanScore: args.magenHumanScore,
      status: "active",
    });
  },
});

// Unsubscribe from newsletter
export const unsubscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("newsletterSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return await ctx.db.patch(subscription._id, {
      status: "unsubscribed",
    });
  },
});

// Check subscription status (for displaying in UI)
export const checkSubscription = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("newsletterSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    return {
      isSubscribed: subscription?.status === "active",
    };
  },
});
