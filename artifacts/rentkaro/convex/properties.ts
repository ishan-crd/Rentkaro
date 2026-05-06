import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

async function enrichProperty(
  ctx: any,
  property: any,
  includeReviews = false
) {
  const owner = await ctx.db.get(property.ownerId);
  const reviews = await ctx.db
    .query("reviews")
    .withIndex("by_property", (q: any) => q.eq("propertyId", property._id))
    .collect();
  const bookings = await ctx.db
    .query("bookings")
    .withIndex("by_property", (q: any) => q.eq("propertyId", property._id))
    .collect();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length
      : null;

  const avgSentiment =
    reviews.filter((r: any) => r.sentimentScore != null).length > 0
      ? reviews
          .filter((r: any) => r.sentimentScore != null)
          .reduce((sum: number, r: any) => sum + r.sentimentScore!, 0) /
        reviews.filter((r: any) => r.sentimentScore != null).length
      : null;

  const enrichedReviews = includeReviews
    ? await Promise.all(
        reviews.map(async (r: any) => {
          const tenant = await ctx.db.get(r.tenantId);
          return {
            _id: r._id,
            propertyId: r.propertyId,
            tenantId: r.tenantId,
            tenantName: tenant?.name ?? "Unknown",
            rating: r.rating,
            comment: r.comment,
            sentimentScore: r.sentimentScore,
            sentimentLabel: r.sentimentLabel,
            createdAt: r._creationTime,
          };
        })
      )
    : undefined;

  return {
    _id: property._id,
    title: property.title,
    description: property.description,
    city: property.city,
    address: property.address,
    rent: property.rent,
    deposit: property.deposit,
    genderPreference: property.genderPreference,
    roomType: property.roomType,
    amenities: property.amenities,
    images: property.images,
    availability: property.availability,
    viewCount: property.viewCount,
    ownerId: property.ownerId,
    ownerName: owner?.name ?? "Unknown",
    ownerPhone: owner?.phone,
    rating: avgRating,
    reviewCount: reviews.length,
    bookingCount: bookings.length,
    sentimentScore: avgSentiment,
    createdAt: property._creationTime,
    ...(includeReviews ? { reviews: enrichedReviews } : {}),
  };
}

export const list = query({
  args: {
    city: v.optional(v.string()),
    minRent: v.optional(v.number()),
    maxRent: v.optional(v.number()),
    genderPreference: v.optional(v.string()),
    roomType: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let properties = await ctx.db.query("properties").collect();

    // Filter
    if (args.city) {
      const cityLower = args.city.toLowerCase();
      properties = properties.filter((p) =>
        p.city.toLowerCase().includes(cityLower)
      );
    }
    if (args.minRent) {
      properties = properties.filter((p) => p.rent >= args.minRent!);
    }
    if (args.maxRent) {
      properties = properties.filter((p) => p.rent <= args.maxRent!);
    }
    if (args.genderPreference && args.genderPreference !== "any") {
      properties = properties.filter(
        (p) => p.genderPreference === args.genderPreference
      );
    }
    if (args.roomType) {
      properties = properties.filter((p) => p.roomType === args.roomType);
    }
    properties = properties.filter((p) => p.availability);

    // Enrich all
    const enriched = await Promise.all(
      properties.map((p) => enrichProperty(ctx, p))
    );

    // Sort
    const sortBy = args.sortBy || "newest";
    enriched.sort((a, b) => {
      switch (sortBy) {
        case "rent_asc":
          return a.rent - b.rent;
        case "rent_desc":
          return b.rent - a.rent;
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "views":
          return b.viewCount - a.viewCount;
        default:
          return b.createdAt - a.createdAt;
      }
    });

    // Paginate
    const page = args.page || 1;
    const limit = Math.min(args.limit || 12, 50);
    const total = enriched.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = enriched.slice(start, start + limit);

    return { properties: paginated, total, page, totalPages };
  },
});

export const get = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id);
    if (!property) return null;

    // Increment view count
    await ctx.db.patch(args.id, { viewCount: property.viewCount + 1 });

    return enrichProperty(ctx, property, true);
  },
});

export const recommended = query({
  args: { limit: v.optional(v.number()), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 6, 20);
    let properties = await ctx.db.query("properties").collect();
    properties = properties.filter((p) => p.availability);

    // Sort by viewCount descending
    properties.sort((a, b) => b.viewCount - a.viewCount);
    properties = properties.slice(0, limit);

    return Promise.all(properties.map((p) => enrichProperty(ctx, p)));
  },
});

export const cities = query({
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").collect();
    const cityMap = new Map<string, number>();
    for (const p of properties) {
      cityMap.set(p.city, (cityMap.get(p.city) || 0) + 1);
    }
    return Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  },
});

export const myProperties = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    const enriched = await Promise.all(
      properties.map((p) => enrichProperty(ctx, p))
    );
    enriched.sort((a, b) => b.createdAt - a.createdAt);
    return enriched;
  },
});

export const create = mutation({
  args: {
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
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("properties", {
      ...args,
      viewCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("properties"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    rent: v.optional(v.number()),
    deposit: v.optional(v.number()),
    genderPreference: v.optional(
      v.union(v.literal("male"), v.literal("female"), v.literal("any"))
    ),
    roomType: v.optional(
      v.union(
        v.literal("single"),
        v.literal("double"),
        v.literal("triple"),
        v.literal("shared")
      )
    ),
    amenities: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    availability: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, any> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[key] = val;
    }
    await ctx.db.patch(id, filtered);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
