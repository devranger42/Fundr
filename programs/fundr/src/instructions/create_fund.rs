use anchor_lang::prelude::*;
use crate::state::{Fund, FundType, TokenAllocation};
use crate::errors::FundrError;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateFund<'info> {
    #[account(
        init,
        payer = manager,
        space = Fund::MAX_SIZE,
        seeds = [b"fund", manager.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub fund: Account<'info, Fund>,

    #[account(mut)]
    pub manager: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_fund(
    ctx: Context<CreateFund>,
    name: String,
    description: String,
    fund_type: FundType,
    manager_fee: u16,
    initial_allocations: Vec<TokenAllocation>,
) -> Result<()> {
    require!(name.len() <= 50, FundrError::NameTooLong);
    require!(description.len() <= 200, FundrError::DescriptionTooLong);
    require!(manager_fee <= 2000, FundrError::ManagerFeeTooHigh); // max 20%
    require!(initial_allocations.len() <= 10, FundrError::TooManyAllocations);

    let fund = &mut ctx.accounts.fund;
    
    // Validate allocations total <= 100%
    let total_allocation: u32 = initial_allocations.iter()
        .map(|a| a.percentage as u32)
        .sum();
    require!(total_allocation <= 10000, FundrError::InvalidAllocation);

    fund.manager = ctx.accounts.manager.key();
    fund.fund_type = fund_type;
    fund.manager_fee = manager_fee;
    fund.total_deposited = 0;
    fund.total_shares = 0;
    fund.allocations = initial_allocations;
    fund.name = name;
    fund.description = description;
    fund.is_active = true;
    fund.created_at = Clock::get()?.unix_timestamp;
    fund.bump = ctx.bumps.fund;

    emit!(FundCreated {
        fund: fund.key(),
        manager: fund.manager,
        fund_type: fund.fund_type.clone(),
        manager_fee: fund.manager_fee,
    });

    Ok(())
}

#[event]
pub struct FundCreated {
    pub fund: Pubkey,
    pub manager: Pubkey,
    pub fund_type: FundType,
    pub manager_fee: u16,
}