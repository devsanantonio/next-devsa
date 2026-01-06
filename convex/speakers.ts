import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Magen verification thresholds
const MAGEN_THRESHOLDS = {
  formSubmission: 0.5,
};

// Submit a call for speakers application
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    sessionTitle: v.string(),
    sessionFormat: v.string(),
    abstract: v.string(),
    eventId: v.optional(v.string()),
    magenSessionId: v.optional(v.string()),
    magenHumanScore: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    // Validate required fields
    if (!args.name || !args.email || !args.sessionTitle || !args.sessionFormat || !args.abstract) {
      throw new Error("Missing required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Check Magen score if provided
    if (args.magenHumanScore !== undefined && args.magenHumanScore < MAGEN_THRESHOLDS.formSubmission) {
      throw new Error("Verification failed - low confidence score");
    }

    // Create submission
    return await ctx.db.insert("speakerSubmissions", {
      name: args.name,
      email: args.email.toLowerCase(),
      company: args.company,
      sessionTitle: args.sessionTitle,
      sessionFormat: args.sessionFormat,
      abstract: args.abstract,
      eventId: args.eventId,
      submittedAt: Date.now(),
      magenSessionId: args.magenSessionId,
      magenHumanScore: args.magenHumanScore,
      status: "pending",
    });
  },
});

// Get submissions for an event (admin only - would need auth check in production)
export const listSubmissionsForEvent = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("speakerSubmissions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();
  },
});

// Update submission status (admin only)
export const updateSubmissionStatus = mutation({
  args: {
    submissionId: v.id("speakerSubmissions"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    // In production, add auth check for admin role
    return await ctx.db.patch(args.submissionId, {
      status: args.status,
    });
  },
});
