import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("tenant"), v.literal("owner")),
  },
  handler: async (ctx, args) => {
    let bookings;

    if (args.role === "tenant") {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.userId))
        .collect();
    } else {
      // Owner: get all bookings for their properties
      const properties = await ctx.db
        .query("properties")
        .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
        .collect();
      const propertyIds = new Set(properties.map((p) => p._id));

      const allBookings = await ctx.db.query("bookings").collect();
      bookings = allBookings.filter((b) => propertyIds.has(b.propertyId));
    }

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const property = await ctx.db.get(b.propertyId);
        const tenant = await ctx.db.get(b.tenantId);
        return {
          _id: b._id,
          propertyId: b.propertyId,
          propertyTitle: property?.title ?? "Unknown",
          propertyCity: property?.city ?? "Unknown",
          tenantId: b.tenantId,
          tenantName: tenant?.name ?? "Unknown",
          tenantPhone: tenant?.phone,
          tenantEmail: tenant?.email ?? "",
          message: b.message,
          status: b.status,
          createdAt: b._creationTime,
        };
      })
    );

    enriched.sort((a, b) => b.createdAt - a.createdAt);
    return enriched;
  },
});

export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    tenantId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    return await ctx.db.insert("bookings", {
      propertyId: args.propertyId,
      tenantId: args.tenantId,
      message: args.message,
      status: "pending",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
