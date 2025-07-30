import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupTwitterAuth } from "./twitter-auth";
import { registerFundRoutes } from "./fund-routes";
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {


  // Setup Twitter authentication
  setupTwitterAuth(app);

  // User authentication routes
  app.post('/api/auth/user', async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (walletAddress) {
        // Create or get user by wallet
        const user = await storage.upsertUser({ walletAddress });
        res.json(user);
      } else {
        // Get current session user
        const userId = (req as any).user?.id;
        if (userId) {
          const user = await storage.getUser(userId);
          res.json(user);
        } else {
          res.status(401).json({ error: 'Not authenticated' });
        }
      }
    } catch (error) {
      console.error('Auth user error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      // Check for user ID in session or user object
      const userId = (req as any).user?.id || (req.session as any).userId;
      
      if (userId) {
        console.log('Looking up user with ID:', userId);
        
        // Try to get user by ID first (primary lookup)
        let user = await storage.getUser(userId);
        console.log('User lookup result:', user ? 'Found' : 'Not found');
        
        // If not found by UUID, try by Twitter ID (fallback)
        if (!user) {
          console.log('Trying Twitter ID lookup as fallback...');
          user = await storage.getUserByTwitterId(userId);
          console.log('Twitter ID lookup result:', user ? 'Found' : 'Not found');
        }
        
        if (user) {
          res.json(user);
        } else {
          console.log('No user found for ID:', userId);
          res.status(401).json({ error: 'User not found' });
        }
      } else {
        res.status(401).json({ error: 'Not authenticated' });
      }
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Get Twitter user by ID (for testing)
  app.get('/api/auth/twitter-user/:twitterId', async (req, res) => {
    try {
      const { twitterId } = req.params;
      const user = await storage.getUserByTwitterId(twitterId);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'Twitter user not found' });
      }
    } catch (error) {
      console.error('Get Twitter user error:', error);
      res.status(500).json({ error: 'Failed to get Twitter user' });
    }
  });

  app.post('/api/auth/unlink-twitter', async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Clear Twitter data while keeping other info
      const user = await storage.getUser(userId);
      if (user) {
        await storage.upsertUser({
          walletAddress: user.walletAddress,
          twitterId: null,
          twitterUsername: null,
          twitterDisplayName: null,
          twitterProfileImage: null,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Unlink Twitter error:', error);
      res.status(500).json({ error: 'Failed to unlink Twitter' });
    }
  });

  app.post('/api/auth/link-twitter-manual', async (req, res) => {
    try {
      const { walletAddress, twitterUsername } = req.body;
      
      if (!walletAddress || !twitterUsername) {
        return res.status(400).json({ error: 'Wallet address and Twitter username required' });
      }

      // Create or update user with manual Twitter handle
      const user = await storage.upsertUser({
        walletAddress,
        twitterUsername: twitterUsername.replace('@', ''),
        twitterDisplayName: twitterUsername.replace('@', ''),
        displayName: twitterUsername.replace('@', ''),
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error('Manual Twitter link error:', error);
      res.status(500).json({ error: 'Failed to link Twitter handle' });
    }
  });

  // Register fund management routes
  registerFundRoutes(app);

  // Platform funds routes
  app.get('/api/platform-funds', async (req, res) => {
    try {
      const allFunds = await storage.getAllFunds();
      const platformFunds = allFunds.filter((fund: any) => fund.isPlatformFund && fund.isActive);
      res.json(platformFunds);
    } catch (error) {
      console.error('Platform funds error:', error);
      res.status(500).json({ error: 'Failed to fetch platform funds' });
    }
  });

  // Admin endpoint to clear all funds
  app.delete('/api/admin/clear-funds', async (req, res) => {
    try {
      console.log("Admin: Clearing all funds and related data");
      // Use direct SQL for complete cleanup
      await db.execute(sql`DELETE FROM transactions`);
      await db.execute(sql`DELETE FROM stakes`);
      await db.execute(sql`DELETE FROM allocations`);
      await db.execute(sql`DELETE FROM funds`);
      console.log("Admin: All funds cleared successfully");
      res.json({ success: true, message: "All funds and related data cleared" });
    } catch (error) {
      console.error('Admin clear funds error:', error);
      res.status(500).json({ error: 'Failed to clear funds' });
    }
  });

  const httpServer = createServer(app);
  
  // Platform funds initialization completely disabled
  console.log("Platform funds initialization disabled - clean slate mode");
  
  return httpServer;
}
