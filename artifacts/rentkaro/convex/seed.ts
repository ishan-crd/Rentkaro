"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

export const seed = action({
  handler: async (ctx) => {
    const passwordHash = await bcrypt.hash("password123", 10);
    return await ctx.runMutation(internal.seedHelpers.insertSeedData, { passwordHash });
  },
});
