# Fundr Solana Deployment Guide

## 🚀 Deployment Options for Replit

### Option 1: GitHub Actions (Recommended)

1. **Setup Repository Secret**
   - Generate a Solana wallet: `solana-keygen new`
   - Copy the contents of `~/.config/solana/id.json`
   - Add as GitHub secret named `SOLANA_WALLET`

2. **Fund the Wallet**
   - Get the public key: `solana address`
   - For devnet: `solana airdrop 5 <YOUR_ADDRESS> --url devnet`
   - For mainnet: Transfer SOL to your deployment wallet

3. **Deploy**
   - Push to `main` or `deploy` branch
   - Or manually trigger via GitHub Actions tab
   - Select network (devnet/testnet/mainnet-beta)

4. **Automatic Updates**
   - Program ID automatically updated in frontend
   - Deployment summary created
   - Explorer links provided

### Option 2: Local Build + Replit Deploy

1. **Build Locally**
   ```bash
   # Install dependencies
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
   
   # Build program
   anchor build
   ```

2. **Upload to Replit**
   - Upload `target/deploy/fundr.so`
   - Upload `target/deploy/fundr-keypair.json`

3. **Deploy from Replit**
   ```bash
   solana program deploy target/deploy/fundr.so \
     --program-id target/deploy/fundr-keypair.json \
     --url devnet
   ```

### Option 3: Solana Playground

1. **Export to Solana Playground**
   - Copy Rust code to playground.solana.com
   - Build and deploy directly in browser
   - No local setup required

2. **Update Replit**
   - Copy deployed program ID
   - Update `FUNDR_PROGRAM_ID` in frontend

## 📋 Current Program Details

- **Program ID**: `7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe`
- **Status**: Configured for simulation
- **Network**: Ready for devnet deployment

## 🔧 Troubleshooting

### Build Issues
- Ensure Rust 1.75+ installed
- Install Solana CLI 1.18+
- Install Anchor 0.30+

### Deployment Issues
- Check wallet balance (need ~0.5 SOL for deployment)
- Ensure correct network selected
- Verify program size < 200KB

### Replit Limitations
- No BPF target in Rust environment
- Solution: Use GitHub Actions or local build

## 🎯 Next Steps

1. Choose deployment method
2. Fund deployment wallet
3. Deploy to devnet
4. Test all features
5. Deploy to mainnet when ready

## 📚 Resources

- [Solana Docs](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [Solana Playground](https://playground.solana.com)
- [Explorer](https://explorer.solana.com)