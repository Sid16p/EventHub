import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.number(), // timestamp
    location: v.string(),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    organizerId: v.id("users"),
    maxAttendees: v.optional(v.number()),
    isPublic: v.boolean(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .searchIndex("search_events", {
      searchField: "title",
      filterFields: ["category", "location"],
    }),

  rsvps: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    status: v.union(v.literal("yes"), v.literal("no"), v.literal("maybe")),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_and_event", ["userId", "eventId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("organizer"), v.literal("attendee")),
    organizationName: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    contactInfo: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("rsvp_confirmation"),
      v.literal("event_reminder"),
      v.literal("event_update"),
      v.literal("rsvp_status_change")
    ),
    title: v.string(),
    message: v.string(),
    eventId: v.optional(v.id("events")),
    isRead: v.boolean(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
