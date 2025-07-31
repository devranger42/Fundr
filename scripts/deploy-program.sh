#!/bin/bash

# Fundr Program Deployment Script for Devnet

set -e

echo "🚀 Fundr Program Deployment to Devnet"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install with: curl -sSfL https://release.solana.com/v1.18.4/install | sh"
    echo "Then restart your terminal and run this script again."
    exit 1
fi

# Check if Anchor CLI is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found${NC}"
    echo "Install with: npm install -g @coral-xyz/anchor-cli"
    exit 1
fi

echo -e "${GREEN}✅ CLI tools found${NC}"

# Configure Solana for devnet
echo -e "${BLUE}🔧 Configuring Solana CLI for devnet...${NC}"
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json

# Check if keypair exists
if [ ! -f ~/.config/solana/id.json ]; then
    echo -e "${YELLOW}⚠️  No keypair found. Generating new keypair...${NC}"
    solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase
fi

# Get current balance
BALANCE=$(solana balance --lamports)
REQUIRED_BALANCE=5000000000  # 5 SOL in lamports

echo -e "${BLUE}💰 Current balance: $((BALANCE / 1000000000)) SOL${NC}"

# Request airdrop if balance is low
if [ "$BALANCE" -lt "$REQUIRED_BALANCE" ]; then
    echo -e "${YELLOW}💧 Balance too low, requesting airdrop...${NC}"
    solana airdrop 5
    
    # Wait for confirmation
    echo "⏳ Waiting for airdrop confirmation..."
    sleep 10
    
    NEW_BALANCE=$(solana balance --lamports)
    echo -e "${GREEN}✅ New balance: $((NEW_BALANCE / 1000000000)) SOL${NC}"
fi

# Build the program
echo -e "${BLUE}🔨 Building Anchor program...${NC}"
if ! anchor build; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Deploy the program
echo -e "${BLUE}🚀 Deploying to devnet...${NC}"
if ! anchor deploy --provider.cluster devnet; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "This might be due to:"
    echo "1. Insufficient balance (need ~3-5 SOL)"
    echo "2. Network issues"
    echo "3. Program size too large"
    exit 1
fi

# Get the deployed program ID
PROGRAM_ID=$(anchor keys list | grep fundr | awk '{print $2}')

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}📋 Program ID: ${PROGRAM_ID}${NC}"

# Update the frontend with the real program ID
echo -e "${BLUE}🔄 Updating frontend configuration...${NC}"

# Update fundr-program.ts with real program ID
sed -i.bak "s/export const FUNDR_PROGRAM_ID = new PublicKey('.*');/export const FUNDR_PROGRAM_ID = new PublicKey('${PROGRAM_ID}');/" client/src/lib/fundr-program.ts

# Create deployment info file
cat > deployment-info.json << EOF
{
  "network": "devnet",
  "programId": "${PROGRAM_ID}",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployer": "$(solana address)",
  "balance": "$(($(solana balance --lamports) / 1000000000)) SOL",
  "rpcUrl": "https://api.devnet.solana.com"
}
EOF

echo -e "${GREEN}✅ Frontend updated with program ID${NC}"
echo -e "${GREEN}💾 Deployment info saved to deployment-info.json${NC}"

# Test the deployed program
echo -e "${BLUE}🧪 Testing program deployment...${NC}"

# Check if the program account exists
if solana account "${PROGRAM_ID}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Program account verified on devnet${NC}"
else
    echo -e "${RED}❌ Program account not found${NC}"
    exit 1
fi

# Final summary
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "========================"
echo -e "📋 Program ID: ${GREEN}${PROGRAM_ID}${NC}"
echo -e "🌐 Network: ${GREEN}devnet${NC}"
echo -e "💰 Remaining balance: ${GREEN}$(($(solana balance --lamports) / 1000000000)) SOL${NC}"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. Restart your development server"
echo "2. Connect wallet in the frontend"
echo "3. Test fund creation and operations"
echo "4. Monitor transactions on Solana Explorer:"
echo "   https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- This is deployed to DEVNET only"
echo "- Use only test SOL (has no real value)"
echo "- Program can be upgraded with: anchor upgrade"