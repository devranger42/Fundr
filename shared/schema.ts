import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Updated users table to support both wallet and Twitter auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Wallet authentication
  walletAddress: text("wallet_address").unique(),
  
  // Twitter authentication
  twitterId: text("twitter_id").unique(),
  twitterUsername: text("twitter_username"),
  twitterDisplayName: text("twitter_display_name"),
  twitterProfileImage: text("twitter_profile_image"),
  
  // Profile information
  email: varchar("email"),
  displayName: text("display_name"),
  bio: text("bio"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Legacy fields for backwards compatibility
  username: text("username").unique(),
  password: text("password"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  twitterId: true,
  twitterUsername: true,
  twitterDisplayName: true,
  twitterProfileImage: true,
  email: true,
  displayName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
