import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, Request } from "express";
import { createHash, randomBytes } from "crypto";

// Helper functions for OAuth 2.0 PKCE
function generateRandomString(length: number): string {
  return randomBytes(length).toString('base64url').slice(0, length);
}

function sha256(buffer: string): Buffer {
  return createHash('sha256').update(buffer).digest();
}

function base64URLEncode(str: Buffer): string {
  return str.toString('base64url');
}

// Extend session type
declare module 'express-session' {
  interface SessionData {
    walletToLink?: string;
    isLinking?: boolean;
    oauthState?: string;
    codeVerifier?: string;
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

  // Configure Twitter OAuth 2.0 strategy with minimal scopes
  passport.use('twitter-oauth2', new OAuth2Strategy({
    authorizationURL: 'https://twitter.com/i/oauth2/authorize',
    tokenURL: 'https://api.twitter.com/2/oauth2/token',
    clientID: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    callbackURL: `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`,
    scope: ['users.read', 'tweet.read'],
    state: true,
    pkce: true
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

  // Test different OAuth approaches based on X documentation
  app.get('/api/auth/twitter', (req, res) => {
    console.log('Twitter auth route accessed');
    console.log('Callback URL configured:', `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`);
    
    // Try the approach without PKCE first (plain method as suggested in docs)
    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(43); // Shorter verifier
    
    // Store state and code verifier in session
    req.session.oauthState = state;
    req.session.codeVerifier = codeVerifier;
    
    // Use plain code challenge method as per X docs
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`,
      scope: 'users.read tweet.read',
      state: state,
      code_challenge: codeVerifier,
      code_challenge_method: 'plain'
    });
    
    const authURL = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    console.log('Generated OAuth URL with plain PKCE:', authURL);
    
    res.redirect(authURL);
  });

  // Direct OAuth callback handler
  app.get('/api/auth/twitter/callback', async (req, res) => {
    console.log('Twitter callback accessed');
    console.log('Query params:', req.query);
    
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('Twitter OAuth error:', error);
      return res.redirect('/?twitter=error&reason=' + error);
    }
    
    if (!code || !state) {
      console.error('Missing code or state in callback');
      return res.redirect('/?twitter=error&reason=missing_params');
    }
    
    // Verify state parameter
    if (state !== req.session.oauthState) {
      console.error('State mismatch - possible CSRF attack');
      return res.redirect('/?twitter=error&reason=state_mismatch');
    }
    
    if (!req.session.codeVerifier) {
      console.error('Missing code verifier in session');
      return res.redirect('/?twitter=error&reason=missing_verifier');
    }
    
    try {
      // Exchange code for access token using the correct X API endpoint
      const tokenResponse = await fetch('https://api.x.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`,
          code_verifier: req.session.codeVerifier
        })
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', tokenResponse.status, errorText);
        return res.redirect('/?twitter=error&reason=token_exchange_failed');
      }
      
      const tokens = await tokenResponse.json();
      console.log('Token exchange successful');
      
      // Fetch user profile from X API v2
      const userResponse = await fetch('https://api.x.com/2/users/me?user.fields=profile_image_url,public_metrics', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'User-Agent': 'FundrApp/1.0'
        }
      });
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('User fetch failed:', userResponse.status, errorText);
        return res.redirect('/?twitter=error&reason=user_fetch_failed');
      }
      
      const userData = await userResponse.json();
      console.log('Twitter user data received:', userData);
      
      if (!userData.data) {
        return res.redirect('/?twitter=error&reason=no_user_data');
      }
      
      const user = userData.data;
      
      // Store user in database
      await storage.upsertUser({
        id: user.id,
        username: user.username,
        email: '', // Twitter doesn't provide email in basic scope
        twitterId: user.id,
        twitterUsername: user.username,
        twitterProfileImage: user.profile_image_url
      });
      
      console.log('User stored successfully:', user.username);
      
      // Clear OAuth session data
      delete req.session.oauthState;
      delete req.session.codeVerifier;
      
      res.redirect('/profile?twitter=success');
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/?twitter=error&reason=callback_exception');
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



  // Comprehensive Twitter app diagnostic endpoint
  app.get('/api/auth/twitter/status', async (req, res) => {
    console.log('Twitter status route handler called');
    const callbackUrl = `https://${process.env.REPLIT_DOMAINS}/api/auth/twitter/callback`;
    
    try {
      // Test app-only authentication to verify credentials
      console.log('Testing app credentials...');
      const authHeader = `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`;
      
      const bearerResponse = await fetch('https://api.x.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      
      const credentialsValid = bearerResponse.ok;
      let errorDetails = null;
      
      if (!credentialsValid) {
        errorDetails = {
          status: bearerResponse.status,
          statusText: bearerResponse.statusText,
          body: await bearerResponse.text()
        };
        console.log('Credentials test failed:', errorDetails);
      } else {
        console.log('✅ App credentials are valid');
      }
      
      const response = {
        configured: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
        callbackUrl,
        clientId: process.env.TWITTER_CLIENT_ID ? `Set (${process.env.TWITTER_CLIENT_ID.substring(0, 10)}...)` : 'Missing',
        clientSecret: process.env.TWITTER_CLIENT_SECRET ? 'Set' : 'Missing',
        credentialsValid,
        errorDetails,
        instructions: [
          `1. Register this callback URL: ${callbackUrl}`,
          '2. Ensure app type is "Web App, Automated App or Bot"',
          '3. Enable OAuth 2.0 in User Authentication Settings',
          '4. Set permissions to "Read and write"',
          '5. Make sure OAuth 2.0 is enabled (not just OAuth 1.0a)'
        ],
        oauthUrl: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=users.read+tweet.read&state=test&code_challenge=test&code_challenge_method=plain`
      };
      
      console.log('Sending detailed status response');
      res.json(response);
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ 
        error: 'Failed to check Twitter app status',
        details: error.message 
      });
    }
  });
}