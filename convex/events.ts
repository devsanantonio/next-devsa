import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Helper to generate a URL-friendly slug
function generateSlug(title: string, date: string): string {
  const dateSlug = new Date(date).toISOString().split("T")[0];
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${titleSlug}-${dateSlug}`;
}

// Get all published events
export const listPublishedEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
});

// Get upcoming events (published and in the future)
export const listUpcomingEvents = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    
    return events
      .filter((e) => e.date >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
});

// Get events by community
export const listEventsByCommunity = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc")
      .collect();
  },
});

// Get event by slug
export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get events by organizer (for their dashboard)
export const listMyEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", userId))
      .order("desc")
      .collect();
  },
});

// Create a new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    location: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    communityId: v.string(),
    source: v.optional(v.union(
      v.literal("manual"),
      v.literal("meetup"),
      v.literal("luma"),
      v.literal("eventbrite")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is an organizer
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "organizer" && user.role !== "admin")) {
      throw new Error("Only organizers can create events");
    }

    // Check if user belongs to the community they're creating event for (unless admin)
    if (user.role === "organizer" && user.communityId !== args.communityId) {
      throw new Error("You can only create events for your community");
    }

    const slug = generateSlug(args.title, args.date);

    // Check if slug already exists
    const existingEvent = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    const finalSlug = existingEvent ? `${slug}-${Date.now()}` : slug;

    return await ctx.db.insert("events", {
      ...args,
      slug: finalSlug,
      organizerId: userId,
      status: "published",
      source: args.source ?? "manual",
      createdAt: Date.now(),
    });
  },
});

// Update an event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user owns the event or is admin
    const user = await ctx.db.get(userId);
    if (!user || (event.organizerId !== userId && user.role !== "admin")) {
      throw new Error("You can only edit your own events");
    }

    const { eventId, ...updates } = args;
    
    // Regenerate slug if title or date changed
    let newSlug = event.slug;
    if (updates.title || updates.date) {
      newSlug = generateSlug(
        updates.title ?? event.title,
        updates.date ?? event.date
      );
    }

    return await ctx.db.patch(eventId, {
      ...updates,
      slug: newSlug,
      updatedAt: Date.now(),
    });
  },
});

// Delete an event
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user owns the event or is admin
    const user = await ctx.db.get(userId);
    if (!user || (event.organizerId !== userId && user.role !== "admin")) {
      throw new Error("You can only delete your own events");
    }

    return await ctx.db.delete(args.eventId);
  },
});
