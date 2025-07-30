use anchor_lang::prelude::*;
use crate::state::{Fund, UserStake, FundType};
use crate::errors::FundrError;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"fund", fund.manager.as_ref(), fund.name.as_bytes()],
        bump = fund.bump
    )]
    pub fund: Account<'info, Fund>,

    #[account(
        mut,
        seeds = [b"stake", fund.key().as_ref(), user.key().as_ref()],
        bump = user_stake.bump,
        constraint = user_stake.user == user.key() @ FundrError::Unauthorized
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Platform treasury for collecting fees
    #[account(mut)]
    pub platform_treasury: AccountInfo<'info>,

    /// CHECK: Fund manager for profit fees
    #[account(
        mut,
        constraint = manager.key() == fund.manager @ FundrError::Unauthorized
    )]
    pub manager: AccountInfo<'info>,
}

pub fn withdraw(ctx: Context<Withdraw>, shares_to_withdraw: u64) -> Result<()> {
    require!(shares_to_withdraw > 0, FundrError::InvalidAmount);
    require!(ctx.accounts.fund.is_active, FundrError::FundInactive);
    
    let fund = &mut ctx.accounts.fund;
    let user_stake = &mut ctx.accounts.user_stake;
    
    require!(user_stake.shares >= shares_to_withdraw, FundrError::InsufficientShares);

    // Calculate current fund value (simplified as SOL balance for now)
    let current_fund_value = fund.total_deposited;
    let share_value = fund.calculate_user_share_value(shares_to_withdraw, current_fund_value);

    // For auto allocation mode, we would need to sell tokens back to SOL first
    match fund.fund_type {
        FundType::Manual => {
            // Check if fund has enough SOL for withdrawal
            require!(
                ctx.accounts.fund.to_account_info().lamports() >= share_value,
                FundrError::InsufficientFundBalance
            );
        },
        FundType::Auto => {
            // TODO: Implement auto-sell logic using Jupiter
            // This would proportionally sell tokens to get SOL for withdrawal
        },
    }

    // Calculate profit and fees
    let proportional_initial_deposit = user_stake.initial_deposit * shares_to_withdraw / user_stake.shares;
    let profit = if share_value > proportional_initial_deposit {
        share_value - proportional_initial_deposit
    } else {
        0
    };

    // Calculate fees
    let platform_fee = crate::utils::calculate_platform_fee(share_value)?;
    let manager_fee = crate::utils::calculate_manager_fee(profit, fund.manager_fee)?;
    let net_withdrawal = share_value - platform_fee - manager_fee;

    // Transfer fees
    if platform_fee > 0 {
        **ctx.accounts.fund.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
        **ctx.accounts.platform_treasury.try_borrow_mut_lamports()? += platform_fee;
    }

    if manager_fee > 0 {
        **ctx.accounts.fund.to_account_info().try_borrow_mut_lamports()? -= manager_fee;
        **ctx.accounts.manager.try_borrow_mut_lamports()? += manager_fee;
    }

    // Transfer net withdrawal to user
    **ctx.accounts.fund.to_account_info().try_borrow_mut_lamports()? -= net_withdrawal;
    **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += net_withdrawal;

    // Update stake
    user_stake.shares -= shares_to_withdraw;
    if user_stake.shares == 0 {
        // Full withdrawal - reset stake
        user_stake.initial_deposit = 0;
    } else {
        // Partial withdrawal - proportionally reduce initial deposit
        user_stake.initial_deposit -= proportional_initial_deposit;
    }

    // Update fund
    fund.total_shares -= shares_to_withdraw;
    fund.total_deposited = fund.total_deposited.saturating_sub(proportional_initial_deposit);

    emit!(WithdrawalMade {
        fund: fund.key(),
        user: ctx.accounts.user.key(),
        shares_withdrawn: shares_to_withdraw,
        amount_received: net_withdrawal,
        platform_fee,
        manager_fee,
        profit,
    });

    Ok(())
}

#[event]
pub struct WithdrawalMade {
    pub fund: Pubkey,
    pub user: Pubkey,
    pub shares_withdrawn: u64,
    pub amount_received: u64,
    pub platform_fee: u64,
    pub manager_fee: u64,
    pub profit: u64,
}