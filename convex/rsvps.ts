import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getUserRSVP = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("rsvps")
      .withIndex("by_user_and_event", (q) => 
        q.eq("userId", userId).eq("eventId", args.eventId)
      )
      .unique();
  },
});

export const getEventRSVPs = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is the organizer of this event
    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== userId) {
      throw new Error("Only the event organizer can view RSVPs");
    }

    const rsvps = await ctx.db
      .query("rsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get user info for each RSVP
    const rsvpsWithUsers = await Promise.all(
      rsvps.map(async (rsvp) => {
        const user = await ctx.db.get(rsvp.userId);
        return {
          ...rsvp,
          user: {
            name: user?.name || "Unknown",
            email: user?.email || "",
          },
        };
      })
    );

    return rsvpsWithUsers;
  },
});

export const createOrUpdateRSVP = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("yes"), v.literal("no"), v.literal("maybe")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role !== "attendee") {
      throw new Error("Only attendees can RSVP to events");
    }

    // Check if event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Check if RSVP already exists
    const existingRSVP = await ctx.db
      .query("rsvps")
      .withIndex("by_user_and_event", (q) => 
        q.eq("userId", userId).eq("eventId", args.eventId)
      )
      .unique();

    if (existingRSVP) {
      // Update existing RSVP
      await ctx.db.patch(existingRSVP._id, {
        status: args.status,
        notes: args.notes,
      });
      return existingRSVP._id;
    } else {
      // Create new RSVP
      const rsvpId = await ctx.db.insert("rsvps", {
        userId,
        eventId: args.eventId,
        status: args.status,
        notes: args.notes,
      });

      // Create notification for organizer
      await ctx.db.insert("notifications", {
        userId: event.organizerId,
        type: "rsvp_confirmation",
        title: "New RSVP",
        message: `Someone ${args.status === "yes" ? "accepted" : args.status === "no" ? "declined" : "might attend"} your event "${event.title}"`,
        eventId: args.eventId,
        isRead: false,
      });

      return rsvpId;
    }
  },
});

export const deleteRSVP = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const rsvp = await ctx.db
      .query("rsvps")
      .withIndex("by_user_and_event", (q) => 
        q.eq("userId", userId).eq("eventId", args.eventId)
      )
      .unique();

    if (!rsvp) throw new Error("RSVP not found");

    await ctx.db.delete(rsvp._id);
    return rsvp._id;
  },
});
