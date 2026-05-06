import { query } from "./_generated/server";
import { v } from "convex/values";

export const platformStats = query({
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").collect();
    const users = await ctx.db.query("users").collect();
    const bookings = await ctx.db.query("bookings").collect();

    const cities = new Set(properties.map((p) => p.city));

    return {
      totalProperties: properties.length,
      totalCities: cities.size,
      totalTenants: users.filter((u) => u.role === "tenant").length,
      totalOwners: users.filter((u) => u.role === "owner").length,
      totalBookings: bookings.length,
    };
  },
});

export const ownerStats = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    const propertyIds = new Set(properties.map((p) => p._id));

    const allBookings = await ctx.db.query("bookings").collect();
    const bookings = allBookings.filter((b) => propertyIds.has(b.propertyId));

    const allReviews = await ctx.db.query("reviews").collect();
    const reviews = allReviews.filter((r) => propertyIds.has(r.propertyId));

    const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    // Recent inquiries
    const recentBookings = bookings
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5);

    const recentInquiries = await Promise.all(
      recentBookings.map(async (b) => {
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

    return {
      totalProperties: properties.length,
      totalInquiries: bookings.length,
      pendingInquiries: bookings.filter((b) => b.status === "pending").length,
      approvedBookings: bookings.filter((b) => b.status === "approved").length,
      totalViews,
      averageRating: avgRating,
      recentInquiries,
    };
  },
});
