use anchor_lang::prelude::*;

pub const PLATFORM_FEE_BPS: u16 = 100; // 1%
pub const MAX_MANAGER_FEE_BPS: u16 = 2000; // 20%
pub const BASIS_POINTS_DIVISOR: u16 = 10000; // 100%

/// Calculate platform fee (1% of amount)
pub fn calculate_platform_fee(amount: u64) -> Result<u64> {
    amount
        .checked_mul(PLATFORM_FEE_BPS as u64)
        .and_then(|x| x.checked_div(BASIS_POINTS_DIVISOR as u64))
        .ok_or(crate::errors::FundrError::ArithmeticOverflow.into())
}

/// Calculate manager fee on profit only
pub fn calculate_manager_fee(profit: u64, manager_fee_bps: u16) -> Result<u64> {
    profit
        .checked_mul(manager_fee_bps as u64)
        .and_then(|x| x.checked_div(BASIS_POINTS_DIVISOR as u64))
        .ok_or(crate::errors::FundrError::ArithmeticOverflow.into())
}