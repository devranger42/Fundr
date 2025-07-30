import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
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

  // Configure Twitter OAuth 2.0 strategy
  passport.use('twitter-oauth2', new OAuth2Strategy({
    authorizationURL: 'https://twitter.com/i/oauth2/authorize',
    tokenURL: 'https://api.twitter.com/2/oauth2/token',
    clientID: process.env.TWITTER_CLIENT_ID || 'dummy-id',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || 'dummy-secret',
    callbackURL: process.env.TWITTER_CALLBACK_URL || `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`,
    scope: ['tweet.read', 'users.read', 'offline.access'],
    state: true,
    pkce: true
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Fetch user profile from Twitter API v2
      const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Fundr/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch Twitter profile');
      }
      
      const data = await response.json();
      const user = data.data;
      
      // Upsert user with Twitter data
      const savedUser = await storage.upsertUser({
        twitterId: user.id,
        twitterUsername: user.username,
        twitterDisplayName: user.name,
        twitterProfileImage: user.profile_image_url,
        displayName: user.name
      });
      
      return done(null, savedUser);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Twitter auth routes
  app.get('/api/auth/twitter', (req, res, next) => {
    console.log('Twitter auth route accessed');
    console.log('Callback URL configured:', `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`);
    next();
  }, passport.authenticate('twitter-oauth2', {
    failureRedirect: '/?twitter=error&reason=auth_failed'
  }));

  app.get('/api/auth/twitter/callback',
    passport.authenticate('twitter-oauth2', { 
      failureRedirect: '/?twitter=error&reason=callback_failed' 
    }),
    async (req: any, res) => {
      try {
        // Check if this is a linking request
        if (req.session.isLinking && req.session.walletToLink) {
          const walletAddress = req.session.walletToLink;
          const twitterUser = req.user;
          
          // Link Twitter to existing wallet user
          await storage.linkTwitterToWallet(walletAddress, {
            twitterId: twitterUser.twitterId,
            twitterUsername: twitterUser.twitterUsername,
            twitterDisplayName: twitterUser.twitterDisplayName,
            twitterProfileImage: twitterUser.twitterProfileImage,
          });
          
          // Clear linking session data
          req.session.isLinking = false;
          req.session.walletToLink = undefined;
          
          res.redirect('/?twitter=linked');
        } else {
          // Regular Twitter authentication
          res.redirect('/');
        }
      } catch (error) {
        console.error('Twitter callback error:', error);
        res.redirect('/?twitter=error');
      }
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

  // Twitter configuration status endpoint
  app.get('/api/auth/twitter/status', (req, res) => {
    const callbackUrl = `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`;
    res.json({
      configured: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
      callbackUrl,
      clientId: process.env.TWITTER_CLIENT_ID ? 'Set' : 'Missing',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ? 'Set' : 'Missing',
      instructions: `Register this callback URL in your Twitter app settings: ${callbackUrl}`
    });
  });
}