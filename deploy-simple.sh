#!/bin/bash

# Simple Solana program deployment script
# Bypasses Anchor CLI issues by using direct solana CLI commands

set -e

echo "🚀 Fundr Program Deployment to Devnet (Simple Mode)"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configure Solana for devnet
echo -e "${BLUE}🔧 Configuring Solana CLI for devnet...${NC}"
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json

# Check balance and request airdrop if needed
BALANCE=$(solana balance --lamports)
REQUIRED_BALANCE=3000000000  # 3 SOL in lamports

echo -e "${BLUE}💰 Current balance: $((BALANCE / 1000000000)) SOL${NC}"

if [ "$BALANCE" -lt "$REQUIRED_BALANCE" ]; then
    echo -e "${YELLOW}💧 Balance low, requesting airdrop...${NC}"
    solana airdrop 3
    sleep 5
    NEW_BALANCE=$(solana balance --lamports)
    echo -e "${GREEN}✅ New balance: $((NEW_BALANCE / 1000000000)) SOL${NC}"
fi

# Create a simple program build using cargo
echo -e "${BLUE}🔨 Building Rust program...${NC}"
cd programs/fundr

# Build the program using cargo
cargo build-bpf --manifest-path Cargo.toml --bpf-out-dir ../../target/deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed - trying alternative approach${NC}"
    
    # Try with solana build tools
    solana install
    cargo install cargo-build-sbf
    cargo build-sbf --manifest-path Cargo.toml --sbf-out-dir ../../target/deploy
fi

cd ../..

# Check if the program binary was created
if [ ! -f "target/deploy/fundr.so" ]; then
    echo -e "${RED}❌ Program binary not found. Build may have failed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Program built successfully!${NC}"

# Generate a new program keypair
echo -e "${BLUE}🔑 Generating program keypair...${NC}"
solana-keygen new --outfile target/deploy/fundr-keypair.json --force --no-bip39-passphrase

# Get the program ID
PROGRAM_ID=$(solana-keygen pubkey target/deploy/fundr-keypair.json)
echo -e "${GREEN}📋 Program ID: ${PROGRAM_ID}${NC}"

# Deploy the program
echo -e "${BLUE}🚀 Deploying program to devnet...${NC}"
solana program deploy target/deploy/fundr.so --keypair target/deploy/fundr-keypair.json --url devnet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}📋 Program ID: ${PROGRAM_ID}${NC}"
    
    # Update the frontend configuration
    echo -e "${BLUE}🔄 Updating frontend configuration...${NC}"
    
    # Update fundr-program.ts with real program ID
    if [ -f "client/src/lib/fundr-program.ts" ]; then
        sed -i.bak "s/export const FUNDR_PROGRAM_ID = new PublicKey('.*');/export const FUNDR_PROGRAM_ID = new PublicKey('${PROGRAM_ID}');/" client/src/lib/fundr-program.ts
        echo -e "${GREEN}✅ Updated frontend with program ID${NC}"
    fi
    
    # Create deployment info file
    cat > DEPLOYMENT_INFO.md << EOF
# Fundr Program Deployment Info

## Program Details
- **Program ID**: \`${PROGRAM_ID}\`
- **Network**: Devnet
- **Deployment Date**: $(date)
- **Deployer**: $(solana address)

## Program Capabilities
- Fund creation and management
- Investor deposits and withdrawals
- Share-based proportional ownership
- Management and performance fee collection
- SOL rent reclamation for managers

## Frontend Integration
The frontend has been updated with the real program ID and is ready for testing.

## Next Steps
1. Test fund creation through the web interface
2. Test deposit/withdrawal functionality
3. Verify fee collection works correctly
4. Test the rebalancing interface
EOF

    echo -e "${GREEN}✅ Created deployment documentation${NC}"
    echo -e "${GREEN}🎉 Fundr program is now live on Solana devnet!${NC}"
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi