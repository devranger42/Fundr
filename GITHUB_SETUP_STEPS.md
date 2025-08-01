# GitHub Deployment - Step by Step

## Step 1: Create GitHub Repository
1. Open github.com in your mobile browser
2. Sign in (or create account if needed)
3. Tap the "+" icon → "New repository"
4. Name: `fundr`
5. Make it Public (for free Actions)
6. Create repository

## Step 2: Add Deployment Secret
1. In your new repository, tap "Settings"
2. Scroll down to "Security" section
3. Tap "Secrets and variables" → "Actions"
4. Tap "New repository secret"
5. **Name**: `SOLANA_WALLET`
6. **Secret**: Copy and paste this entire array:
```
[238,225,146,62,140,47,109,252,84,187,62,60,63,210,172,91,226,108,112,217,144,183,77,60,74,223,174,62,109,86,144,116,91,154,228,145,182,18,13,88,38,127,45,237,207,120,70,77,59,49,210,26,222,162,16,25,236,247,89,54,194,37,170,192]
```
7. Tap "Add secret"

## Step 3: Get Free SOL
Open this link: https://faucet.solana.com/

Enter this address:
```
7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe
```

Request 2 SOL (you can do this multiple times if needed)

## Step 4: Connect Replit to GitHub
1. Back in Replit (on mobile browser)
2. Look for the Git icon (looks like a branch)
3. Tap "Connect to GitHub"
4. Authorize Replit
5. Select your `fundr` repository
6. It will initialize and connect

## Step 5: Push Your Code
1. In Replit's Git panel
2. You'll see all your files listed
3. Type a message like "Initial deployment"
4. Tap "Commit All & Push"

## Step 6: Watch It Deploy!
1. Go back to GitHub
2. Tap "Actions" tab
3. You'll see "Deploy Solana Program" running
4. Takes about 2-3 minutes
5. Green checkmark = Success!

## What Happens Next?
- Your program deploys to Solana devnet
- The frontend automatically updates with the real program ID
- You can start using your app with real blockchain!

## For Future Updates
Just push code from Replit → Deploys automatically!

---
Ready? Start with Step 1 and let me know when you've created the repository!