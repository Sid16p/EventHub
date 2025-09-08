import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const listEvents = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let events;

    if (args.search) {
      events = await ctx.db
        .query("events")
        .withSearchIndex("search_events", (q) => {
          let searchQuery = q.search("title", args.search!);
          if (args.category) {
            searchQuery = searchQuery.eq("category", args.category);
          }
          if (args.location) {
            searchQuery = searchQuery.eq("location", args.location);
          }
          return searchQuery;
        })
        .filter((q) => q.eq(q.field("isPublic"), true))
        .collect();
    } else if (args.category) {
      events = await ctx.db
        .query("events")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isPublic"), true))
        .order("desc")
        .collect();
    } else {
      events = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("isPublic"), true))
        .order("desc")
        .collect();
    }

    // Get organizer info for each event
    const eventsWithOrganizers = await Promise.all(
      events.map(async (event) => {
        const organizer = await ctx.db.get(event.organizerId);
        const organizerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", event.organizerId))
          .unique();

        return {
          ...event,
          organizer: {
            name: organizer?.name || "Unknown",
            organizationName: organizerProfile?.organizationName,
          },
        };
      })
    );

    return eventsWithOrganizers;
  },
});

export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const organizer = await ctx.db.get(event.organizerId);
    const organizerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", event.organizerId))
      .unique();

    // Get RSVP count
    const rsvps = await ctx.db
      .query("rsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const rsvpCounts = {
      yes: rsvps.filter((r) => r.status === "yes").length,
      no: rsvps.filter((r) => r.status === "no").length,
      maybe: rsvps.filter((r) => r.status === "maybe").length,
    };

    return {
      ...event,
      organizer: {
        name: organizer?.name || "Unknown",
        organizationName: organizerProfile?.organizationName,
        contactInfo: organizerProfile?.contactInfo,
      },
      rsvpCounts,
    };
  },
});

export const getMyEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role === "organizer") {
      // Return events created by this organizer
      return await ctx.db
        .query("events")
        .withIndex("by_organizer", (q) => q.eq("organizerId", userId))
        .order("desc")
        .collect();
    } else {
      // Return events the user has RSVPed to
      const rsvps = await ctx.db
        .query("rsvps")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const events = await Promise.all(
        rsvps.map(async (rsvp) => {
          const event = await ctx.db.get(rsvp.eventId);
          return event ? { ...event, rsvpStatus: rsvp.status } : null;
        })
      );

      return events.filter((event): event is NonNullable<typeof event> => event !== null);
    }
  },
});

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.number(),
    location: v.string(),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    maxAttendees: v.optional(v.number()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role !== "organizer") {
      throw new Error("Only organizers can create events");
    }

    return await ctx.db.insert("events", {
      ...args,
      organizerId: userId,
    });
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    location: v.optional(v.string()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    maxAttendees: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.organizerId !== userId) {
      throw new Error("Only the event organizer can update this event");
    }

    const { eventId, ...updates } = args;
    await ctx.db.patch(eventId, updates);
    return eventId;
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.organizerId !== userId) {
      throw new Error("Only the event organizer can delete this event");
    }

    // Delete all RSVPs for this event
    const rsvps = await ctx.db
      .query("rsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const rsvp of rsvps) {
      await ctx.db.delete(rsvp._id);
    }

    await ctx.db.delete(args.eventId);
    return args.eventId;
  },
});
