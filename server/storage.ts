import {
  users,
  funds,
  fundAllocations,
  investorStakes,
  fundTransactions,
  type User,
  type InsertUser,
  type UpsertUser,
  type Fund,
  type InsertFund,
  type FundAllocation,
  type InsertFundAllocation,
  type InvestorStake,
  type InsertInvestorStake,
  type FundTransaction,
  type InsertFundTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, desc, and, sum } from "drizzle-orm";

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

  // Fund operations
  createFund(fundData: InsertFund): Promise<Fund>;
  getFund(id: string): Promise<Fund | undefined>;
  getFundByPublicKey(publicKey: string): Promise<Fund | undefined>;
  getAllFunds(): Promise<Fund[]>;
  getFundsByManager(managerId: string): Promise<Fund[]>;
  updateFund(id: string, updates: Partial<Fund>): Promise<Fund>;
  
  // Fund allocation operations
  setFundAllocations(fundId: string, allocations: InsertFundAllocation[]): Promise<FundAllocation[]>;
  getFundAllocations(fundId: string): Promise<FundAllocation[]>;
  
  // Investor stake operations
  createInvestorStake(stakeData: InsertInvestorStake): Promise<InvestorStake>;
  getInvestorStakes(investorId: string): Promise<InvestorStake[]>;
  getFundStakes(fundId: string): Promise<InvestorStake[]>;
  updateInvestorStake(id: string, updates: Partial<InvestorStake>): Promise<InvestorStake>;
  
  // Transaction operations
  createTransaction(transactionData: InsertFundTransaction): Promise<FundTransaction>;
  getFundTransactions(fundId: string): Promise<FundTransaction[]>;
  getUserTransactions(userId: string): Promise<FundTransaction[]>;
  updateTransactionStatus(id: string, status: string, txSignature?: string): Promise<FundTransaction>;
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

  // Fund operations
  async createFund(fundData: InsertFund): Promise<Fund> {
    const [fund] = await db
      .insert(funds)
      .values(fundData)
      .returning();
    return fund;
  }

  async getFund(id: string): Promise<Fund | undefined> {
    const [fund] = await db.select().from(funds).where(eq(funds.id, id));
    return fund;
  }

  async getFundByPublicKey(publicKey: string): Promise<Fund | undefined> {
    const [fund] = await db.select().from(funds).where(eq(funds.publicKey, publicKey));
    return fund;
  }

  async getAllFunds(): Promise<Fund[]> {
    return await db.select().from(funds).where(eq(funds.isActive, true)).orderBy(desc(funds.createdAt));
  }

  async getFundsByManager(managerId: string): Promise<Fund[]> {
    return await db.select().from(funds)
      .where(and(eq(funds.managerId, managerId), eq(funds.isActive, true)))
      .orderBy(desc(funds.createdAt));
  }

  async updateFundAllocation(id: string, updates: Partial<FundAllocation>): Promise<FundAllocation> {
    const [allocation] = await db
      .update(fundAllocations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fundAllocations.id, id))
      .returning();
    return allocation;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateFund(id: string, updates: Partial<Fund>): Promise<Fund> {
    const [fund] = await db
      .update(funds)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(funds.id, id))
      .returning();
    return fund;
  }

  async deleteFund(id: string): Promise<{ success: boolean; withdrawnInvestors: number }> {
    // Get all investor stakes for this fund
    const stakes = await this.getFundStakes(id);
    
    // Process withdrawal for each investor
    // In a real implementation, this would:
    // 1. Sell all token positions to SOL
    // 2. Calculate each investor's share
    // 3. Transfer SOL back to investors
    // 4. Record withdrawal transactions
    
    let withdrawnInvestors = 0;
    
    // Create withdrawal transactions for all active stakes
    for (const stake of stakes) {
      if (stake.shares > 0) {
        // Calculate withdrawal amount based on current fund value
        const withdrawalAmount = stake.currentValue || stake.initialInvestment; // Use current value or initial investment
        
        // Create withdrawal transaction record
        await this.createTransaction({
          fundId: id,
          userId: stake.investorId,
          type: 'withdrawal',
          amount: withdrawalAmount,
          shares: stake.shares,
          txSignature: 'fund_deletion_withdrawal_' + Date.now(),
        });
        
        // Zero out the stake
        await this.updateInvestorStake(stake.id, {
          shares: 0,
          currentValue: 0,
        });
        
        withdrawnInvestors++;
      }
    }
    
    // Delete fund data (keeping transaction history)
    await db.delete(fundAllocations).where(eq(fundAllocations.fundId, id));
    await db.delete(funds).where(eq(funds.id, id));
    
    return { success: true, withdrawnInvestors };
  }

  // Fund allocation operations
  async setFundAllocations(fundId: string, allocations: InsertFundAllocation[]): Promise<FundAllocation[]> {
    // Delete existing allocations
    await db.delete(fundAllocations).where(eq(fundAllocations.fundId, fundId));
    
    // Insert new allocations
    if (allocations.length > 0) {
      const allocationsWithFundId = allocations.map(allocation => ({
        ...allocation,
        fundId,
      }));
      
      return await db
        .insert(fundAllocations)
        .values(allocationsWithFundId)
        .returning();
    }
    
    return [];
  }

  async getFundAllocations(fundId: string): Promise<FundAllocation[]> {
    return await db.select().from(fundAllocations)
      .where(eq(fundAllocations.fundId, fundId));
  }

  // Investor stake operations
  async createInvestorStake(stakeData: InsertInvestorStake): Promise<InvestorStake> {
    const [stake] = await db
      .insert(investorStakes)
      .values(stakeData)
      .returning();
    return stake;
  }

  async getInvestorStakes(investorId: string): Promise<InvestorStake[]> {
    return await db.select().from(investorStakes)
      .where(eq(investorStakes.investorId, investorId))
      .orderBy(desc(investorStakes.depositedAt));
  }

  async getFundStakes(fundId: string): Promise<InvestorStake[]> {
    return await db.select().from(investorStakes)
      .where(eq(investorStakes.fundId, fundId))
      .orderBy(desc(investorStakes.depositedAt));
  }

  async updateInvestorStake(id: string, updates: Partial<InvestorStake>): Promise<InvestorStake> {
    const [stake] = await db
      .update(investorStakes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(investorStakes.id, id))
      .returning();
    return stake;
  }

  // Transaction operations
  async createTransaction(transactionData: InsertFundTransaction): Promise<FundTransaction> {
    const [transaction] = await db
      .insert(fundTransactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getFundTransactions(fundId: string): Promise<FundTransaction[]> {
    return await db.select().from(fundTransactions)
      .where(eq(fundTransactions.fundId, fundId))
      .orderBy(desc(fundTransactions.createdAt));
  }

  async getUserTransactions(userId: string): Promise<FundTransaction[]> {
    return await db.select().from(fundTransactions)
      .where(eq(fundTransactions.userId, userId))
      .orderBy(desc(fundTransactions.createdAt));
  }

  async updateTransactionStatus(id: string, status: string, txSignature?: string): Promise<FundTransaction> {
    const updates: Partial<FundTransaction> = { status };
    if (txSignature) {
      updates.txSignature = txSignature;
    }

    const [transaction] = await db
      .update(fundTransactions)
      .set(updates)
      .where(eq(fundTransactions.id, id))
      .returning();
    return transaction;
  }
}

export const storage = new DatabaseStorage();
