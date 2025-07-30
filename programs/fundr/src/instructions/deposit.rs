use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{Fund, UserStake, FundType};
use crate::errors::FundrError;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"fund", fund.manager.as_ref(), fund.name.as_bytes()],
        bump = fund.bump
    )]
    pub fund: Account<'info, Fund>,

    #[account(
        init_if_needed,
        payer = user,
        space = UserStake::MAX_SIZE,
        seeds = [b"stake", fund.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Platform treasury for collecting fees
    #[account(mut)]
    pub platform_treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, FundrError::InvalidAmount);
    require!(ctx.accounts.fund.is_active, FundrError::FundInactive);

    let fund = &mut ctx.accounts.fund;
    let user_stake = &mut ctx.accounts.user_stake;

    // Calculate 1% platform fee
    let platform_fee = crate::utils::calculate_platform_fee(amount)?;
    let net_deposit = amount - platform_fee;

    // Transfer platform fee to treasury
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.platform_treasury.to_account_info(),
            },
        ),
        platform_fee,
    )?;

    // Transfer net deposit to fund (SOL stays in fund account for manual mode)
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.fund.to_account_info(),
            },
        ),
        net_deposit,
    )?;

    // Calculate current fund value (for now, simplified as SOL balance)
    let current_fund_value = fund.total_deposited;
    
    // Calculate shares to issue
    let shares_to_issue = fund.calculate_shares_for_deposit(net_deposit, current_fund_value);

    // Initialize or update user stake
    if user_stake.shares == 0 {
        // First deposit for this user
        user_stake.user = ctx.accounts.user.key();
        user_stake.fund = fund.key();
        user_stake.initial_deposit = net_deposit;
        user_stake.entry_price = if fund.total_shares == 0 { 
            1_000_000_000 // 1 SOL per share initially
        } else { 
            current_fund_value * 1_000_000_000 / fund.total_shares 
        };
        user_stake.deposited_at = Clock::get()?.unix_timestamp;
        user_stake.bump = ctx.bumps.user_stake;
    } else {
        // Additional deposit - update weighted average entry price
        let total_new_shares = user_stake.shares + shares_to_issue;
        let total_new_deposit = user_stake.initial_deposit + net_deposit;
        user_stake.entry_price = total_new_deposit * 1_000_000_000 / total_new_shares;
        user_stake.initial_deposit = total_new_deposit;
    }

    user_stake.shares += shares_to_issue;
    fund.total_shares += shares_to_issue;
    fund.total_deposited += net_deposit;

    // For auto allocation mode, we would trigger swaps here
    // This is where Jupiter integration would occur
    match fund.fund_type {
        FundType::Manual => {
            // SOL stays as SOL, manager handles allocation manually
        },
        FundType::Auto => {
            // TODO: Implement auto-swap logic using Jupiter
            // This would proportionally buy tokens based on current allocations
        },
    }

    emit!(DepositMade {
        fund: fund.key(),
        user: ctx.accounts.user.key(),
        amount: net_deposit,
        shares_issued: shares_to_issue,
        platform_fee,
    });

    Ok(())
}

#[event]
pub struct DepositMade {
    pub fund: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub shares_issued: u64,
    pub platform_fee: u64,
}