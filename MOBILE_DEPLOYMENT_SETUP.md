# 📱 Mobile GitHub Deployment Setup

## Step 1: Create GitHub Repository (if not done)
1. Open GitHub app or github.com in browser
2. Tap "+" → "New repository"
3. Name it "fundr" 
4. Make it private or public
5. Create repository

## Step 2: Generate Deployment Wallet
Since you're on mobile, I'll create a wallet for you:

```
Wallet Public Key: 7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe
```

**⚠️ IMPORTANT: Save this secret key somewhere safe!**
```json
[238,225,146,62,140,47,109,252,84,187,62,60,63,210,172,91,226,108,112,217,144,183,77,60,74,223,174,62,109,86,144,116,91,154,228,145,182,18,13,88,38,127,45,237,207,120,70,77,59,49,210,26,222,162,16,25,236,247,89,54,194,37,170,192]
```

## Step 3: Add Secret to GitHub (Mobile)
1. Go to your repository on GitHub
2. Tap "Settings" (may need to scroll)
3. Find "Secrets and variables" → "Actions"
4. Tap "New repository secret"
5. Name: `SOLANA_WALLET`
6. Value: Paste the JSON array above
7. Add secret

## Step 4: Fund Your Wallet
Visit this link to get free SOL for deployment:
https://faucet.solana.com/

Enter wallet address: `7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe`

## Step 5: Enable GitHub Actions
1. In your repo, go to "Actions" tab
2. If prompted, enable workflows
3. You'll see "Deploy Solana Program"

## Step 6: Connect Replit to GitHub
1. In Replit (mobile browser):
   - Tap Git icon (branch symbol)
   - Connect to GitHub
   - Select your repository
   - Push your code

## Step 7: Deploy!
1. Go to GitHub Actions tab
2. Select "Deploy Solana Program"
3. Tap "Run workflow"
4. Choose "devnet"
5. Run!

## 📊 Monitor Deployment
- Check Actions tab for progress
- Green checkmark = Success!
- Program will auto-update in app

## 🎯 Quick Links for Mobile
- [Solana Faucet](https://faucet.solana.com/)
- [Solana Explorer](https://explorer.solana.com/)
- Your Program ID: `7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe`

## Need Help?
The deployment takes about 2-3 minutes. Once complete, your Fundr app will be live on Solana devnet!