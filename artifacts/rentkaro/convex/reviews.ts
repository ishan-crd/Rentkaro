import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    tenantId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    // Compute sentiment from rating
    const base = (args.rating - 1) / 4;
    const noise = (Math.random() - 0.5) * 0.1;
    const sentimentScore = Math.max(0, Math.min(1, base + noise));
    const sentimentLabel =
      sentimentScore > 0.6
        ? "positive"
        : sentimentScore >= 0.4
          ? "neutral"
          : "negative";

    return await ctx.db.insert("reviews", {
      propertyId: args.propertyId,
      tenantId: args.tenantId,
      rating: args.rating,
      comment: args.comment,
      sentimentScore,
      sentimentLabel,
    });
  },
});
