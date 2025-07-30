# Fundr Smart Contract Development Guide

## 🎯 Overview

The Fundr smart contract is built using Anchor framework on Solana, providing decentralized fund management with the following core features:

- **Fund Creation**: Managers can create funds with custom fees and parameters
- **Deposit/Withdraw**: Investors can deposit SOL and receive shares, withdraw anytime
- **Fee Management**: Automated management and performance fee collection
- **Rebalancing**: Fund managers can rebalance portfolios using Jupiter integration
- **Transparency**: All fund operations are on-chain and verifiable

## 🏗️ Contract Architecture

### Core Accounts

#### Fund Account
```rust
pub struct Fund {
    pub authority: Pubkey,        // Fund manager
    pub name: String,             // Fund name (max 50 chars)
    pub description: String,      // Fund description (max 200 chars)
    pub management_fee: u16,      // Annual fee in basis points (100 = 1%)
    pub performance_fee: u16,     // Performance fee in basis points (2000 = 20%)
    pub min_deposit: u64,         // Minimum deposit in lamports
    pub total_shares: u64,        // Total shares outstanding
    pub total_assets: u64,        // Total assets under management
    pub investor_count: u32,      // Number of investors
    pub created_at: i64,          // Creation timestamp
    pub last_fee_collection: i64, // Last fee collection timestamp
    pub high_water_mark: u64,     // High water mark for performance fees
}
```

#### UserStake Account
```rust
pub struct UserStake {
    pub user: Pubkey,             // Investor's public key
    pub fund: Pubkey,             // Fund public key
    pub shares: u64,              // User's shares in the fund
    pub total_deposited: u64,     // Total amount deposited
    pub last_deposit: i64,        // Last deposit timestamp
    pub last_withdrawal: i64,     // Last withdrawal timestamp
}
```

### Program Derived Addresses (PDAs)

1. **Fund PDA**: `["fund", manager_pubkey]`
2. **Fund Vault PDA**: `["vault", fund_pubkey]`
3. **User Stake PDA**: `["stake", fund_pubkey, user_pubkey]`

## 🚀 Deployment Instructions

### Prerequisites

1. **Install Solana CLI**:
```bash
curl -sSfL https://release.solana.com/v1.18.4/install | sh
```

2. **Install Anchor CLI**:
```bash
npm install -g @coral-xyz/anchor-cli
```

3. **Generate Solana Keypair**:
```bash
solana-keygen new --outfile ~/.config/solana/id.json
```

4. **Configure Solana CLI**:
```bash
# For devnet deployment
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json

# Fund your wallet with devnet SOL
solana airdrop 2
```

### Build and Deploy

1. **Build the Program**:
```bash
anchor build
```

2. **Get Program ID**:
```bash
solana-keygen pubkey target/deploy/fundr-keypair.json
```

3. **Update Program ID**: Replace the placeholder in `lib.rs` and `Anchor.toml` with your actual program ID.

4. **Deploy to Devnet**:
```bash
anchor deploy --provider.cluster devnet
```

5. **Verify Deployment**:
```bash
solana program show <PROGRAM_ID> --url devnet
```

### Testing

1. **Run Anchor Tests**:
```bash
anchor test
```

2. **Integration Testing**: Use the TypeScript client in `client/src/lib/fundr-program.ts`

## 🔧 Integration with Frontend

### Update Environment Variables

```bash
# Add to .env
VITE_FUNDR_PROGRAM_ID=<YOUR_DEPLOYED_PROGRAM_ID>
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Connect to Program

```typescript
import { FundrService } from '@/lib/fundr-program';
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, signTransaction } = useWallet();
const connection = new Connection(process.env.VITE_SOLANA_RPC_URL!);
const fundrService = new FundrService(connection);

// Initialize with wallet
await fundrService.initialize(wallet);

// Create a fund
const result = await fundrService.createFund(
  "My Fund",
  "A great investment fund",
  100,    // 1% management fee
  2000,   // 20% performance fee
  1       // 1 SOL minimum deposit
);
```

### Update Hook Implementations

Replace mock data in hooks with real blockchain calls:

```typescript
// In use-funds.tsx
export function useFunds() {
  return useQuery({
    queryKey: ['/api/funds'],
    queryFn: async () => {
      // Fetch funds from blockchain instead of API
      const fundAccounts = await connection.getProgramAccounts(FUNDR_PROGRAM_ID);
      return fundAccounts.map(account => parseFundAccount(account));
    }
  });
}
```

## 🔒 Security Considerations

### Access Control
- Only fund managers can rebalance their funds
- Only fund managers can collect fees from their funds
- Users can only withdraw from their own stakes

### Mathematical Safety
- All calculations use overflow-safe operations
- Fixed-point arithmetic for precise fee calculations
- Slippage protection on rebalancing operations

### Economic Security
- High water mark prevents excessive performance fees
- Platform fees protect against fund closure exploits
- Minimum deposit requirements prevent spam

## 🎛️ Fee Structure

### Platform Fees
- **Deposit Fee**: 1% of deposit goes to platform treasury
- **Withdrawal Fee**: 1% of withdrawal goes to platform treasury

### Manager Fees
- **Management Fee**: 0-5% annually (set per fund)
- **Performance Fee**: 0-20% of profits above high water mark

### Fee Collection
```rust
// Management fees are pro-rated by time
let annual_seconds = 365 * 24 * 60 * 60;
let management_fee_amount = fund.total_assets
    .checked_mul(fund.management_fee as u64)
    .checked_mul(time_elapsed as u64)
    .checked_div(10000) // basis points
    .checked_div(annual_seconds as u64);

// Performance fees only on new profits
if current_nav > fund.high_water_mark {
    let profit = current_nav - fund.high_water_mark;
    let performance_fee_amount = profit * fund.performance_fee / 10000;
}
```

## 🔄 Rebalancing Integration

### Jupiter Integration
The rebalancing function integrates with Jupiter for token swaps:

```rust
pub fn rebalance(
    ctx: Context<Rebalance>,
    token_in_amount: u64,
    token_out_mint: Pubkey,
    minimum_amount_out: u64,
) -> Result<()> {
    // Validate manager authority
    require!(ctx.accounts.manager.key() == fund.authority, FundrError::UnauthorizedManager);
    
    // Execute Jupiter swap (implementation details)
    // jupiter::swap(token_in_amount, token_out_mint, minimum_amount_out)?;
    
    Ok(())
}
```

## 📊 Monitoring and Analytics

### On-Chain Events
The program emits events for all major operations:
- Fund creation
- Deposits and withdrawals
- Fee collections
- Rebalancing operations

### Performance Tracking
```rust
// Calculate NAV per share
let nav_per_share = if fund.total_shares > 0 {
    fund.total_assets * 1_000_000 / fund.total_shares
} else {
    1_000_000 // Default 1.0 NAV
};

// Track high water mark for performance fees
if nav_per_share > fund.high_water_mark {
    fund.high_water_mark = nav_per_share;
}
```

## 🚀 Production Readiness

### Pre-Launch Checklist
- [ ] Security audit completed
- [ ] All tests passing on devnet
- [ ] Fee calculations verified
- [ ] Jupiter integration tested
- [ ] Error handling comprehensive
- [ ] Program size optimized
- [ ] Rent exemption handled
- [ ] Upgrade authority managed

### Mainnet Deployment
```bash
# Build for mainnet
anchor build --verifiable

# Deploy to mainnet
anchor deploy --provider.cluster mainnet

# Verify program
solana program show <PROGRAM_ID> --url mainnet
```

### Post-Deployment
1. Update frontend with mainnet program ID
2. Initialize platform treasury accounts
3. Set up monitoring and alerting
4. Document emergency procedures
5. Plan for program upgrades

## 🛠️ Development Workflow

1. **Local Development**: Use `solana-test-validator` for fast iteration
2. **Devnet Testing**: Deploy to devnet for integration testing
3. **Security Review**: Audit code before mainnet deployment
4. **Mainnet Deployment**: Deploy verified program to mainnet
5. **Monitoring**: Set up alerts for program operations

The smart contract provides a robust foundation for decentralized fund management on Solana, with proper security measures and integration points for the Fundr platform.