import type { Express } from "express";
import { storage } from "./storage";
import { 
  insertFundSchema, 
  insertFundAllocationSchema,
  insertInvestorStakeSchema,
  insertFundTransactionSchema 
} from "@shared/schema";

export function registerFundRoutes(app: Express) {
  
  // Get all active funds
  app.get('/api/funds', async (req, res) => {
    try {
      const funds = await storage.getAllFunds();
      
      // Get allocations for each fund
      const fundsWithAllocations = await Promise.all(
        funds.map(async (fund) => {
          const allocations = await storage.getFundAllocations(fund.id);
          return {
            ...fund,
            allocations,
          };
        })
      );
      
      res.json(fundsWithAllocations);
    } catch (error) {
      console.error("Error fetching funds:", error);
      res.status(500).json({ message: "Failed to fetch funds" });
    }
  });

  // Get specific fund by ID
  app.get('/api/funds/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const fund = await storage.getFund(id);
      
      if (!fund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      
      const allocations = await storage.getFundAllocations(fund.id);
      const stakes = await storage.getFundStakes(fund.id);
      const transactions = await storage.getFundTransactions(fund.id);
      
      res.json({
        ...fund,
        allocations,
        stakes,
        transactions,
      });
    } catch (error) {
      console.error("Error fetching fund:", error);
      res.status(500).json({ message: "Failed to fetch fund" });
    }
  });

  // Update fund properties (PATCH)
  app.patch('/api/funds/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { fundMode } = req.body;
      
      // Validate fund exists
      const existingFund = await storage.getFund(id);
      if (!existingFund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      
      // TODO: Add authentication check to ensure user is the fund manager
      // if (existingFund.managerId !== req.user?.id) {
      //   return res.status(403).json({ message: "Not authorized to modify this fund" });
      // }
      
      // Validate fund mode if provided
      if (fundMode && !['manual', 'auto'].includes(fundMode)) {
        return res.status(400).json({ message: "Invalid fund mode. Must be 'manual' or 'auto'" });
      }
      
      // Update fund
      const updatedFund = await storage.updateFund(id, {
        ...(fundMode && { fundMode })
      });
      
      if (!updatedFund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      
      res.json({
        message: "Fund updated successfully",
        fund: updatedFund
      });
    } catch (error) {
      console.error("Error updating fund:", error);
      res.status(500).json({ message: "Failed to update fund" });
    }
  });

  // Create new fund (requires authentication)
  app.post('/api/funds', async (req, res) => {
    try {
      console.log('=== CREATE FUND REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      // TODO: Add authentication middleware
      // const userId = req.user?.claims?.sub;
      // if (!userId) {
      //   return res.status(401).json({ message: "Unauthorized" });
      // }

      const validatedData = insertFundSchema.parse(req.body);
      console.log('Validated data:', validatedData);
      
      const fund = await storage.createFund(validatedData);
      console.log('Created fund:', fund);
      
      // Set initial allocations if provided
      if (req.body.allocations && req.body.allocations.length > 0) {
        const validatedAllocations = req.body.allocations.map((allocation: any) =>
          insertFundAllocationSchema.parse({
            ...allocation,
            fundId: fund.id
          })
        );
        
        await storage.setFundAllocations(fund.id, validatedAllocations);
      }
      
      res.status(201).json(fund);
    } catch (error) {
      console.error("Error creating fund:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ message: "Invalid fund data", details: error.message });
      } else {
        res.status(500).json({ message: "Failed to create fund" });
      }
    }
  });

  // Update fund allocations (requires fund manager auth)
  app.put('/api/funds/:id/allocations', async (req, res) => {
    try {
      const { id } = req.params;
      
      // TODO: Verify user is fund manager
      const fund = await storage.getFund(id);
      if (!fund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      
      const validatedAllocations = req.body.allocations.map((allocation: any) =>
        insertFundAllocationSchema.parse(allocation)
      );
      
      const allocations = await storage.setFundAllocations(id, validatedAllocations);
      
      res.json(allocations);
    } catch (error) {
      console.error("Error updating allocations:", error);
      res.status(500).json({ message: "Failed to update allocations" });
    }
  });

  // Deposit to fund (requires authentication)
  app.post('/api/funds/:id/deposit', async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, shares } = req.body;
      
      // TODO: Add authentication
      // const userId = req.user?.claims?.sub;
      // if (!userId) {
      //   return res.status(401).json({ message: "Unauthorized" });
      // }

      const fund = await storage.getFund(id);
      if (!fund) {
        return res.status(404).json({ message: "Fund not found" });
      }

      // Create transaction record
      const transaction = await storage.createTransaction({
        fundId: id,
        userId: "temp-user-id", // TODO: Use actual user ID
        type: "deposit",
        amount,
        shares,
        status: "pending",
      });

      // Create or update investor stake
      const stake = await storage.createInvestorStake({
        investorId: "temp-user-id", // TODO: Use actual user ID
        fundId: id,
        shares,
        initialInvestment: amount,
        currentValue: amount,
      });

      res.json({ transaction, stake });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  // Withdraw from fund (requires authentication)
  app.post('/api/funds/:id/withdraw', async (req, res) => {
    try {
      const { id } = req.params;
      const { shares } = req.body;
      
      // TODO: Add authentication
      // const userId = req.user?.claims?.sub;
      
      const fund = await storage.getFund(id);
      if (!fund) {
        return res.status(404).json({ message: "Fund not found" });
      }

      // Calculate withdrawal amount based on current fund value
      const shareValue = (fund.totalAssets || 0) / (fund.totalShares || 1);
      const withdrawalAmount = shares * shareValue;

      // Create transaction record
      const transaction = await storage.createTransaction({
        fundId: id,
        userId: "temp-user-id", // TODO: Use actual user ID
        type: "withdraw",
        amount: withdrawalAmount,
        shares,
        status: "pending",
      });

      res.json({ transaction, withdrawalAmount });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Get user's fund stakes (requires authentication)
  app.get('/api/user/stakes', async (req, res) => {
    try {
      // TODO: Add authentication
      // const userId = req.user?.claims?.sub;
      const userId = "temp-user-id";
      
      const stakes = await storage.getInvestorStakes(userId);
      
      // Get fund details for each stake
      const stakesWithFunds = await Promise.all(
        stakes.map(async (stake) => {
          const fund = await storage.getFund(stake.fundId);
          return {
            ...stake,
            fund,
          };
        })
      );
      
      res.json(stakesWithFunds);
    } catch (error) {
      console.error("Error fetching user stakes:", error);
      res.status(500).json({ message: "Failed to fetch user stakes" });
    }
  });

  // Get user's fund transactions (requires authentication)
  app.get('/api/user/transactions', async (req, res) => {
    try {
      // TODO: Add authentication
      // const userId = req.user?.claims?.sub;
      const userId = "temp-user-id";
      
      const transactions = await storage.getUserTransactions(userId);
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ message: "Failed to fetch user transactions" });
    }
  });

  // Update transaction status (internal use for blockchain confirmations)
  app.put('/api/transactions/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, txSignature } = req.body;
      
      const transaction = await storage.updateTransactionStatus(id, status, txSignature);
      
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  // Fund settings update endpoint
  app.patch('/api/funds/:id/settings', async (req, res) => {
    try {
      const { id } = req.params;
      const { fundMode, jupiterStrictList } = req.body;
      
      // Get the fund first to check ownership and current settings
      const fund = await storage.getFund(id);
      if (!fund) {
        return res.status(404).json({ error: 'Fund not found' });
      }

      // Check if user is the fund manager (simplified for now)
      // In production, this would check authenticated user session
      
      // Prevent platform funds from being modified
      if (fund.isPlatformFund) {
        return res.status(403).json({ error: 'Cannot modify platform funds' });
      }

      // Validate settings changes
      const updates: any = {};
      
      if (fundMode !== undefined) {
        if (!['manual', 'auto'].includes(fundMode)) {
          return res.status(400).json({ error: 'Invalid fund mode' });
        }
        updates.fundMode = fundMode;
      }

      if (jupiterStrictList !== undefined) {
        // Can only enable, never disable strict list for security
        if (fund.jupiterStrictList && !jupiterStrictList) {
          return res.status(400).json({ error: 'Cannot remove Jupiter strict list restriction once enabled' });
        }
        updates.jupiterStrictList = jupiterStrictList;
      }

      // Update the fund
      const updatedFund = await storage.updateFund(id, updates);
      
      res.json({
        message: 'Fund settings updated successfully',
        fund: updatedFund
      });
    } catch (error) {
      console.error('Fund settings update error:', error);
      res.status(500).json({ error: 'Failed to update fund settings' });
    }
  });

  // Delete fund endpoint (with automatic investor withdrawal)
  app.delete('/api/funds/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the fund first to check ownership
      const fund = await storage.getFund(id);
      if (!fund) {
        return res.status(404).json({ error: 'Fund not found' });
      }

      // Check if user is the fund manager (simplified for now)
      // In production, this would check authenticated user session
      
      // Prevent platform funds from being deleted
      if (fund.isPlatformFund) {
        return res.status(403).json({ error: 'Platform funds cannot be deleted' });
      }

      // Delete the fund and withdraw all investors
      const result = await storage.deleteFund(id);
      
      res.json({
        success: true,
        message: `Fund deleted successfully. ${result.withdrawnInvestors} investors have been automatically withdrawn.`,
        withdrawnInvestors: result.withdrawnInvestors
      });
    } catch (error) {
      console.error('Fund deletion error:', error);
      res.status(500).json({ error: 'Failed to delete fund' });
    }
  });
}