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

  // Apply session middleware globally (required by passport)
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

  // Configure Twitter OAuth 2.0 strategy with better error handling
  passport.use('twitter-oauth2', new OAuth2Strategy({
    authorizationURL: 'https://twitter.com/i/oauth2/authorize',
    tokenURL: 'https://api.twitter.com/2/oauth2/token',
    clientID: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    callbackURL: `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`,
    scope: ['tweet.read', 'users.read', 'offline.access'],
    state: true,
    pkce: true,
    customHeaders: {
      'User-Agent': 'FundrApp/1.0'
    }
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      console.log('Twitter OAuth callback received, fetching user profile...');
      
      // Fetch user profile from Twitter API v2
      const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'FundrApp/1.0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Twitter API error:', response.status, errorText);
        throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Twitter user data received:', data);
      
      if (!data.data) {
        throw new Error('No user data returned from Twitter API');
      }
      
      const user = data.data;
      
      // Upsert user with Twitter data
      const savedUser = await storage.upsertUser({
        twitterId: user.id,
        twitterUsername: user.username,
        twitterDisplayName: user.name,
        twitterProfileImage: user.profile_image_url,
        displayName: user.name
      });
      
      console.log('User saved successfully:', savedUser);
      return done(null, savedUser);
    } catch (error) {
      console.error('Twitter OAuth strategy error:', error);
      return done(error, null);
    }
  }));

  // Test callback endpoint to see if Twitter is reaching us
  app.get('/api/auth/twitter/test', (req, res) => {
    console.log('Test callback hit - Twitter can reach our server');
    console.log('Query params:', req.query);
    res.json({ status: 'Twitter can reach this endpoint', query: req.query });
  });

  // Twitter auth routes
  app.get('/api/auth/twitter', (req, res, next) => {
    console.log('Twitter auth route accessed');
    console.log('Callback URL configured:', `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`);
    next();
  }, passport.authenticate('twitter-oauth2', {
    failureRedirect: '/?twitter=error&reason=auth_failed'
  }));

  // Simple callback route to detect if Twitter is calling us
  app.get('/api/auth/twitter/callback', (req, res) => {
    console.log('🎯 TWITTER CALLBACK HIT! Twitter is calling our server!');
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    
    // Simple response to verify Twitter is reaching us
    if (req.query.code) {
      console.log('✅ Authorization code received:', req.query.code);
      res.redirect('/?twitter=callback_received');
    } else if (req.query.error) {
      console.log('❌ OAuth error received:', req.query.error);
      res.redirect(`/?twitter=error&reason=${req.query.error}`);
    } else {
      console.log('❓ Unknown callback state');
      res.redirect('/?twitter=unknown');
    }
  });

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
    console.log('Twitter status route handler called');
    const callbackUrl = `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`;
    const response = {
      configured: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
      callbackUrl,
      clientId: process.env.TWITTER_CLIENT_ID ? 'Set' : 'Missing',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ? 'Set' : 'Missing',
      instructions: `Register this callback URL in your Twitter app settings: ${callbackUrl}`
    };
    console.log('Sending response:', response);
    res.json(response);
  });
}