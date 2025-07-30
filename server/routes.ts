import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupTwitterAuth } from "./twitter-auth";

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
      const userId = (req as any).user?.id;
      if (userId) {
        const user = await storage.getUser(userId);
        res.json(user);
      } else {
        res.status(401).json({ error: 'Not authenticated' });
      }
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
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

  const httpServer = createServer(app);
  return httpServer;
}
