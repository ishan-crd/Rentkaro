import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  real,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const genderPrefEnum = pgEnum("gender_preference", [
  "male",
  "female",
  "any",
]);
export const roomTypeEnum = pgEnum("room_type", [
  "single",
  "double",
  "triple",
  "shared",
]);

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  rent: integer("rent").notNull(),
  deposit: integer("deposit").notNull(),
  genderPreference: genderPrefEnum("gender_preference").notNull().default("any"),
  roomType: roomTypeEnum("room_type").notNull().default("single"),
  amenities: text("amenities").array().notNull().default([]),
  images: text("images").array().notNull().default([]),
  availability: boolean("availability").notNull().default(true),
  viewCount: integer("view_count").notNull().default(0),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({
  id: true,
  viewCount: true,
  createdAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
