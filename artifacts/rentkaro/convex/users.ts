import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMe = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      _creationTime: user._creationTime,
    };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const updates: Record<string, string> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;

    await ctx.db.patch(args.userId, updates);
    const updated = await ctx.db.get(args.userId);
    return {
      _id: updated!._id,
      name: updated!.name,
      email: updated!.email,
      phone: updated!.phone,
      role: updated!.role,
      _creationTime: updated!._creationTime,
    };
  },
});
