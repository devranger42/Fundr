import { users, type User, type InsertUser, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  getUserByTwitterId(twitterId: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  upsertUser(userData: UpsertUser): Promise<User>;
  linkTwitterToWallet(walletAddress: string, twitterData: Partial<UpsertUser>): Promise<User>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async getUserByTwitterId(twitterId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.twitterId, twitterId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Try to find existing user by wallet or Twitter ID
    let existingUser: User | undefined;
    
    if (userData.walletAddress) {
      existingUser = await this.getUserByWallet(userData.walletAddress);
    }
    
    if (!existingUser && userData.twitterId) {
      existingUser = await this.getUserByTwitterId(userData.twitterId);
    }

    if (existingUser) {
      // Update existing user
      const [user] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return user;
    } else {
      // Create new user
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    }
  }

  async linkTwitterToWallet(walletAddress: string, twitterData: Partial<UpsertUser>): Promise<User> {
    const existingUser = await this.getUserByWallet(walletAddress);
    
    if (!existingUser) {
      throw new Error("Wallet user not found");
    }

    const [user] = await db
      .update(users)
      .set({
        ...twitterData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning();
    
    return user;
  }
}

export const storage = new DatabaseStorage();
