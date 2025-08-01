# CRITICAL SECURITY FIX NEEDED

## 🚨 Current Security Issues:

1. **Manager can drain funds** through fee collection
2. **No trading restrictions** - Manager has direct SOL access
3. **No investor safeguards**

## 🛡️ Required Security Changes:

### 1. Remove Direct Fund Access
```rust
// REMOVE this dangerous code:
**ctx.accounts.fund_vault.to_account_info().try_borrow_mut_lamports()? -= total_fees;
**ctx.accounts.manager.to_account_info().try_borrow_mut_lamports()? += total_fees;
```

### 2. Implement Jupiter-Only Trading
- Manager can ONLY execute swaps through Jupiter
- No direct SOL transfers allowed
- All trades logged on-chain

### 3. Add Fee Protections
- Maximum fee caps (e.g., 2% management, 20% performance)
- Time-based fee collection (e.g., monthly only)
- Fee withdrawals require delay period

### 4. Add Emergency Controls
- Investor voting to remove malicious manager
- Emergency pause function
- Maximum withdrawal limits per period

## 📝 Safer Implementation:

```rust
pub fn execute_trade(
    ctx: Context<ExecuteTrade>,
    jupiter_swap_data: Vec<u8>, // Jupiter swap instruction
) -> Result<()> {
    // ONLY allow trading through Jupiter
    // NO direct transfers
    // All trades recorded on-chain
}

pub fn collect_fees(ctx: Context<CollectFees>) -> Result<()> {
    // Enforce maximum fees
    require!(fund.management_fee <= 200, FundrError::ExcessiveFees); // 2% max
    require!(fund.performance_fee <= 2000, FundrError::ExcessiveFees); // 20% max
    
    // Time-based collection
    let days_elapsed = (current_time - fund.last_fee_collection) / 86400;
    require!(days_elapsed >= 30, FundrError::FeeCooldown); // Monthly only
    
    // Store fees in escrow, not direct transfer
    fund.pending_fees += calculated_fees;
}
```

## ⚠️ DO NOT DEPLOY TO MAINNET WITHOUT THESE FIXES!

The current contract gives managers too much power and could result in loss of investor funds.