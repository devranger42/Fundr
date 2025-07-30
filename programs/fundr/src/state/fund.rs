use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum FundType {
    Manual,
    Auto,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TokenAllocation {
    pub mint: Pubkey,
    pub percentage: u16, // basis points (0-10000 = 0-100%)
}

#[account]
pub struct Fund {
    pub manager: Pubkey,
    pub fund_type: FundType,
    pub manager_fee: u16, // basis points (0-2000 = 0-20%)
    pub total_deposited: u64, // total SOL deposited (in lamports)
    pub total_shares: u64, // total shares issued
    pub allocations: Vec<TokenAllocation>, // current token allocations
    pub name: String, // fund name (max 50 chars)
    pub description: String, // fund description (max 200 chars)
    pub is_active: bool, // fund can be paused
    pub created_at: i64,
    pub bump: u8,
}

impl Fund {
    pub const MAX_SIZE: usize = 8 + // discriminator
        32 + // manager
        1 + // fund_type
        2 + // manager_fee
        8 + // total_deposited
        8 + // total_shares
        4 + 32 * 10 * 34 + // allocations (max 10 tokens)
        4 + 50 + // name
        4 + 200 + // description
        1 + // is_active
        8 + // created_at
        1; // bump

    pub fn calculate_user_share_value(&self, user_shares: u64, current_fund_value: u64) -> u64 {
        if self.total_shares == 0 {
            return 0;
        }
        (user_shares as u128 * current_fund_value as u128 / self.total_shares as u128) as u64
    }

    pub fn calculate_shares_for_deposit(&self, deposit_amount: u64, current_fund_value: u64) -> u64 {
        if self.total_shares == 0 || current_fund_value == 0 {
            // First deposit: 1:1 ratio
            return deposit_amount;
        }
        (deposit_amount as u128 * self.total_shares as u128 / current_fund_value as u128) as u64
    }

    pub fn validate_allocations(&self) -> bool {
        let total: u32 = self.allocations.iter().map(|a| a.percentage as u32).sum();
        total <= 10000 // max 100%
    }
}