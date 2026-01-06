import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Users extended with organizer role
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    // Organizer fields
    role: v.optional(v.union(v.literal("admin"), v.literal("organizer"), v.literal("user"))),
    communityId: v.optional(v.string()), // References community id from data/communities
  })
    .index("email", ["email"]),

  // Community Events - the main event calendar
  events: defineTable({
    title: v.string(),
    slug: v.string(),
    date: v.string(), // ISO date string
    location: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    communityId: v.string(), // References community id from data/communities
    organizerId: v.id("users"),
    source: v.optional(v.union(
      v.literal("manual"),
      v.literal("meetup"),
      v.literal("luma"),
      v.literal("eventbrite")
    )),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("cancelled")
    )),
    // OG Image fields
    ogImageUrl: v.optional(v.string()),
    // Timestamps
    createdAt: v.float64(),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_slug", ["slug"])
    .index("by_community", ["communityId"])
    .index("by_organizer", ["organizerId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"]),

  // Newsletter subscriptions
  newsletterSubscriptions: defineTable({
    email: v.string(),
    subscribedAt: v.float64(),
    source: v.optional(v.string()), // Where they signed up from
    magenSessionId: v.optional(v.string()),
    magenHumanScore: v.optional(v.float64()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("unsubscribed")
    )),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Call for Speakers submissions
  speakerSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    sessionTitle: v.string(),
    sessionFormat: v.string(),
    abstract: v.string(),
    eventId: v.optional(v.string()), // Which conference they're applying to
    submittedAt: v.float64(),
    magenSessionId: v.optional(v.string()),
    magenHumanScore: v.optional(v.float64()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
  })
    .index("by_email", ["email"])
    .index("by_event", ["eventId"])
    .index("by_status", ["status"]),
});
