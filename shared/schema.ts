import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, index, integer, bigint } from "drizzle-orm/pg-core";
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

// Fund management tables for smart contract integration
export const funds = pgTable("funds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  publicKey: varchar("public_key").unique().notNull(), // Solana program account
  managerId: varchar("manager_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  description: varchar("description"),
  managementFee: integer("management_fee").notNull(), // basis points (0-2000)
  performanceFee: integer("performance_fee").notNull().default(2000), // basis points (0-3000)
  minDeposit: integer("min_deposit").notNull().default(1), // minimum deposit in SOL
  fundMode: varchar("fund_mode", { enum: ["manual", "auto"] }).notNull().default("manual"), // allocation mode
  allocationOption: varchar("allocation_option", { enum: ["open", "managed", "locked"] }).notNull().default("open"), // manager allocation control
  jupiterStrictList: boolean("jupiter_strict_list").notNull().default(false), // restrict to Jupiter strict list tokens
  totalAssets: bigint("total_assets", { mode: "number" }).default(0), // in lamports
  totalShares: bigint("total_shares", { mode: "number" }).default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundAllocations = pgTable("fund_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fundId: varchar("fund_id").references(() => funds.id).notNull(),
  tokenMint: varchar("token_mint").notNull(), // Solana token mint address
  tokenSymbol: varchar("token_symbol").notNull(),
  targetPercentage: integer("target_percentage").notNull(), // 0-10000 (basis points)
  currentValue: bigint("current_value", { mode: "number" }).default(0), // in lamports
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const investorStakes = pgTable("investor_stakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").references(() => users.id).notNull(),
  fundId: varchar("fund_id").references(() => funds.id).notNull(),
  shares: bigint("shares", { mode: "number" }).notNull(),
  initialInvestment: bigint("initial_investment", { mode: "number" }).notNull(), // in lamports
  currentValue: bigint("current_value", { mode: "number" }).default(0), // in lamports
  depositedAt: timestamp("deposited_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundTransactions = pgTable("fund_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fundId: varchar("fund_id").references(() => funds.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'deposit', 'withdraw', 'rebalance', 'fee'
  amount: bigint("amount", { mode: "number" }).notNull(), // in lamports
  shares: bigint("shares", { mode: "number" }), // for deposits/withdrawals
  txSignature: varchar("tx_signature").unique(), // Solana transaction signature
  status: varchar("status").default("pending"), // pending, confirmed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for the new tables
export const insertFundSchema = createInsertSchema(funds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundAllocationSchema = createInsertSchema(fundAllocations).omit({
  id: true,
  updatedAt: true,
});

export const insertInvestorStakeSchema = createInsertSchema(investorStakes).omit({
  id: true,
  depositedAt: true,
  updatedAt: true,
});

export const insertFundTransactionSchema = createInsertSchema(fundTransactions).omit({
  id: true,
  createdAt: true,
});

// Type exports for the new tables
export type Fund = typeof funds.$inferSelect;
export type InsertFund = z.infer<typeof insertFundSchema>;
export type FundAllocation = typeof fundAllocations.$inferSelect;
export type InsertFundAllocation = z.infer<typeof insertFundAllocationSchema>;
export type InvestorStake = typeof investorStakes.$inferSelect;
export type InsertInvestorStake = z.infer<typeof insertInvestorStakeSchema>;
export type FundTransaction = typeof fundTransactions.$inferSelect;
export type InsertFundTransaction = z.infer<typeof insertFundTransactionSchema>;
