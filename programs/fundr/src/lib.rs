use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("FundrProgram11111111111111111111111111111111");

#[program]
pub mod fundr {
    use super::*;

    /// Initialize a new fund
    pub fn initialize_fund(
        ctx: Context<InitializeFund>,
        name: String,
        description: String,
        management_fee: u16, // in basis points (e.g., 100 = 1%)
        performance_fee: u16, // in basis points (e.g., 2000 = 20%)
        min_deposit: u64,
        fund_mode: FundMode, // manual or auto allocation mode
    ) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        fund.authority = ctx.accounts.manager.key();
        fund.name = name;
        fund.description = description;
        fund.management_fee = management_fee;
        fund.performance_fee = performance_fee;
        fund.min_deposit = min_deposit;
        fund.fund_mode = fund_mode;
        fund.total_shares = 0;
        fund.total_assets = 0;
        fund.bump = ctx.bumps.fund;
        fund.created_at = Clock::get()?.unix_timestamp;
        fund.last_fee_collection = Clock::get()?.unix_timestamp;
        fund.high_water_mark = 1000000; // Start at 1.0 in fixed point
        
        msg!("Fund {} initialized by manager {}", fund.name, fund.authority);
        Ok(())
    }

    /// Deposit SOL into a fund and receive shares
    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
    ) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(amount >= fund.min_deposit, FundrError::AmountTooSmall);
        
        // Calculate platform fee (1%)
        let platform_fee = amount.checked_div(100).ok_or(FundrError::MathOverflow)?;
        let net_deposit = amount.checked_sub(platform_fee).ok_or(FundrError::MathOverflow)?;
        
        // Calculate shares to mint
        let shares_to_mint = if fund.total_shares == 0 {
            // First deposit: 1 SOL = 1M shares
            net_deposit.checked_mul(1_000_000).ok_or(FundrError::MathOverflow)?
        } else {
            // Subsequent deposits: shares = (deposit * total_shares) / total_assets
            net_deposit
                .checked_mul(fund.total_shares)
                .ok_or(FundrError::MathOverflow)?
                .checked_div(fund.total_assets)
                .ok_or(FundrError::MathOverflow)?
        };

        // Transfer SOL from user to fund vault
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.depositor.key(),
            &ctx.accounts.fund_vault.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.depositor.to_account_info(),
                ctx.accounts.fund_vault.to_account_info(),
            ],
        )?;

        // Update user stake
        user_stake.user = ctx.accounts.depositor.key();
        user_stake.fund = fund.key();
        user_stake.shares = user_stake.shares.checked_add(shares_to_mint).ok_or(FundrError::MathOverflow)?;
        user_stake.total_deposited = user_stake.total_deposited.checked_add(net_deposit).ok_or(FundrError::MathOverflow)?;
        user_stake.last_deposit = Clock::get()?.unix_timestamp;

        // Update fund totals
        fund.total_shares = fund.total_shares.checked_add(shares_to_mint).ok_or(FundrError::MathOverflow)?;
        fund.total_assets = fund.total_assets.checked_add(net_deposit).ok_or(FundrError::MathOverflow)?;
        fund.investor_count = fund.investor_count.checked_add(1).ok_or(FundrError::MathOverflow)?;

        msg!(
            "Deposited {} lamports, received {} shares. Fund now has {} total assets",
            net_deposit,
            shares_to_mint,
            fund.total_assets
        );

        Ok(())
    }

    /// Withdraw from fund by redeeming shares for SOL  
    pub fn withdraw(
        ctx: Context<Withdraw>,
        shares_to_redeem: u64,
    ) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(user_stake.shares >= shares_to_redeem, FundrError::InsufficientShares);
        
        // Calculate SOL amount to withdraw
        let withdrawal_amount = shares_to_redeem
            .checked_mul(fund.total_assets)
            .ok_or(FundrError::MathOverflow)?
            .checked_div(fund.total_shares)
            .ok_or(FundrError::MathOverflow)?;
        
        // Calculate withdrawal fee (1%)
        let withdrawal_fee = withdrawal_amount.checked_div(100).ok_or(FundrError::MathOverflow)?;
        let net_withdrawal = withdrawal_amount.checked_sub(withdrawal_fee).ok_or(FundrError::MathOverflow)?;

        // Transfer SOL from fund vault to user
        let fund_key = fund.key();
        let seeds = &[b"fund", fund_key.as_ref(), &[fund.bump]];
        let signer = &[&seeds[..]];

        **ctx.accounts.fund_vault.to_account_info().try_borrow_mut_lamports()? -= withdrawal_amount;
        **ctx.accounts.withdrawer.to_account_info().try_borrow_mut_lamports()? += net_withdrawal;

        // Update user stake
        user_stake.shares = user_stake.shares.checked_sub(shares_to_redeem).ok_or(FundrError::MathOverflow)?;
        user_stake.last_withdrawal = Clock::get()?.unix_timestamp;

        // Update fund totals
        fund.total_shares = fund.total_shares.checked_sub(shares_to_redeem).ok_or(FundrError::MathOverflow)?;
        fund.total_assets = fund.total_assets.checked_sub(withdrawal_amount).ok_or(FundrError::MathOverflow)?;

        if user_stake.shares == 0 {
            fund.investor_count = fund.investor_count.checked_sub(1).ok_or(FundrError::MathOverflow)?;
        }

        msg!(
            "Redeemed {} shares for {} lamports (net: {} after fees)",
            shares_to_redeem,
            withdrawal_amount,
            net_withdrawal
        );

        Ok(())
    }

    /// Manager rebalances fund by swapping tokens
    pub fn rebalance(
        ctx: Context<Rebalance>,
        token_in_amount: u64,
        token_out_mint: Pubkey,
        minimum_amount_out: u64,
    ) -> Result<()> {
        let fund = &ctx.accounts.fund;
        
        require!(ctx.accounts.manager.key() == fund.authority, FundrError::UnauthorizedManager);
        
        // Implementation would integrate with Jupiter for actual swaps
        // For now, we'll emit an event to be handled by the frontend
        
        msg!(
            "Manager {} rebalancing fund {}: swapping {} tokens for {}",
            fund.authority,
            fund.name,
            token_in_amount,
            token_out_mint
        );

        Ok(())
    }

    /// Collect management and performance fees
    pub fn collect_fees(ctx: Context<CollectFees>) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        
        require!(ctx.accounts.manager.key() == fund.authority, FundrError::UnauthorizedManager);
        
        let current_time = Clock::get()?.unix_timestamp;
        let time_elapsed = current_time - fund.last_fee_collection;
        
        // Calculate management fee (annual, pro-rated)
        let annual_seconds = 365 * 24 * 60 * 60;
        let management_fee_amount = fund.total_assets
            .checked_mul(fund.management_fee as u64)
            .ok_or(FundrError::MathOverflow)?
            .checked_mul(time_elapsed as u64)
            .ok_or(FundrError::MathOverflow)?
            .checked_div(10000) // basis points conversion
            .ok_or(FundrError::MathOverflow)?
            .checked_div(annual_seconds as u64)
            .ok_or(FundrError::MathOverflow)?;

        // Calculate performance fee if above high water mark
        let current_nav = if fund.total_shares > 0 {
            fund.total_assets
                .checked_mul(1000000)
                .ok_or(FundrError::MathOverflow)?
                .checked_div(fund.total_shares)
                .ok_or(FundrError::MathOverflow)?
        } else {
            1000000 // Default NAV of 1.0
        };

        let performance_fee_amount = if current_nav > fund.high_water_mark {
            let profit = current_nav - fund.high_water_mark;
            fund.total_assets
                .checked_mul(profit)
                .ok_or(FundrError::MathOverflow)?
                .checked_mul(fund.performance_fee as u64)
                .ok_or(FundrError::MathOverflow)?
                .checked_div(1000000) // NAV scaling
                .ok_or(FundrError::MathOverflow)?
                .checked_div(10000) // basis points
                .ok_or(FundrError::MathOverflow)?
        } else {
            0
        };

        let total_fees = management_fee_amount + performance_fee_amount;

        if total_fees > 0 {
            // Transfer fees to manager
            **ctx.accounts.fund_vault.to_account_info().try_borrow_mut_lamports()? -= total_fees;
            **ctx.accounts.manager.to_account_info().try_borrow_mut_lamports()? += total_fees;

            fund.total_assets = fund.total_assets.checked_sub(total_fees).ok_or(FundrError::MathOverflow)?;
            
            if performance_fee_amount > 0 {
                fund.high_water_mark = current_nav;
            }
        }

        fund.last_fee_collection = current_time;

        msg!(
            "Collected {} lamports in fees (mgmt: {}, perf: {})",
            total_fees,
            management_fee_amount,
            performance_fee_amount
        );

        Ok(())
    }

    pub fn update_fund_mode(ctx: Context<UpdateFundMode>, new_mode: FundMode) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        
        // Only the fund manager can update the mode
        require_keys_eq!(fund.authority, ctx.accounts.manager.key(), FundrError::Unauthorized);
        
        fund.fund_mode = new_mode;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateFundMode<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    pub manager: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeFund<'info> {
    #[account(
        init,
        payer = manager,
        space = 8 + Fund::INIT_SPACE,
        seeds = [b"fund", manager.key().as_ref()],
        bump
    )]
    pub fund: Account<'info, Fund>,
    
    #[account(
        mut,
        seeds = [b"vault", fund.key().as_ref()],
        bump
    )]
    /// CHECK: Fund vault PDA for holding SOL
    pub fund_vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub manager: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    
    #[account(
        init_if_needed,
        payer = depositor,
        space = 8 + UserStake::INIT_SPACE,
        seeds = [b"stake", fund.key().as_ref(), depositor.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(
        mut,
        seeds = [b"vault", fund.key().as_ref()],
        bump
    )]
    /// CHECK: Fund vault PDA
    pub fund_vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    
    #[account(
        mut,
        seeds = [b"stake", fund.key().as_ref(), withdrawer.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(
        mut,
        seeds = [b"vault", fund.key().as_ref()],
        bump
    )]
    /// CHECK: Fund vault PDA
    pub fund_vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub withdrawer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Rebalance<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    
    #[account(mut)]
    pub manager: Signer<'info>,
    
    /// CHECK: Token accounts for rebalancing will be validated in instruction
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CollectFees<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    
    #[account(
        mut,
        seeds = [b"vault", fund.key().as_ref()],
        bump
    )]
    /// CHECK: Fund vault PDA
    pub fund_vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub manager: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Fund {
    pub authority: Pubkey,      // Fund manager
    #[max_len(50)]
    pub name: String,           // Fund name
    #[max_len(200)]
    pub description: String,    // Fund description
    pub management_fee: u16,    // Annual management fee in basis points
    pub performance_fee: u16,   // Performance fee in basis points
    pub min_deposit: u64,       // Minimum deposit amount in lamports
    pub fund_mode: FundMode,    // Manual or auto allocation mode
    pub total_shares: u64,      // Total shares outstanding
    pub total_assets: u64,      // Total assets under management (lamports)
    pub investor_count: u32,    // Number of investors
    pub bump: u8,               // PDA bump
    pub created_at: i64,        // Unix timestamp of creation
    pub last_fee_collection: i64, // Last fee collection timestamp
    pub high_water_mark: u64,   // High water mark for performance fees (fixed point)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum FundMode {
    Manual, // Manager manually allocates deposits (SOL accumulates)
    Auto,   // Deposits auto-allocate to current token ratios
}

#[account]
#[derive(InitSpace)]
pub struct UserStake {
    pub user: Pubkey,           // User's public key
    pub fund: Pubkey,           // Fund public key
    pub shares: u64,            // User's shares in the fund
    pub total_deposited: u64,   // Total amount deposited (for tracking)
    pub last_deposit: i64,      // Last deposit timestamp
    pub last_withdrawal: i64,   // Last withdrawal timestamp
}

#[error_code]
pub enum FundrError {
    #[msg("Amount is too small for minimum deposit requirement")]
    AmountTooSmall,
    #[msg("Insufficient shares for withdrawal")]
    InsufficientShares,
    #[msg("Only the fund manager can perform this action")]
    UnauthorizedManager,
    #[msg("Mathematical operation resulted in overflow")]
    MathOverflow,
    #[msg("Invalid token mint provided")]
    InvalidTokenMint,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
}