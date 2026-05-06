import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("tenant"), v.literal("owner")),
  }).index("by_email", ["email"]),

  properties: defineTable({
    title: v.string(),
    description: v.string(),
    city: v.string(),
    address: v.string(),
    rent: v.number(),
    deposit: v.number(),
    genderPreference: v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("any")
    ),
    roomType: v.union(
      v.literal("single"),
      v.literal("double"),
      v.literal("triple"),
      v.literal("shared")
    ),
    amenities: v.array(v.string()),
    images: v.array(v.string()),
    availability: v.boolean(),
    viewCount: v.number(),
    ownerId: v.id("users"),
  })
    .index("by_owner", ["ownerId"])
    .index("by_city", ["city"]),

  bookings: defineTable({
    propertyId: v.id("properties"),
    tenantId: v.id("users"),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_property", ["propertyId"]),

  reviews: defineTable({
    propertyId: v.id("properties"),
    tenantId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    sentimentScore: v.optional(v.number()),
    sentimentLabel: v.optional(v.string()),
  })
    .index("by_property", ["propertyId"])
    .index("by_tenant", ["tenantId"]),
});
