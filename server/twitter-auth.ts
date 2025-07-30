import passport from "passport";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, Request } from "express";

// Extend session type
declare module 'express-session' {
  interface SessionData {
    walletToLink?: string;
    isLinking?: boolean;
  }
}

export function setupTwitterAuth(app: Express) {
  // Setup session middleware
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'fundr-session-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure Twitter strategy
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY || 'dummy-key',
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'dummy-secret',
    callbackURL: "/api/auth/twitter/callback"
  },
  async (token, tokenSecret, profile, done) => {
    try {
      // Upsert user with Twitter data
      const user = await storage.upsertUser({
        twitterId: profile.id,
        twitterUsername: profile.username,
        twitterDisplayName: profile.displayName,
        twitterProfileImage: profile.photos?.[0]?.value,
        displayName: profile.displayName
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Twitter auth routes
  app.get('/api/auth/twitter', 
    passport.authenticate('twitter')
  );

  app.get('/api/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    (req, res) => {
      // Successful authentication
      res.redirect('/');
    }
  );

  // Link Twitter to existing wallet user
  app.post('/api/auth/link-twitter', async (req: any, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
      }

      // Store wallet address in session for linking after Twitter auth
      req.session.walletToLink = walletAddress;
      
      // Redirect to Twitter auth with linking flag
      req.session.isLinking = true;
      res.json({ redirectUrl: '/api/auth/twitter' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initiate Twitter linking' });
    }
  });
}