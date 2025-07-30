use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;
pub mod utils;

use instructions::*;
use errors::*;
use state::{FundType, TokenAllocation};

declare_id!("7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe");

#[program]
pub mod fundr {
    use super::*;

    /// Create a new fund with specified type and parameters
    pub fn create_fund(
        ctx: Context<CreateFund>,
        name: String,
        description: String,
        fund_type: FundType,
        manager_fee: u16,
        initial_allocations: Vec<TokenAllocation>,
    ) -> Result<()> {
        instructions::create_fund(ctx, name, description, fund_type, manager_fee, initial_allocations)
    }

    /// Deposit SOL into a fund
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit(ctx, amount)
    }

    /// Withdraw proportional share from a fund
    pub fn withdraw(ctx: Context<Withdraw>, shares_to_withdraw: u64) -> Result<()> {
        instructions::withdraw(ctx, shares_to_withdraw)
    }

    /// Rebalance fund allocations (manager only)
    pub fn rebalance(
        ctx: Context<Rebalance>,
        new_allocations: Vec<TokenAllocation>,
    ) -> Result<()> {
        instructions::rebalance(ctx, new_allocations)
    }

    /// Update allocation after manual swap (for tracking)
    pub fn update_allocation_after_swap(
        ctx: Context<Rebalance>,
        token_mint: Pubkey,
        new_percentage: u16,
    ) -> Result<()> {
        instructions::update_allocation_after_swap(ctx, token_mint, new_percentage)
    }
}