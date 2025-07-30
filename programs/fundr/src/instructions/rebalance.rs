use anchor_lang::prelude::*;
use crate::state::{Fund, TokenAllocation};
use crate::errors::FundrError;

#[derive(Accounts)]
pub struct Rebalance<'info> {
    #[account(
        mut,
        seeds = [b"fund", fund.manager.as_ref(), fund.name.as_bytes()],
        bump = fund.bump,
        constraint = fund.manager == manager.key() @ FundrError::Unauthorized
    )]
    pub fund: Account<'info, Fund>,

    pub manager: Signer<'info>,
}

pub fn rebalance(
    ctx: Context<Rebalance>,
    new_allocations: Vec<TokenAllocation>,
) -> Result<()> {
    require!(ctx.accounts.fund.is_active, FundrError::FundInactive);
    require!(new_allocations.len() <= 10, FundrError::TooManyAllocations);

    let fund = &mut ctx.accounts.fund;

    // Validate new allocations
    let total_allocation: u32 = new_allocations.iter()
        .map(|a| a.percentage as u32)
        .sum();
    require!(total_allocation <= 10000, FundrError::InvalidAllocation);

    // Store old allocations for comparison
    let old_allocations = fund.allocations.clone();

    // Update fund allocations
    fund.allocations = new_allocations.clone();

    // TODO: Implement Jupiter swap logic here
    // This would:
    // 1. Calculate differences between old and new allocations
    // 2. Execute swaps to achieve new target allocations
    // 3. Update token account balances

    emit!(RebalanceExecuted {
        fund: fund.key(),
        manager: ctx.accounts.manager.key(),
        old_allocations,
        new_allocations,
    });

    Ok(())
}

pub fn update_allocation_after_swap(
    ctx: Context<Rebalance>,
    token_mint: Pubkey,
    new_percentage: u16,
) -> Result<()> {
    require!(ctx.accounts.fund.is_active, FundrError::FundInactive);
    require!(new_percentage <= 10000, FundrError::InvalidAllocation);

    let fund = &mut ctx.accounts.fund;

    // Find and update the specific token allocation
    if let Some(allocation) = fund.allocations.iter_mut().find(|a| a.mint == token_mint) {
        allocation.percentage = new_percentage;
    } else if new_percentage > 0 {
        // Add new token to allocations
        require!(fund.allocations.len() < 10, FundrError::TooManyAllocations);
        fund.allocations.push(TokenAllocation {
            mint: token_mint,
            percentage: new_percentage,
        });
    }

    // Validate total allocations still <= 100%
    require!(fund.validate_allocations(), FundrError::InvalidAllocation);

    emit!(AllocationUpdated {
        fund: fund.key(),
        token_mint,
        new_percentage,
    });

    Ok(())
}

#[event]
pub struct RebalanceExecuted {
    pub fund: Pubkey,
    pub manager: Pubkey,
    pub old_allocations: Vec<TokenAllocation>,
    pub new_allocations: Vec<TokenAllocation>,
}

#[event]
pub struct AllocationUpdated {
    pub fund: Pubkey,
    pub token_mint: Pubkey,
    pub new_percentage: u16,
}