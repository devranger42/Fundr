use anchor_lang::prelude::*;

#[account]
pub struct UserStake {
    pub user: Pubkey,
    pub fund: Pubkey,
    pub shares: u64, // number of shares owned
    pub initial_deposit: u64, // original SOL deposited (for profit calculation)
    pub entry_price: u64, // share price at time of deposit
    pub deposited_at: i64,
    pub bump: u8,
}

impl UserStake {
    pub const MAX_SIZE: usize = 8 + // discriminator
        32 + // user
        32 + // fund
        8 + // shares
        8 + // initial_deposit
        8 + // entry_price
        8 + // deposited_at
        1; // bump

    pub fn calculate_profit(&self, current_share_value: u64) -> i64 {
        let current_value = self.shares * current_share_value;
        current_value as i64 - self.initial_deposit as i64
    }
}