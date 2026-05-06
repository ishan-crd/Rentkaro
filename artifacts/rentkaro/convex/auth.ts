"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const register = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("tenant"), v.literal("owner")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(internal.authHelpers.getUserByEmail, {
      email: args.email,
    });
    if (existing) {
      throw new Error("Email already in use");
    }

    const passwordHash = await bcrypt.hash(args.password, 10);
    const userId = await ctx.runMutation(internal.authHelpers.createUser, {
      name: args.name,
      email: args.email,
      passwordHash,
      phone: args.phone,
      role: args.role,
    });

    const user = await ctx.runQuery(internal.authHelpers.getUserById, { userId });
    if (!user) throw new Error("Failed to create user");

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

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.authHelpers.getUserByEmail, {
      email: args.email,
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(args.password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

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
