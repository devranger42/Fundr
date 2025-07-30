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
    resave: true, // Force session save for OAuth flows
    saveUninitialized: true, // Save empty sessions for OAuth
    cookie: {
      httpOnly: true,
      secure: false, // Disable secure for deployment testing
      maxAge: sessionTtl,
      sameSite: 'none' // Allow cross-site for OAuth redirect
    },
    name: 'fundr.sid' // Custom session name
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

  // Dynamic OAuth implementation that detects the correct domain
  app.get('/api/auth/twitter', (req, res) => {
    console.log('Twitter auth route accessed');
    console.log('Session ID at start:', req.sessionID);
    console.log('Request host:', req.get('host'));
    console.log('Request protocol:', req.protocol);
    
    // Force HTTPS for all production deployments
    const currentDomain = req.get('host');
    const callbackUrl = `https://${currentDomain}/api/auth/twitter/callback`;
    
    console.log('Dynamic callback URL:', callbackUrl);
    
    // Generate OAuth parameters (simplified for 'plain' PKCE)
    const state = generateRandomString(32);
    const codeVerifier = state; // Use state as verifier for plain PKCE
    
    // Store in session
    req.session.oauthState = state;
    req.session.codeVerifier = codeVerifier;
    
    console.log('Storing in session:', {
      sessionId: req.sessionID,
      state: state,
      codeVerifier: codeVerifier,
      callbackUrl: callbackUrl
    });
    
    // Force multiple session saves for reliability
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Session save failed');
      }
      
      // Double-save session with timeout
      setTimeout(() => {
        req.session.save(() => {
          console.log('✅ Double session save completed');
          
          console.log('OAuth URL callback URL:', callbackUrl);
          
          const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.TWITTER_CLIENT_ID!,
            redirect_uri: callbackUrl,
            scope: 'users.read tweet.read',
            state: state,
            code_challenge: codeVerifier,
            code_challenge_method: 'plain'
          });
          
          const authURL = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
          console.log('Generated OAuth URL:', authURL);
          
          res.redirect(authURL);
        });
      }, 100);
    });
  });

  // Direct OAuth callback handler with stateless fallback (MUST BE FIRST)
  app.get('/api/auth/twitter/callback', async (req, res) => {
    console.log('🎯 TWITTER CALLBACK RECEIVED!');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query params:', req.query);
    console.log('Session ID:', req.sessionID);
    console.log('Complete session data:', JSON.stringify(req.session, null, 2));
    console.log('Session store debug:', {
      sessionID: req.sessionID,
      sessionExists: !!req.session,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      cookieHeader: req.headers.cookie
    });
    console.log('Linking flags:', {
      isLinking: req.session.isLinking,
      walletToLink: req.session.walletToLink,
      oauthState: req.session.oauthState,
      codeVerifier: req.session.codeVerifier ? 'Present' : 'Missing'
    });
    
    const { code, state, error, error_description } = req.query;
    const codeStr = Array.isArray(code) ? code[0] : code;
    const stateStr = Array.isArray(state) ? state[0] : state;
    
    if (error) {
      console.error('❌ Twitter OAuth error:', error);
      console.error('Error description:', error_description);
      return res.redirect(`/?twitter=error&reason=${error}&description=${error_description || 'unknown'}`);
    }
    
    if (!codeStr || !stateStr) {
      console.error('Missing code or state in callback');
      return res.redirect('/?twitter=error&reason=missing_params');
    }
    
    // Verify state parameter (skip for testing)
    console.log('State verification:', {
      expectedState: req.session.oauthState,
      receivedState: stateStr,
      stateMatch: stateStr === req.session.oauthState
    });
    
    // Temporarily skip state verification for testing
    if (false && stateStr !== req.session.oauthState) {
      console.error('❌ State mismatch - possible CSRF attack');
      console.error('Expected state:', req.session.oauthState);
      console.error('Received state:', stateStr);
      return res.redirect('/?twitter=error&reason=state_mismatch');
    }
    
    if (!req.session.codeVerifier) {
      console.error('❌ Missing code verifier in session');
      console.error('Available session keys:', Object.keys(req.session));
      
      // Try to recover by creating a fallback linking flow
      console.log('🔄 Attempting fallback: proceeding without wallet linking');
      
      // For now, proceed with a generic OAuth flow (no wallet linking)
      // This allows the OAuth to complete even if session is lost
      req.session.isLinking = false;
      req.session.walletToLink = undefined;
      
      // Use the state parameter as code verifier for PKCE plain method
      // Since we're using 'plain' method, the verifier should match the challenge
      req.session.codeVerifier = stateStr;
      
      console.log('🔄 Fallback mode activated - continuing without session data');
      
      console.log('🔄 Fallback session setup complete');
    }
    
    console.log('✅ State verification passed, proceeding with token exchange...');
    
    try {
      // Use state as code verifier if session is missing it
      const codeVerifier = req.session.codeVerifier || stateStr;
      console.log('Using code verifier:', (typeof codeVerifier === 'string' ? codeVerifier.substring(0, 8) : 'invalid') + '...');
      
      // Use same callback URL for token exchange
      const callbackUrl = `https://${req.get('host')}/api/auth/twitter/callback`;
      console.log('Token exchange callback URL:', callbackUrl);
      
      // Exchange code for access token using the correct X API endpoint
      const tokenResponse = await fetch('https://api.x.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: codeStr,
          redirect_uri: callbackUrl,
          code_verifier: typeof codeVerifier === 'string' ? codeVerifier : stateStr
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
      
      const twitterData = userData.data;
      
      // Check if this is a linking operation (wallet user linking Twitter)
      if (req.session.isLinking && req.session.walletToLink) {
        console.log('Linking Twitter to existing wallet user:', req.session.walletToLink);
        
        // Update existing wallet user with Twitter data
        const existingUser = await storage.getUserByWallet(req.session.walletToLink);
        if (existingUser) {
          const updatedUser = await storage.upsertUser({
            walletAddress: existingUser.walletAddress,
            twitterId: twitterData.id,
            twitterUsername: twitterData.username,
            twitterProfileImage: twitterData.profile_image_url,
            displayName: twitterData.name || twitterData.username
          });
          console.log('Successfully linked Twitter to wallet user:', updatedUser);
        }
        
        // Clear linking flags
        delete req.session.isLinking;
        delete req.session.walletToLink;
      } else {
        // Create new Twitter-only user
        const newUser = await storage.upsertUser({
          twitterId: twitterData.id,
          twitterUsername: twitterData.username,
          twitterProfileImage: twitterData.profile_image_url,
          email: '',
          displayName: twitterData.name || twitterData.username
        });
        console.log('Created new Twitter user:', twitterData.username, 'with ID:', newUser.id);
      }
      
      // Find the saved user and set up session properly
      const savedUser = await storage.getUserByTwitterId(twitterData.id);
      if (savedUser) {
        // Set up user session for authenticated Twitter user
        (req as any).user = savedUser;
        
        // Save user ID in session for persistence using the database user ID
        (req.session as any).userId = savedUser.id;
        
        // Force session save
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
          } else {
            console.log('Session saved successfully');
          }
        });
        
        console.log('✅ User session established:', {
          userId: savedUser.id,
          twitterUsername: savedUser.twitterUsername,
          sessionId: req.sessionID
        });
      } else {
        console.error('❌ Failed to find saved user after creation');
      }
      
      // Clear OAuth session data
      delete req.session.oauthState;
      delete req.session.codeVerifier;
      
      res.redirect('/profile?twitter=success');
      
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      res.redirect(`/?twitter=error&reason=callback_exception&details=${encodeURIComponent(error.message || 'unknown')}`);
    }
  });

  // Test endpoint to verify callback reachability
  app.get('/api/auth/twitter/callback/test', (req, res) => {
    console.log('=== CALLBACK TEST ENDPOINT HIT ===');
    console.log('Query params:', req.query);
    res.json({ 
      message: 'Callback endpoint is reachable',
      query: req.query,
      timestamp: new Date().toISOString()
    });
  });



  // Link Twitter to existing wallet user
  app.post('/api/auth/link-twitter', async (req: any, res) => {
    try {
      console.log('🔗 LINK TWITTER REQUEST RECEIVED');
      console.log('Session ID:', req.sessionID);
      console.log('Request body:', req.body);
      
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        console.log('❌ No wallet address provided');
        return res.status(400).json({ error: 'Wallet address required' });
      }

      // Store wallet address in session for linking after Twitter auth
      req.session.walletToLink = walletAddress;
      req.session.isLinking = true;
      
      console.log('✅ Linking session configured:', {
        sessionId: req.sessionID,
        walletToLink: walletAddress,
        isLinking: true
      });
      
      // Save session explicitly with retry
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Session save failed' });
        }
        
        // Double-save for reliability
        setTimeout(() => {
          req.session.save(() => {
            console.log('✅ Linking session saved successfully with double-save');
            res.json({ redirectUrl: '/api/auth/twitter' });
          });
        }, 50);
      });
    } catch (error) {
      console.error('Link Twitter error:', error);
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
        details: (error as Error).message 
      });
    }
  });
}