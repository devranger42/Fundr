# 🚀 Quick Deploy Guide

## What You'll Do:
Deploy your Fundr app to the real Solana blockchain in 5 minutes!

## Step 1: Create GitHub Account (if needed)
1. Go to github.com
2. Sign up for free account

## Step 2: Create New Repository
1. Click green "New" button
2. Name: `fundr`
3. Make it **Public** (free deployments)
4. Click "Create repository"

## Step 3: Add Deploy Wallet
1. In your new repo, click **Settings**
2. Scroll to **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. **Name**: `SOLANA_WALLET`
5. **Secret**: Copy this entire block:
```
[238,225,146,62,140,47,109,252,84,187,62,60,63,210,172,91,226,108,112,217,144,183,77,60,74,223,174,62,109,86,144,116,91,154,228,145,182,18,13,88,38,127,45,237,207,120,70,77,59,49,210,26,222,162,16,25,236,247,89,54,194,37,170,192]
```
6. Click **Add secret**

## Step 4: Get Free SOL
1. Go to: https://faucet.solana.com/
2. Paste this address: `7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe`
3. Click "Devnet" and request 2 SOL

## Step 5: Connect Replit to GitHub
1. Back in Replit, look for Git icon (branch symbol)
2. Click "Connect to GitHub"
3. Authorize Replit
4. Select your `fundr` repository

## Step 6: Push & Deploy
1. In Replit Git panel:
   - Add commit message: "Deploy Fundr"
   - Click "Commit All & Push"

2. Go to GitHub → Actions tab
3. Watch "Deploy Solana Program" run
4. Green checkmark = Success! 🎉

## Your App is Live!
- Program ID: `7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe`
- Network: Solana Devnet
- Fee structure: Fixed with 20% performance cap

## Test Your App:
1. Connect your wallet
2. Create a fund
3. Make deposits
4. Trade with Jupiter

Ready? Start with Step 1! I'll be here if you need help.